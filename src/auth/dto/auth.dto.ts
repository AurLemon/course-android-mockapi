import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test',
    description: '用户名（不需要加密）',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: '123456',
    description: '密码（不需要加密）',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '访问令牌',
  })
  token: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: '4147dfe2-f234-45cd-9c2f-639630bc7e39',
    description: '刷新令牌',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: '注销成功',
    description: '返回信息',
  })
  message: string;
}

export class ModifyResponseDto {
  @ApiProperty({
    example: '密码修改成功',
    description: '返回信息',
  })
  message: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: '123456',
    description: '旧密码（不需要加密）',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  old_password: string;

  @ApiProperty({
    example: '114514',
    description: '新密码（不需要加密）',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  new_password: string;
}

export class AdminChangePasswordDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  uid: number;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  @IsNotEmpty()
  @IsString()
  new_password: string;
}
