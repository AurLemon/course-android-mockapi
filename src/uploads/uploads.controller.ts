import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CosService } from '../common/services/cos.service';
import {
  UploadFileDto,
  ModifyFileDto,
  FileListResponseDto,
  FileResponseDto,
} from './dto/uploads.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';

@ApiTags('文件管理')
@Controller('uploads')
export class UploadController {
  constructor(private cosService: CosService) {}

  @Get('list')
  @ApiOperation({ summary: '获取文件列表' })
  @ApiSuccessResponse(FileListResponseDto, { description: '文件列表' })
  async getFileList(@Query('folder') folder?: string) {
    try {
      const prefix = folder
        ? folder.startsWith('/')
          ? folder.substring(1)
          : folder
        : '';

      const folderPrefix =
        prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;

      const files = await this.cosService.listFiles(folderPrefix);

      return {
        files,
        total: files.length,
      };
    } catch (error) {
      throw new BadRequestException(`获取文件列表失败: ${error.message}`);
    }
  }

  @Put('file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(0)
  @ApiOperation({ summary: '上传文件（管理员）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: '/',
        },
      },
    },
  })
  @ApiSuccessResponse(FileResponseDto, { description: '文件上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    try {
      const folder = uploadDto.folder || '/';
      const normalizedFolder = folder.startsWith('/')
        ? folder.substring(1)
        : folder;
      const folderWithSlash = normalizedFolder.endsWith('/')
        ? normalizedFolder
        : `${normalizedFolder}/`;

      const extname = path.extname(file.originalname);
      const basename = path.basename(file.originalname, extname);
      const filename = `${basename}-${uuidv4().substring(0, 8)}${extname}`;

      const key = `${folderWithSlash}${filename}`;

      const result = await this.cosService.uploadFile(
        file.buffer,
        key,
        file.mimetype,
        file.size,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(`文件上传失败: ${error.message}`);
    }
  }

  @Put('modify')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改文件名（管理员）' })
  @ApiSuccessResponse(FileResponseDto, { description: '文件修改成功' })
  async modifyFile(@Body() modifyDto: ModifyFileDto) {
    try {
      const { path: filePath, newFilename } = modifyDto;

      const normalizedPath = filePath.startsWith('/')
        ? filePath.substring(1)
        : filePath;

      const exists = await this.cosService.fileExists(normalizedPath);
      if (!exists) {
        throw new BadRequestException('文件不存在');
      }

      const dirname = path.dirname(normalizedPath);
      const extname = path.extname(normalizedPath);

      const newFilenameWithExt = newFilename.endsWith(extname)
        ? newFilename
        : `${newFilename}${extname}`;

      const dirPrefix = dirname === '.' ? '' : `${dirname}/`;
      const newKey = `${dirPrefix}${newFilenameWithExt}`;

      // 直接使用COS SDK的putObjectCopy方法而不是copyObject
      const copyResult = await this.cosService.copyFile(normalizedPath, newKey);
      await this.cosService.deleteFile(normalizedPath);

      return copyResult;
    } catch (error) {
      throw new BadRequestException(`修改文件名失败: ${error.message}`);
    }
  }

  @Delete('*filePath')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文件（管理员）' })
  @ApiSuccessResponse({ success: true }, { description: '文件删除成功' })
  async deleteFile(@Param('filePath') filePath: string) {
    try {
      if (!filePath) {
        throw new BadRequestException('缺少文件路径');
      }

      const decodedPath = decodeURIComponent(filePath);

      const normalizedPath = decodedPath.startsWith('/')
        ? decodedPath.substring(1)
        : decodedPath;

      const exists = await this.cosService.fileExists(normalizedPath);
      if (!exists) {
        throw new BadRequestException('文件不存在');
      }

      await this.cosService.deleteFile(normalizedPath);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(`删除文件失败: ${error.message}`);
    }
  }
}
