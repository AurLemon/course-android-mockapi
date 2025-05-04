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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import {
  CreateNoticeDto,
  UpdateNoticeDto,
  NoticeResponseDto,
} from './dto/notice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';

@ApiTags('通知管理')
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get('list')
  @ApiOperation({ summary: '获取通知列表' })
  @ApiSuccessResponse(NoticeResponseDto, { isArray: true })
  async findAll() {
    return this.noticesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情' })
  @ApiSuccessResponse(NoticeResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.findOne(id);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles(0) // 只有管理员可以发布通知
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布通知 (管理员)' })
  @ApiSuccessResponse(NoticeResponseDto)
  async create(@Body() createNoticeDto: CreateNoticeDto, @Request() req) {
    return this.noticesService.create(createNoticeDto, req.user.userId);
  }

  @Post('modify')
  @UseGuards(RolesGuard)
  @Roles(0) // 只有管理员可以修改通知
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改通知 (管理员)' })
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
  @Roles(0) // 只有管理员可以删除通知
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除通知 (管理员)' })
  @ApiSuccessResponse({ success: true })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.noticesService.remove(id, req.user.userId);
  }
}
