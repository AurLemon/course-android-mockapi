import { Module } from '@nestjs/common';
import { AttachmentController } from './attachments.controller';
import { ConfigModule } from '@nestjs/config';
import { CosService } from '../common/services/cos.service';

@Module({
  imports: [ConfigModule],
  controllers: [AttachmentController],
  providers: [CosService],
})
export class AttachmentModule {}
