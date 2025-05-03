import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
  Put,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('认证服务')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiSuccessResponse(LoginResponseDto)
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // 注销
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户注销' })
  @ApiResponse({ status: 200, description: '注销成功' })
  async logout(@Req() req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    return await this.authService.logout(token);
  }

  // 通过刷新令牌获取新访问令牌
  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshDto.refresh_token);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // 修改密码
  @Put('modify/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 400, description: '请求失败' })
  @ApiResponse({ status: 401, description: '未授权' })
  async changePassword(@Req() req, @Body() passwordDto: ChangePasswordDto) {
    if (!passwordDto.old_password || !passwordDto.new_password) {
      throw new BadRequestException('旧密码和新密码不能为空');
    }

    try {
      return await this.authService.changePassword(
        req.user.userId,
        passwordDto.old_password,
        passwordDto.new_password,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
