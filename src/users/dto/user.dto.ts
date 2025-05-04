import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '245810101', description: '学号' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  username: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;

  @ApiProperty({ example: '林檬', description: '真实姓名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  trueName?: string;

  @ApiProperty({ example: '男', description: '性别', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  sex?: string;

  @ApiProperty({ example: '13300000000', description: '电话', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  telephone?: string;

  @ApiProperty({
    example: '2006-05-18',
    description: '出生日期',
    required: false,
  })
  @IsOptional()
  @IsString()
  birth?: string;

  @ApiProperty({
    example: '24计应(3+2)1',
    description: '专业班级',
    required: false,
  })
  @IsOptional()
  @IsString()
  dept?: string;

  @ApiProperty({
    example: 1,
    description: '用户权限: 0-管理员, 1-普通用户',
    required: false,
  })
  @IsOptional()
  @IsInt()
  role?: number;
}

export class UpdateUserDto {
  @ApiProperty({ example: '林檬', description: '真实姓名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  trueName?: string;

  @ApiProperty({ example: '男', description: '性别', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  sex?: string;

  @ApiProperty({ example: '13300000000', description: '电话', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  telephone?: string;

  @ApiProperty({
    example: '2006-05-18',
    description: '出生日期',
    required: false,
  })
  @IsOptional()
  @IsString()
  birth?: string;

  @ApiProperty({
    example: '24计应(3+2)1',
    description: '专业班级',
    required: false,
  })
  @IsOptional()
  @IsString()
  dept?: string;
}

export class UserListResponseDto {
  @ApiProperty({ example: 1 })
  uid: number;

  @ApiProperty({ example: '245810101' })
  username: string;

  @ApiProperty({ example: '林檬' })
  trueName: string;

  @ApiProperty({ example: '男' })
  sex: string;

  @ApiProperty({ example: '13300000000' })
  telephone: string;

  @ApiProperty({ example: '2006-05-18' })
  birth: string;

  @ApiProperty({ example: '24计应(3+2)1' })
  dept: string;

  @ApiProperty({ example: 1 })
  role: number;

  @ApiProperty({ example: '2025-05-03T08:30:00Z' })
  regtime: Date;
}

export class UserInfoResponseDto {
  @ApiProperty({ example: 1 })
  uid: number;

  @ApiProperty({ example: '245810101' })
  username: string;

  @ApiProperty({ example: '林檬' })
  trueName: string;

  @ApiProperty({ example: '男' })
  sex: string;

  @ApiProperty({ example: '13300000000' })
  telephone: string;

  @ApiProperty({ example: '2006-05-18' })
  birth: string;

  @ApiProperty({ example: '24计应(3+2)1' })
  dept: string;

  @ApiProperty({ example: 1 })
  role: number;
}

export class ModifyTrueNameDto {
  @ApiProperty({ example: '林檬' })
  trueName: string;
}

export class ModifyTelephoneDto {
  @ApiProperty({ example: '13300000000' })
  telephone: string;
}

export class ModifySexDto {
  @ApiProperty({ example: '男' })
  sex: string;
}

export class ModifyBirthdateDto {
  @ApiProperty({ example: '2006-05-18' })
  birth: string;
}
