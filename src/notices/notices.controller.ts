import {
  Controller,
  Put,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import {
  CreateNoticeDto,
  UpdateNoticeDto,
  NoticeResponseDto,
} from './dto/notice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { SkipGlobalInterceptor } from '../common/decorators/skip-global-interceptor.decorator';

@ApiTags('通知管理')
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get('list')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: '获取通知列表',
    description:
      '无需 Token 即可访问。如带 Token，返回结果会包含 isRead 字段。支持通过 type 过滤（all/read/unread）、分页和排序。',
  })
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
          items: { $ref: getSchemaPath(NoticeResponseDto) },
        },
        page: {
          type: 'object',
          properties: {
            pageNum: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            sortBy: { type: 'string', example: 'createdAt' },
            sortOrder: { type: 'string', example: 'desc' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['all', 'read', 'unread'],
    description: '通知过滤类型，需带 Token 才生效，不传或 all 为不过滤。',
  })
  @ApiQuery({
    name: 'pageNum',
    required: false,
    description: '页码（从 1 开始），默认 1。',
    schema: { type: 'integer', default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量，默认 10。',
    schema: { type: 'integer', default: 10 },
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['id', 'createdAt', 'updatedAt'],
    description: '排序字段，默认 createdAt。',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: '排序方式，asc 或 desc，默认 desc。',
  })
  @ApiExtraModels(NoticeResponseDto)
  @SkipGlobalInterceptor()
  async findAll(
    @Request() req,
    @Query('type') type?: 'all' | 'read' | 'unread',
    @Query('pageNum', new ParseIntPipe({ optional: true })) pageNum = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 15,
    @Query('sortBy') sortBy: 'id' | 'createdAt' | 'updatedAt' = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const userId = req.user?.userId;
    const filterType = userId && type && type !== 'all' ? type : undefined;

    const result = await this.noticesService.findAll(
      userId,
      filterType,
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

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: '获取通知详情',
    description:
      '无需 Token 即可访问。如带 Token，返回结果会包含 isRead 字段（布尔值，即用户是否读取了这个通知。布尔值并非带引号的字符串，不需要额外转换）。',
  })
  @ApiSuccessResponse(NoticeResponseDto)
  @ApiParam({ name: 'id', description: '通知ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.userId;
    return this.noticesService.findOne(id, userId);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布通知（管理员）' })
  @ApiSuccessResponse(NoticeResponseDto)
  async create(@Body() createNoticeDto: CreateNoticeDto, @Request() req) {
    return this.noticesService.create(createNoticeDto, req.user.userId);
  }

  @Post('modify')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改通知（管理员）' })
  @ApiSuccessResponse(NoticeResponseDto)
  async update(
    @Body('id', ParseIntPipe) id: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
    @Request() req,
  ) {
    return this.noticesService.update(id, updateNoticeDto, req.user.userId);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除通知（管理员）' })
  @ApiSuccessResponse({ success: true })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.noticesService.remove(id, req.user.userId);
  }

  @Put('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新通知阅读状态' })
  @ApiSuccessResponse({ success: true })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateReadStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isRead: boolean },
    @Request() req,
  ) {
    if (body === undefined || body.isRead === undefined) {
      throw new BadRequestException('缺少必要参数 isRead');
    }

    return this.noticesService.updateReadStatus(
      id,
      req.user.userId,
      body.isRead,
    );
  }

  @Get(':id/status')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取通知阅读状态详情（管理员）' })
  @ApiSuccessResponse({
    status: {
      totalUsers: 10,
      readUsers: 5,
    },
    details: {
      read: [
        { uid: 1, name: '张三' },
        { uid: 2, name: '李四' },
      ],
      unread: [
        { uid: 3, name: '王五' },
        { uid: 4, name: '赵六' },
      ],
    },
  })
  async getNoticeReadStatus(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.getNoticeReadStatus(id);
  }
}
