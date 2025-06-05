import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['/attachments/(.*)'],
  });

  const swaggerPublicPath = join(process.cwd(), 'swagger-static');
  app.use(
    '/swagger-static',
    express.static(swaggerPublicPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.type('application/javascript');
        }
      },
    }),
  );

  const publicPath = join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Course Android Mock API')
    .setDescription('移动应用开发课程（Android）模拟 API。')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    customJs: ['/swagger-static/main.js'],
    customCssUrl: '/swagger-static/styles.css',
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.use(compression());

  app.enableCors();

  app.use((req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/docs') ||
      req.path.startsWith('/attachment') ||
      req.path.startsWith('/upload')
    ) {
      next();
    } else {
      try {
        res.sendFile(join(process.cwd(), 'public', 'index.html'));
      } catch (error) {
        res.status(404).send('Not Found');
      }
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
