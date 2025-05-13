import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CosService } from '../common/services/cos.service';

@ApiTags('文件访问')
@Controller('attachments')
export class AttachmentController {
  constructor(private cosService: CosService) {}

  @Get('*')
  @ApiOperation({ summary: '获取文件（对象存储）' })
  async redirectToFile(@Req() req: Request, @Res() res: Response) {
    try {
      const fullPath = req.path;
      const filePath = fullPath.replace(/^\/attachments\/?/, '');

      if (!filePath) {
        return res.status(400).send('Missing file path');
      }

      const exists = await this.cosService.fileExists(filePath);

      if (!exists) {
        return res.status(404).send('File Not Found');
      }

      const fileUrl = this.cosService.getObjectUrl(filePath);
      return res.redirect(302, fileUrl);
    } catch (error) {
      return res.status(404).send('File Not Found');
    }
  }
}
