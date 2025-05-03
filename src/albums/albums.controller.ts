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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('景区相册')
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有相册' })
  @ApiSuccessResponse(AlbumResponseDto, { isArray: true })
  async findAll() {
    return this.albumsService.findAll();
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
  @Roles(0) // 只有管理员可以发布相册
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布相册 (管理员)' })
  @ApiSuccessResponse(AlbumResponseDto)
  async create(@Body() createAlbumDto: CreateAlbumDto, @Request() req) {
    return this.albumsService.create(createAlbumDto, req.user.uid);
  }

  @Put('modify/:id')
  @UseGuards(RolesGuard)
  @Roles(0) // 只有管理员可以修改相册
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改相册 (管理员)' })
  @ApiSuccessResponse(AlbumResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @Request() req,
  ) {
    return this.albumsService.update(id, updateAlbumDto, req.user.uid);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(0) // 只有管理员可以删除相册
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除相册 (管理员)' })
  @ApiSuccessResponse({ success: true })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumsService.remove(id, req.user.uid);
  }
}
