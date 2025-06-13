import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { NoticeResponseDto } from './dto/notice.dto';

type PageMeta = {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: 'id' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
};

type FindAllNoticesResult = {
  data: NoticeResponseDto[];
  page: PageMeta;
};

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId?: number,
    type?: 'read' | 'unread',
    pageNum = 1,
    pageSize = 15,
    sortBy: 'id' | 'createdAt' | 'updatedAt' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<FindAllNoticesResult> {
    const orderByClause =
      sortBy === 'updatedAt'
        ? { updatedAt: sortOrder }
        : { [sortBy]: sortOrder };

    const allNotices = await this.prisma.notice.findMany({
      orderBy: orderByClause,
      include: { author: { select: { trueName: true } } },
    });

    let readIds: number[] = [];
    if (userId) {
      try {
        const records: { notice_id: number }[] = await this.prisma.$queryRaw`
          SELECT "notice_id"
          FROM "tbl_notice_read"
          WHERE "user_id" = ${userId} AND "status" = true
        `;
        readIds = records.map((r) => r.notice_id);
      } catch (err) {
        console.warn('tbl_notice_read 表可能不存在或结构变化：', err);
      }
    }

    let filtered: typeof allNotices = allNotices;
    if (type === 'read') {
      filtered = allNotices.filter((n) => readIds.includes(n.id));
    } else if (type === 'unread') {
      filtered = allNotices.filter((n) => !readIds.includes(n.id));
    }

    const totalItems = filtered.length;
    const ps = pageSize > 0 ? pageSize : 15;
    const pn = pageNum > 0 ? pageNum : 1;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / ps) : 1;

    const offset = (pn - 1) * ps;
    const pageItems = filtered.slice(offset, offset + ps);

    const data: NoticeResponseDto[] = pageItems.map((notice, idx) => {
      const base: any = {
        ...notice,
        index: offset + idx + 1,
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
      if (userId) {
        base.isRead = readIds.includes(notice.id);
      }
      return base as NoticeResponseDto;
    });

    const page: PageMeta = {
      pageNum: pn,
      pageSize: ps,
      totalItems,
      totalPages,
      sortBy,
      sortOrder,
    };

    return { data, page };
  }

  async getTotalCount(
    userId?: number,
    type?: 'read' | 'unread' | 'all',
  ): Promise<number> {
    if (!userId || !type || type === 'all') {
      return this.prisma.notice.count();
    }

    if (type !== 'read' && type !== 'unread') {
      return this.prisma.notice.count();
    }
    try {
      const readCountResult: Array<{ count: string }> = await this.prisma
        .$queryRaw`
      SELECT COUNT(*)::text AS count
      FROM "tbl_notice_read"
      WHERE "user_id" = ${userId} AND "status" = true
    `;
      const readCount = readCountResult.length
        ? parseInt(readCountResult[0].count, 10)
        : 0;

      if (type === 'read') {
        return readCount;
      } else {
        const total = await this.prisma.notice.count();
        return Math.max(0, total - readCount);
      }
    } catch (err) {
      console.warn('获取已读通知计数时出错，退回 findAll 计算:', err);
      const result = await this.findAll(
        userId,
        type,
        1,
        1,
        'createdAt',
        'desc',
      );
      return result.page.totalItems;
    }
  }

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

    if (!user || user.role !== 0) {
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
