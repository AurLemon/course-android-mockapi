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
  async findAll(userId?: number, type?: string) {
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

    let userReadNotices: { notice_id: number }[] = [];
    if (userId) {
      try {
        userReadNotices = await this.prisma.$queryRaw`
        SELECT "notice_id" 
        FROM "tbl_notice_read" 
        WHERE "user_id" = ${userId} AND "status" = true
        ORDER BY "notice_id" ASC
      `;
      } catch (error) {
        console.warn('tbl_notice_read 表可能不存在:', error);
      }
    }

    const readNoticeIds = userReadNotices.map((record) => record.notice_id);

    let filteredNotices = [...notices];
    if (userId && type) {
      if (type === 'read') {
        filteredNotices = notices.filter((notice) =>
          readNoticeIds.includes(notice.id),
        );
      } else if (type === 'unread') {
        filteredNotices = notices.filter(
          (notice) => !readNoticeIds.includes(notice.id),
        );
      }
    }

    return filteredNotices.map((notice) => ({
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
      ...(userId ? { isRead: readNoticeIds.includes(notice.id) } : {}),
      author: undefined,
    }));
  }

  // 获取通知总数
  async getTotalCount(userId?: number, type?: string) {
    if (!userId || !type || type === 'all') {
      return await this.prisma.notice.count();
    }

    // 如果需要过滤，先获取全部通知
    const notices = await this.findAll(userId, type);
    return notices.length;
  }

  // 获取单个通知详情
  async findOne(id: number, userId?: number) {
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

    // 检查用户是否已读此通知
    let isRead = false;
    if (userId) {
      try {
        const readRecord: any[] = await this.prisma.$queryRaw`
        SELECT * FROM "tbl_notice_read" 
        WHERE "user_id" = ${userId} 
        AND "notice_id" = ${id} 
        AND "status" = true
        LIMIT 1
      `;
        isRead = readRecord && readRecord.length > 0;
      } catch (error) {
        console.warn('tbl_notice_read 表可能不存在:', error);
      }
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
      // 如果用户已登录，添加isRead字段
      ...(userId ? { isRead } : {}),
      author: undefined,
    };
  }

  // 创建通知
  async create(createNoticeDto: CreateNoticeDto, authorId: number) {
    const user = await this.prisma.user.findUnique({
      where: { uid: authorId },
    });

    if (!user || user.role === 1) {
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

    if (!user || user.role === 1) {
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
      createdAt: updatedNotice.createdAt
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
      updatedAt: updatedNotice.updatedAt
        ? updatedNotice.updatedAt
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

    if (!user || user.role === 1) {
      throw new ForbiddenException('只有管理员才能删除通知');
    }

    // 删除相关的阅读状态记录
    await this.prisma.noticeRead.deleteMany({
      where: { noticeId: id },
    });

    // 删除通知
    await this.prisma.notice.delete({
      where: { id },
    });

    return { success: true };
  }

  // 更新通知阅读状态
  async updateReadStatus(noticeId: number, userId: number, isRead: boolean) {
    // 检查通知是否存在
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!notice) {
      throw new NotFoundException(`通知ID ${noticeId} 不存在`);
    }

    // 查找现有的阅读状态记录
    const existingRecord = await this.prisma.noticeRead.findUnique({
      where: {
        userId_noticeId: {
          userId: userId,
          noticeId: noticeId,
        },
      },
    });

    if (isRead) {
      // 如果要标记为已读
      if (existingRecord) {
        // 如果记录已存在且未标记为已读，则更新
        if (!existingRecord.status) {
          await this.prisma.noticeRead.update({
            where: {
              id: existingRecord.id,
            },
            data: {
              status: true,
              readAt: new Date(),
            },
          });
        }
      } else {
        // 如果记录不存在，则创建新记录
        await this.prisma.noticeRead.create({
          data: {
            userId: userId,
            noticeId: noticeId,
            status: true,
            readAt: new Date(),
          },
        });
      }
    } else {
      // 如果要标记为未读且记录存在，则删除记录
      if (existingRecord) {
        await this.prisma.noticeRead.delete({
          where: {
            id: existingRecord.id,
          },
        });
      }
    }

    return { success: true };
  }

  // 获取通知阅读状态
  async getNoticeReadStatus(noticeId: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!notice) {
      throw new NotFoundException(`通知ID ${noticeId} 不存在`);
    }

    const readUsers = await this.prisma.noticeRead.findMany({
      where: {
        noticeId: noticeId,
        status: true,
      },
      select: {
        user: {
          select: {
            uid: true,
            trueName: true,
            username: true,
            dept: true,
          },
        },
      },
      orderBy: {
        user: {
          uid: 'asc',
        },
      },
    });

    const totalUsersCount = await this.prisma.user.count();

    const formattedReadUsers = readUsers.map((record) => ({
      uid: record.user.uid,
      name: record.user.trueName || '未设置姓名',
      username: record.user.username || '未设置用户名',
      dept: record.user.dept || '未分配部门',
    }));

    const readUserIds = formattedReadUsers.map((user) => user.uid);
    const unreadUsers = await this.prisma.user.findMany({
      where: {
        uid: {
          notIn: readUserIds,
        },
      },
      select: {
        uid: true,
        trueName: true,
        username: true,
        dept: true,
      },
      orderBy: {
        uid: 'asc',
      },
    });

    const formattedUnreadUsers = unreadUsers.map((user) => ({
      uid: user.uid,
      name: user.trueName || '未设置姓名',
      username: user.username || '未设置用户名',
      dept: user.dept || '未分配部门',
    }));

    return {
      status: {
        totalUsers: totalUsersCount,
        readUsers: formattedReadUsers.length,
      },
      details: {
        read: formattedReadUsers,
        unread: formattedUnreadUsers,
      },
    };
  }
}
