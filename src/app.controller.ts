import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSuccessResponse } from './common/decorators/api-response.decorator';
import { PrismaClient } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import * as os from 'os';

const prisma = new PrismaClient();

class MemoryInfoDto {
  @ApiProperty({ example: '16384.00 MB' })
  total: string;

  @ApiProperty({ example: '8192.00 MB' })
  free: string;
}

class SystemInfoDto {
  @ApiProperty({ example: 'Course Android Mock API' })
  project_name: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'AurLemon' })
  author: string;

  @ApiProperty({
    example: 'https://github.com/AurLemon/course-android-mockapi',
  })
  repository: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ example: '2025-05-03T12:34:56.789Z' })
  timestamp: string;

  @ApiProperty({ example: '123.45s' })
  uptime: string;

  @ApiProperty({ example: 'connected' })
  database: string;

  @ApiProperty({ example: 'localhost' })
  host: string;

  @ApiProperty({ example: 'linux' })
  platform: string;

  @ApiProperty({ type: MemoryInfoDto })
  memory: MemoryInfoDto;
}

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: '获取运行环境的基本信息（用于验证连通性）。' })
  @ApiSuccessResponse(SystemInfoDto)
  async getSystemInfo(): Promise<SystemInfoDto> {
    let dbStatus = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    return {
      project_name: 'Course Android Mock API',
      version: '1.0.0',
      author: 'AurLemon',
      repository: 'https://github.com/AurLemon/course-android-mockapi',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime().toFixed(2) + 's',
      database: dbStatus,
      host: os.hostname(),
      platform: os.platform(),
      memory: {
        total: (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB',
        free: (os.freemem() / 1024 / 1024).toFixed(2) + ' MB',
      },
    };
  }
}
