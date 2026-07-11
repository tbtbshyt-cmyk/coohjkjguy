import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_ERROR';
    let message = 'حدث خطأ في الخادم';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse() as any;
      error = r.error || this.mapStatus(status);
      message = r.message || message;
      details = r.details;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const map: Record<string, [number, string]> = {
        P2002: [409, 'CONFLICT'],
        P2025: [404, 'NOT_FOUND'],
        P2003: [422, 'FOREIGN_KEY'],
      };
      const m = map[exception.code] || [400, 'BAD_REQUEST'];
      status = m[0];
      error = m[1];
      message = this.prismaMessage(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = 422;
      error = 'VALIDATION_ERROR';
      message = 'بيانات غير صالحة';
    }

    if (status >= 500) this.logger.error(exception);
    else this.logger.warn(`${status} ${req.method} ${req.url} — ${message}`);

    res.status(status).json({
      statusCode: status,
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: (req.headers['x-request-id'] as string) || null,
    });
  }

  private mapStatus(s: number): string {
    return ({
      400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN',
      404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED', 500: 'INTERNAL_ERROR', 503: 'SERVICE_UNAVAILABLE',
    } as any)[s] || 'ERROR';
  }

  private prismaMessage(e: Prisma.PrismaClientKnownRequestError): string {
    if (e.code === 'P2002') {
      const target = (e.meta?.target as string[])?.join(', ') || 'field';
      return `القيمة موجودة مسبقاً في ${target}`;
    }
    if (e.code === 'P2025') return 'العنصر غير موجود';
    return e.message;
  }
}