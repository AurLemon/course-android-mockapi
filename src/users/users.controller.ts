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
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
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
import { SkipGlobalInterceptor } from '../common/decorators/skip-global-interceptor.decorator';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有用户列表（管理员）' })
  @ApiResponse({
    status: 200,
    description: '操作成功',
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        msg: { type: 'string', example: '操作成功' },
        total: { type: 'number', example: 100 },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserListResponseDto) },
        },
        page: {
          type: 'object',
          properties: {
            pageNum: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 20 },
            totalItems: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
            sortBy: { type: 'string', example: 'uid' },
            sortOrder: { type: 'string', example: 'asc' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'pageNum',
    required: false,
    schema: { type: 'integer', default: 1 },
    description: '页码（从 1 开始），默认 1。',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    schema: { type: 'integer', default: 20 },
    description: '每页数量，默认 20。',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['uid', 'regtime'],
    description: '排序字段，默认 uid。',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: '排序方式，默认 asc。',
  })
  @ApiExtraModels(UserListResponseDto)
  @SkipGlobalInterceptor()
  async findAll(
    @Query('pageNum', new ParseIntPipe({ optional: true })) pageNum = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
    @Query('sortBy') sortBy = 'uid',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const result = await this.usersService.findAll(
      pageNum,
      pageSize,
      sortBy,
      sortOrder,
    );

    return {
      code: 200,
      msg: '操作成功',
      total: result.page.totalItems,
      data: result.data,
      page: result.page,
    };
  }

  @Post('add')
  @UseGuards(RolesGuard)
  @Roles(2)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加用户（超级管理员）' })
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
  @Roles(2)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改用户信息（超级管理员）' })
  @ApiSuccessResponse(UserInfoResponseDto, { description: '用户信息修改成功' })
  async updateByAdmin(
    @Body('uid') uid: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(uid, updateUserDto);
  }

  @Get('info/:uid')
  @UseGuards(RolesGuard)
  @Roles(2)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取指定用户信息（超级管理员）' })
  @ApiParam({
    name: 'uid',
    required: true,
    description: '要查询的用户 ID',
    schema: { type: 'integer', example: 123 },
  })
  @ApiSuccessResponse(UserInfoResponseDto, { description: '返回指定用户信息' })
  async getUserInfoByAdmin(@Param('uid', ParseIntPipe) uid: number) {
    return this.usersService.findById(uid);
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
  @Roles(2)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户（超级管理员）' })
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
