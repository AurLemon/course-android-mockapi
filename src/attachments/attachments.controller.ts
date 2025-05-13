import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CosService } from '../common/services/cos.service';

@ApiTags('文件访问')
@Controller('attachments')
export class AttachmentController {
  constructor(private cosService: CosService) {}

  @Get('*filePath')
  @ApiOperation({ summary: '获取文件（对象存储）' })
  async redirectToFile(
    @Param('filePath') filePath: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!filePath) {
        return res.status(400).send('Missing file path');
      }
      const fixedPath = filePath.replace(/,/g, '/');
      const decodedPath = decodeURIComponent(fixedPath);

      const exists = await this.cosService.fileExists(decodedPath);

      if (!exists) {
        return res.status(404).send('File Not Found');
      }

      const fileUrl = this.cosService.getObjectUrl(decodedPath);
      return res.redirect(302, fileUrl);
    } catch (error) {
      return res.status(404).send('File Not Found');
    }
  }
}
