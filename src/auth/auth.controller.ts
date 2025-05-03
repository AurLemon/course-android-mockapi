import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: { username: string; password: string }) {
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

  @Post('modify/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 400, description: '请求失败' })
  @ApiResponse({ status: 401, description: '未授权' })
  async changePassword(
    @Req() req,
    @Body() passwordDto: { oldPassword: string; newPassword: string },
  ) {
    if (!passwordDto.oldPassword || !passwordDto.newPassword) {
      throw new BadRequestException('旧密码和新密码不能为空');
    }

    try {
      return await this.authService.changePassword(
        req.user.userId,
        passwordDto.oldPassword,
        passwordDto.newPassword,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refreshToken(@Body() refreshDto: { refresh_token: string }) {
    try {
      return await this.authService.refreshToken(refreshDto.refresh_token);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // 添加注销端点
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
}
