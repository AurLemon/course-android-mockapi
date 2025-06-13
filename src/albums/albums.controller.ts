import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import { AlbumsService } from './albums.service';
import {
  CreateAlbumDto,
  UpdateAlbumDto,
  AlbumResponseDto,
  AlbumTypeResponseDto,
} from './dto/album.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { SkipGlobalInterceptor } from '../common/decorators/skip-global-interceptor.decorator';

@ApiTags('景区相册')
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @ApiOperation({ summary: '获取相册列表（支持分页和排序）' })
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
          items: { $ref: getSchemaPath(AlbumResponseDto) },
        },
        page: {
          type: 'object',
          properties: {
            pageNum: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            sortBy: { type: 'string', example: 'id' },
            sortOrder: { type: 'string', example: 'desc' },
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
    schema: { type: 'integer', default: 10 },
    description: '每页数量，默认 10。',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['id', 'createTime', 'updateTime'],
    description: '排序字段，默认 id。',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: '排序方式，asc 或 desc，默认 desc。',
  })
  @ApiExtraModels(AlbumResponseDto)
  @SkipGlobalInterceptor()
  async findAll(
    @Query('pageNum', new ParseIntPipe({ optional: true })) pageNum = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 15,
    @Query('sortBy') sortBy: 'id' = 'id',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const result = await this.albumsService.findAll(
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

  @Get('types')
  @ApiOperation({ summary: '获取所有相册类型' })
  @ApiSuccessResponse(AlbumTypeResponseDto, { isArray: true })
  async findAllTypes() {
    return this.albumsService.findAllTypes();
  }

  @Get('type/:id')
  @ApiOperation({ summary: '按类型获取相册' })
  @ApiSuccessResponse(AlbumResponseDto, { isArray: true })
  async findByType(@Param('id', ParseIntPipe) id: number) {
    return this.albumsService.findByType(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取相册详情' })
  @ApiSuccessResponse(AlbumResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.albumsService.findOne(id);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布相册（管理员）' })
  @ApiSuccessResponse(AlbumResponseDto)
  async create(@Body() createAlbumDto: CreateAlbumDto, @Request() req) {
    return this.albumsService.create(createAlbumDto, req.user.userId);
  }

  @Put('modify/:id')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改相册（管理员）' })
  @ApiSuccessResponse(AlbumResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @Request() req,
  ) {
    return this.albumsService.update(id, updateAlbumDto, req.user.userId);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(0)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除相册（管理员）' })
  @ApiSuccessResponse({ success: true })
  async remove(@Query('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumsService.remove(id, req.user.userId);
  }
}
