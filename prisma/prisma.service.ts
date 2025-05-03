import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private reconnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000; // 5秒

  // 移除事件监听器，通过中间件捕获所有错误
  constructor(private configService?: ConfigService) {
    const isDevelopment = configService?.get('NODE_ENV') !== 'production';

    super({
      log: isDevelopment ? ['info', 'warn', 'error'] : ['error'],
      // 增加连接池超时时间
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // 仅使用中间件来处理所有查询和错误
    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        this.logger.error('Prisma Query Error', error);

        // 处理连接池错误
        if (this.isConnectionError(error)) {
          this.logger.warn(`数据库连接错误，正在尝试重连: ${error.message}`);

          // 如果尚未重连，则尝试重连
          if (!this.reconnecting) {
            this.reconnectDatabase();
          }

          // 等待1秒后重试当前查询
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 重试当前查询 (最多3次)
          for (let i = 0; i < 3; i++) {
            try {
              return await next(params);
            } catch (retryError) {
              if (!this.isConnectionError(retryError) || i === 2) {
                throw retryError;
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
        throw error;
      }
    });
  }

  /**
   * 判断是否为连接相关错误
   */
  private isConnectionError(error: any): boolean {
    const errorMsg = error.message || '';
    return (
      errorMsg.includes('connection pool') ||
      errorMsg.includes('ConnectionReset') ||
      errorMsg.includes('Connection refused') ||
      errorMsg.includes('terminating connection') ||
      errorMsg.includes('Connection terminated') ||
      errorMsg.includes('connect ECONNREFUSED')
    );
  }

  /**
   * 尝试重新连接数据库
   */
  private reconnectDatabase(attempt = 0) {
    if (this.reconnecting) {
      return;
    }

    this.reconnecting = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(
      () => {
        const reconnect = async () => {
          try {
            this.logger.log(
              `尝试重新连接数据库 (尝试 ${attempt + 1}/${this.maxReconnectAttempts})...`,
            );

            await this.$disconnect();

            await this.$connect();

            this.logger.log('数据库重连成功');
            this.reconnecting = false;
          } catch (error) {
            this.logger.error(`数据库重连失败: ${error.message}`);

            if (attempt < this.maxReconnectAttempts) {
              this.reconnecting = false;
              const nextDelay = Math.min(
                this.reconnectDelay * Math.pow(1.5, attempt),
                60000,
              );
              this.logger.log(`将在 ${nextDelay / 1000} 秒后再次尝试...`);
              this.reconnectDatabase(attempt + 1);
            } else {
              this.logger.error(
                `已达到最大重连尝试次数 (${this.maxReconnectAttempts})，放弃重连`,
              );
              this.reconnecting = false;
            }
          }
        };

        reconnect().catch((err) => {
          this.logger.error('重连过程中发生意外错误', err);
          this.reconnecting = false;
        });
      },
      attempt === 0 ? 0 : this.reconnectDelay,
    );
  }

  /**
   * 连接到数据库
   */
  async onModuleInit() {
    try {
      this.logger.log('Connecting to database...');
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);

      if (this.isConnectionError(error)) {
        this.reconnectDatabase();
      }

      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database...');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  async executeTransaction<T>(
    fn: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.$transaction((tx) =>
        fn(tx as unknown as PrismaService),
      );
    } catch (error) {
      this.logger.error('Transaction failed', error);
      throw error;
    }
  }

  async cleanDatabase() {
    if (this.configService?.get('NODE_ENV') === 'production') {
      this.logger.error(
        'Attempted to clean database in production environment',
      );
      throw new Error('Cannot clean database in production environment');
    }

    this.logger.warn('Cleaning database - ALL DATA WILL BE DELETED');

    return this.$transaction([
      this.notice?.deleteMany ? this.notice.deleteMany() : Promise.resolve(),
      this.album?.deleteMany ? this.album.deleteMany() : Promise.resolve(),
      (this as any).albumType?.deleteMany
        ? (this as any).albumType.deleteMany()
        : Promise.resolve(),
      this.user?.deleteMany ? this.user.deleteMany() : Promise.resolve(),
    ]);
  }
}
