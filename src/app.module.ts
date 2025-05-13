import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from '../prisma/prisma.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NoticesModule } from './notices/notices.module';
import { AlbumsModule } from './albums/albums.module';
import { GeneratorModule } from './generator/generator.module';
import { AttachmentModule } from './attachments/attachments.module';
import { UploadModule } from './uploads/uploads.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    NoticesModule,
    AlbumsModule,
    GeneratorModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AttachmentModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
