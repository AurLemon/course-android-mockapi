import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: '文件夹路径，默认为根目录' })
  @IsString()
  @IsOptional()
  folder?: string = '/';
}

export class ModifyFileDto {
  @ApiProperty({ description: '文件路径' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ description: '新文件名' })
  @IsString()
  @IsNotEmpty()
  newFilename: string;
}

export class FileResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  size?: number;

  @ApiProperty({ required: false })
  lastModified?: string;
}

export class FileListResponseDto {
  @ApiProperty({ type: [FileResponseDto] })
  files: FileResponseDto[];

  @ApiProperty()
  total: number;
}
