import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string, ip: string, userAgent?: string, device?: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.active) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const ok = await argon2.verify(admin.passwordHash, password);
    if (!ok) {
      await this.audit.log({
        userId: admin.id, userEmail: email, action: 'LOGIN', resource: 'auth',
        metadata: { success: false, ip, reason: 'bad_password' },
      });
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    // Tokens
    const accessToken = await this.jwt.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      { expiresIn: this.config.get('JWT_ACCESS_TTL') + 's' },
    );

    const refreshTokenRaw = uuid() + uuid();
    const refreshTokenHash = await argon2.hash(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + Number(this.config.get('JWT_REFRESH_TTL')) * 1000);

    await this.prisma.adminRefreshToken.create({
      data: {
        userId: admin.id,
        tokenHash: refreshTokenHash,
        device: device || userAgent,
        ipAddress: ip,
        expiresAt,
      },
    });

    await this.audit.log({
      userId: admin.id, userEmail: email, action: 'LOGIN', resource: 'auth',
      ipAddress: ip, userAgent, metadata: { success: true, device },
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: Number(this.config.get('JWT_ACCESS_TTL')),
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        avatar: admin.avatar,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  async refresh(refreshToken: string, ip: string) {
    // Find candidate tokens and verify
    const candidates = await this.prisma.adminRefreshToken.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
    });
    for (const c of candidates) {
      if (await argon2.verify(c.tokenHash, refreshToken)) {
        const admin = await this.prisma.adminUser.findUnique({ where: { id: c.userId } });
        if (!admin || !admin.active) throw new UnauthorizedException();

        const accessToken = await this.jwt.signAsync(
          { sub: admin.id, email: admin.email, role: admin.role },
          { expiresIn: this.config.get('JWT_ACCESS_TTL') + 's' },
        );
        return { accessToken, expiresIn: Number(this.config.get('JWT_ACCESS_TTL')) };
      }
    }
    throw new UnauthorizedException('رمز التحديث غير صالح');
  }

  async logout(userId: string, ip: string) {
    await this.prisma.adminRefreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.log({
      userId, action: 'LOGOUT', resource: 'auth', ipAddress: ip,
    });
  }

  async me(userId: string) {
    return this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, avatar: true, lastLoginAt: true },
    });
  }
}