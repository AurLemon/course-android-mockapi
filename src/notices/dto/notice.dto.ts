import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: '期末考试安排通知', description: '通知标题' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: '期末考试将于2023年7月1日开始，请各位同学做好准备...',
    description: '通知内容',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateNoticeDto {
  @ApiProperty({
    example: '期末考试安排通知(更新)',
    description: '通知标题',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    example: '期末考试将于2023年7月5日开始，请各位同学做好准备...',
    description: '通知内容',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}

export class NoticeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '期末考试安排通知' })
  title: string;

  @ApiProperty({
    example: '期末考试将于2023年7月1日开始，请各位同学做好准备...',
  })
  content: string;

  @ApiProperty({ example: '2023-06-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-06-16T08:15:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ example: '张老师' })
  authorName: string;
}
