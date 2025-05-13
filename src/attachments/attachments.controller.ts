import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CosService } from '../common/services/cos.service';

@ApiTags('文件访问')
@Controller('attachments')
export class AttachmentController {
  constructor(private cosService: CosService) {}

  @Get('*path')
  @ApiOperation({ summary: '获取文件（对象存储）' })
  async redirectToFile(@Param('path') path: string, @Res() res: Response) {
    try {
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      const exists = await this.cosService.fileExists(normalizedPath);

      if (!exists) {
        return res.status(404).send('File Not Found');
      }

      const fileUrl = this.cosService.getObjectUrl(normalizedPath);
      return res.redirect(302, fileUrl);
    } catch (error) {
      return res.status(404).send('File Not Found');
    }
  }
}
