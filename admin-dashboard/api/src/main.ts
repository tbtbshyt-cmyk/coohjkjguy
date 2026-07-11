import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  // Security
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cookieParser());

  // CORS — allow Next.js web + Flutter (mobile has no origin)
  const origins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Token', 'Accept-Language'],
    exposedHeaders: ['X-Request-Id', 'X-Rate-Limit-Remaining'],
    maxAge: 86400,
  });

  // Global pipes / filters / interceptors
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // API versioning
  app.setGlobalPrefix(process.env.API_PREFIX || '/api/v1/abecp', {
    exclude: ['health', 'docs'],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // OpenAPI / Swagger docs
  const config = new DocumentBuilder()
    .setTitle('أبو بشار API')
    .setDescription('Unified REST API for أبو بشار — serves Next.js web + Flutter mobile')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Guest-Token', in: 'header' }, 'guest-token')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc, { swaggerOptions: { persistAuthorization: true } });

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 أبو بشار API listening on http://0.0.0.0:${port}${process.env.API_PREFIX}`);
}

bootstrap();