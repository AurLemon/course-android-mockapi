import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty({ example: '九寨沟风景区', description: '景区名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: '/profile/scenic/album/cover/image.png',
    description: '封面图片路径',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  coverPath: string;

  @ApiProperty({ example: '美丽的童话世界', description: '景区简介' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  describe: string;

  @ApiProperty({ example: 1, description: '分类ID' })
  @IsNotEmpty()
  @IsInt()
  type: number;

  @ApiProperty({
    example: '/path/img1.jpg,/path/img2.jpg',
    description: '轮播图路径，以逗号分隔',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  loopPicPath: string;
}

export class UpdateAlbumDto {
  @ApiProperty({
    example: '九寨沟风景区(更新)',
    description: '景区名称',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: '/profile/scenic/album/cover/new-image.png',
    description: '封面图片路径',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverPath?: string;

  @ApiProperty({
    example: '美丽的童话世界(更新)',
    description: '景区简介',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  describe?: string;

  @ApiProperty({ example: 2, description: '分类ID', required: false })
  @IsOptional()
  @IsInt()
  type?: number;

  @ApiProperty({
    example: '/path/img3.jpg,/path/img4.jpg',
    description: '轮播图路径，以逗号分隔',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  loopPicPath?: string;
}

export class AlbumResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '九寨沟风景区' })
  title: string;

  @ApiProperty({ example: '/profile/scenic/album/cover/image.png' })
  coverPath: string;

  @ApiProperty({ example: '美丽的童话世界' })
  describe: string;

  @ApiProperty({ example: 1 })
  type: number;

  @ApiProperty({ example: '/path/img1.jpg,/path/img2.jpg' })
  loopPicPath: string;

  @ApiProperty({ example: '2023-02-08T19:49:30Z' })
  createTime: Date;

  @ApiProperty({ example: '2023-02-09T09:59:18Z' })
  updateTime: Date;

  @ApiProperty({ example: '自然风景' })
  typeName: string;
}

export class AlbumTypeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '自然风景' })
  name: string;
}
