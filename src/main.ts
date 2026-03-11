import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { HttpExceptionFilter } from '@core/http_exception';
import { COOKIE_SECRET, ORIGINS } from '@core/constants';
import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    autoFlushLogs: true,
    abortOnError: false,
    bufferLogs: true,
    rawBody: true
  });

  app.set("trusts proxy", 1);
  app.setGlobalPrefix("api");

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({ type: VersioningType.URI });

  app.useBodyParser("urlencoded", { extended: true });
  app.useBodyParser("json", { limit: "50mb" });

  app.use(cookieParser(COOKIE_SECRET));

  app.enableCors({
    origin: ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
