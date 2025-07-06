import { initializeTransactionalContext } from 'typeorm-transactional';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/filters/AllExceptionsFilter';
import { HttpLoggingInterceptor } from '@shared/interceptors/HttpLoggingInterceptor';
import CLIENT_URL_WHITELIST from '@shared/config/ClientURLWhitelist';
import { IS_PRODUCTION } from '@shared/config/config';
import { initializeSwaggerDocument } from '@shared/config/swagger.config';
import { AppModule } from './AppModule';

async function bootstrap(): Promise<void> {
  process.env.TZ = 'Asia/Seoul';

  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  if (!IS_PRODUCTION) {
    initializeSwaggerDocument(app);
  }

  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, false);
        return;
      }

      const isAllowed = CLIENT_URL_WHITELIST.some((pattern: unknown) => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return origin === pattern;
      });

      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(80);
}
bootstrap().then();
