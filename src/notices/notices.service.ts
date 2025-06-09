import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  // 获取所有通知
  async findAll() {
    const notices = await this.prisma.notice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            trueName: true,
          },
        },
      },
    });

    return notices.map((notice) => ({
      ...notice,
      authorName: notice.author?.trueName || '管理员',
      createdAt: notice.createdAt
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
      updatedAt: notice.updatedAt
        ? notice.updatedAt
            .toLocaleString('sv-SE', {
              timeZone: 'Asia/Shanghai',
              hour12: false,
            })
            .replace('T', ' ')
        : null,
      author: undefined,
    }));
  }

  // 获取通知总数
  async getTotalCount() {
    return await this.prisma.notice.count();
  }

  // 获取单个通知详情
  async findOne(id: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            trueName: true,
          },
        },
      },
    });

    if (!notice) {
      throw new NotFoundException(`通知ID ${id} 不存在`);
    }

    return {
      ...notice,
      authorName: notice.author?.trueName || '管理员',
      createdAt: notice.createdAt
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
      updatedAt: notice.updatedAt
        ? notice.updatedAt
            .toLocaleString('sv-SE', {
              timeZone: 'Asia/Shanghai',
              hour12: false,
            })
            .replace('T', ' ')
        : null,
      author: undefined,
    };
  }

  // 创建通知
  async create(createNoticeDto: CreateNoticeDto, authorId: number) {
    const user = await this.prisma.user.findUnique({
      where: { uid: authorId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能发布通知');
    }

    const notice = await this.prisma.notice.create({
      data: {
        ...createNoticeDto,
        authorId,
      },
      include: {
        author: {
          select: {
            trueName: true,
          },
        },
      },
    });

    return {
      ...notice,
      authorName: notice.author?.trueName || '管理员',
      createdAt: notice.createdAt
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
      updatedAt: notice.updatedAt
        ? notice.updatedAt
            .toLocaleString('sv-SE', {
              timeZone: 'Asia/Shanghai',
              hour12: false,
            })
            .replace('T', ' ')
        : null,
      author: undefined,
    };
  }

  // 更新通知
  async update(id: number, updateNoticeDto: UpdateNoticeDto, userId: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException(`通知ID ${id} 不存在`);
    }

    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能修改通知');
    }

    const updatedNotice = await this.prisma.notice.update({
      where: { id },
      data: updateNoticeDto,
      include: {
        author: {
          select: {
            trueName: true,
          },
        },
      },
    });

    return {
      ...updatedNotice,
      authorName: updatedNotice.author?.trueName || '管理员',
      createdAt: notice.createdAt
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
      updatedAt: notice.updatedAt
        ? notice.updatedAt
            .toLocaleString('sv-SE', {
              timeZone: 'Asia/Shanghai',
              hour12: false,
            })
            .replace('T', ' ')
        : null,
      author: undefined,
    };
  }

  // 删除通知
  async remove(id: number, userId: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException(`通知ID ${id} 不存在`);
    }

    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能删除通知');
    }

    await this.prisma.notice.delete({
      where: { id },
    });

    return { success: true };
  }
}
