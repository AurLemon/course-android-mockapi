import { Module, Global, DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        return new PrismaService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {
  /**
   * 创建异步模块（可选，用于需要异步配置的场景）
   */
  static forRootAsync(): DynamicModule {
    return {
      module: PrismaModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: PrismaService,
          useFactory: async (configService: ConfigService) => {
            const service = new PrismaService(configService);
            await service.onModuleInit();
            return service;
          },
          inject: [ConfigService],
        },
      ],
      exports: [PrismaService],
    };
  }

  /**
   * 创建用于测试的模块
   */
  static forTest(): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PrismaService,
          useFactory: () => {
            const service = new PrismaService();
            return service;
          },
        },
      ],
      exports: [PrismaService],
    };
  }
}
