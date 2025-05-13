import { Module } from '@nestjs/common';
import { UploadController } from './uploads.controller';
import { ConfigModule } from '@nestjs/config';
import { CosService } from '../common/services/cos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [CosService, JwtAuthGuard, RolesGuard],
})
export class UploadModule {}
