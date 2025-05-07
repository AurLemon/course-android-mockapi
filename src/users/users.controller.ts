import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSelfDto,
  UserListResponseDto,
  UserInfoResponseDto,
  ModifyTrueNameDto,
  ModifyTelephoneDto,
  ModifySexDto,
  ModifyBirthdateDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有用户列表 (管理员)' })
  @ApiSuccessResponse(UserListResponseDto, {
    isArray: true,
    description: '返回用户列表',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加用户 (管理员)' })
  @ApiSuccessResponse(UserInfoResponseDto, { description: '用户创建成功' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取个人信息' })
  @ApiSuccessResponse(UserInfoResponseDto, { description: '返回用户信息' })
  async getOwnInfo(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('info/modify')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改用户信息 (管理员)' })
  @ApiSuccessResponse(UserInfoResponseDto, { description: '用户信息修改成功' })
  async updateByAdmin(
    @Body('uid') uid: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(uid, updateUserDto);
  }

  @Put('modify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      '修改个人信息（真实姓名、电话、生日、性别，四个键可以只传两个，传几个改几个）',
  })
  @ApiSuccessResponse({ success: true }, { description: '修改成功' })
  async updateUserInfo(
    @Request() req,
    @Body() updateUserSelfDto: UpdateUserSelfDto,
  ) {
    await this.usersService.update(req.user.userId, updateUserSelfDto);
    return { success: true };
  }

  @Delete('delete/:uid')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户 (管理员)' })
  @ApiSuccessResponse({ success: true }, { description: '用户删除成功' })
  async remove(@Param('uid', ParseIntPipe) uid: number) {
    await this.usersService.remove(uid);
    return { success: true };
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户注销' })
  @ApiSuccessResponse({ success: true }, { description: '注销成功' })
  async logout(@Request() req) {
    await this.usersService.logout(req.user.userId);
    return { success: true };
  }
}
