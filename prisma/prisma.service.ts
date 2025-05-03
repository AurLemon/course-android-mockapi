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

  constructor(private configService?: ConfigService) {
    const isDevelopment = configService?.get('NODE_ENV') !== 'production';

    super({
      log: isDevelopment
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
    });

    if (isDevelopment) {
      this.$on('query', (e) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
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
      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database...');
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  /**
   * 执行数据库事务
   * @param fn 事务函数
   * @returns 事务执行结果
   */
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

  /**
   * 清空数据库 (仅供开发/测试环境使用)
   */
  async cleanDatabase() {
    if (this.configService?.get('NODE_ENV') === 'production') {
      this.logger.error(
        'Attempted to clean database in production environment',
      );
      throw new Error('Cannot clean database in production environment');
    }

    this.logger.warn('Cleaning database - ALL DATA WILL BE DELETED');

    const models = Reflect.ownKeys(this).filter((key) => {
      return (
        typeof key === 'string' &&
        !key.startsWith('_') &&
        !key.startsWith('$') &&
        typeof this[key as string] === 'object' &&
        this[key as string] !== null &&
        'deleteMany' in this[key as string]
      );
    });

    return this.$transaction([
      this.notice.deleteMany(),
      this.album.deleteMany(),
      this.albumType.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
