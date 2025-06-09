import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
  Res,
  Put,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  ChangePasswordDto,
  LogoutResponseDto,
  ModifyResponseDto,
  AdminChangePasswordDto,
} from './dto/auth.dto';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { ApiCustomFieldResponse } from '../common/decorators/api-response.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ConfigurableResponseInterceptor } from '../common/interceptors/response.interceptor';
import { SkipGlobalInterceptor } from 'src/common/decorators/skip-global-interceptor.decorator';

@ApiTags('认证服务')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiCustomFieldResponse('token', {
    type: 'string',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '访问令牌',
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @SkipGlobalInterceptor()
  @UseInterceptors(new ConfigurableResponseInterceptor('token'))
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );
      const token = await this.authService.login(user);
      return response.status(200).json({
        code: 200,
        msg: '登录成功',
        token,
      });
    } catch (error) {
      return response.status(401).json({
        code: 401,
        msg: error.message || '用户名或密码错误',
        token: null,
      });
    }
  }

  // 注销
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户注销' })
  @ApiSuccessResponse(LogoutResponseDto)
  @ApiResponse({ status: 200, description: '注销成功' })
  async logout(@Req() req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    return await this.authService.logout(token);
  }

  // 通过刷新令牌获取新访问令牌
  // @Post('refresh')
  // @ApiOperation({ summary: '刷新令牌' })
  // @ApiResponse({ status: 200, description: '刷新成功' })
  // @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  // async refreshToken(@Body() refreshDto: RefreshTokenDto) {
  //   try {
  //     return await this.authService.refreshToken(refreshDto.refresh_token);
  //   } catch (error) {
  //     throw new UnauthorizedException(error.message);
  //   }
  // }

  // 修改密码
  @Put('modify/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiSuccessResponse(ModifyResponseDto)
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

  @Put('modify/password/admin')
  @UseGuards(RolesGuard)
  @Roles(2)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改用户密码（超级管理员）' })
  @ApiSuccessResponse({ success: true }, { description: '密码修改成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async adminChangePassword(@Body() changePasswordDto: AdminChangePasswordDto) {
    if (!changePasswordDto.uid || !changePasswordDto.new_password) {
      throw new BadRequestException('用户 ID 和新密码不能为空');
    }

    try {
      await this.authService.adminChangePassword(
        changePasswordDto.uid,
        changePasswordDto.new_password,
      );
      return { success: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
