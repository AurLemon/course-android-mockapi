import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
  access_token: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '刷新令牌',
  })
  refresh_token: string;

  @ApiProperty({
    example: {
      uid: 1,
      username: 'admin',
      role: 0,
    },
    description: '用户基本信息',
  })
  user: {
    uid: number;
    username: string;
    role: number;
  };
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
