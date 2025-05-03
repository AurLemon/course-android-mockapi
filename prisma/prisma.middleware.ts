import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaReconnectMiddleware implements NestMiddleware {
  private readonly logger = new Logger('PrismaMiddleware');
  private reconnecting = false;

  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      next();
    } catch (error) {
      if (!this.reconnecting) {
        this.reconnecting = true;
        this.logger.warn('数据库连接失败，尝试重新连接...');

        try {
          await this.prisma.$disconnect();
          await this.prisma.$connect();
          this.logger.log('数据库重连成功');
        } catch (reconnectError) {
          this.logger.error('数据库重连失败', reconnectError);
        } finally {
          this.reconnecting = false;
        }
      }

      res.status(500).json({
        code: 500,
        msg: '数据库服务暂时不可用，请稍后再试',
        timestamp: Date.now(),
        data: null,
      });
    }
  }
}
