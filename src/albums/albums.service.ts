import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album.dto';
import { log } from 'node:console';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  // 获取所有相册
  async findAll() {
    try {
      const typeCount = await this.prisma.albumType.count();

      if (typeCount === 0) {
        console.log('未找到相册类型数据，正在创建默认类型...');
        await this.prisma.albumType.createMany({
          data: [
            { id: 1, name: '自然风景' },
            { id: 2, name: '国外景点' },
            { id: 3, name: '历史文化' },
            { id: 4, name: '四季风光' },
          ],
          skipDuplicates: true,
        });
      }

      const albums = await this.prisma.album.findMany({
        include: {
          albumType: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createTime: 'desc',
        },
      });

      const result = albums.map((album) => {
        const safeAlbum = {
          id: typeof album.id === 'bigint' ? album.id.toString() : album.id,
          title: album.title || '',
          coverPath: album.coverPath || '',
          describe: album.describe || '',
          type: album.type || 0,
          typeName: album.albumType?.name || '未分类',
          loopPicPath: album.loopPicPath || '',
          createTime: album.createTime ? album.createTime.toISOString() : null,
          updateTime: album.updateTime ? album.updateTime.toISOString() : null,
        };

        return safeAlbum;
      });

      return result;
    } catch (error) {
      console.error('查询相册列表失败:', error);
      throw new Error('获取相册列表时发生错误');
    }
  }

  // 按类型获取相册
  async findByType(typeId: number) {
    const albums = await this.prisma.album.findMany({
      where: {
        type: typeId,
      },
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createTime: 'desc',
      },
    });

    return albums.map((album) => ({
      ...album,
      typeName: album.albumType?.name || '未分类',
      albumType: undefined,
    }));
  }

  // 获取相册详情
  async findOne(id: number) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!album) {
      throw new NotFoundException(`相册ID ${id} 不存在`);
    }

    return {
      ...album,
      typeName: album.albumType?.name || '未分类',
      albumType: undefined,
    };
  }

  // 获取所有相册类型
  async findAllTypes() {
    return this.prisma.albumType.findMany();
  }

  // 创建相册
  async create(createAlbumDto: CreateAlbumDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能发布相册');
    }

    const albumType = await this.prisma.albumType.findUnique({
      where: { id: createAlbumDto.type },
    });

    if (!albumType) {
      throw new NotFoundException(`相册类型ID ${createAlbumDto.type} 不存在`);
    }

    const album = await this.prisma.album.create({
      data: {
        title: createAlbumDto.title,
        coverPath: createAlbumDto.coverPath,
        describe: createAlbumDto.describe,
        type: createAlbumDto.type,
        loopPicPath: createAlbumDto.loopPicPath,
      },
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...album,
      typeName: album.albumType?.name || '未分类',
      albumType: undefined,
    };
  }

  // 更新相册
  async update(id: number, updateAlbumDto: UpdateAlbumDto, userId: number) {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`相册ID ${id} 不存在`);
    }

    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能修改相册');
    }

    if (updateAlbumDto.type) {
      const albumType = await this.prisma.albumType.findUnique({
        where: { id: updateAlbumDto.type },
      });

      if (!albumType) {
        throw new NotFoundException(`相册类型ID ${updateAlbumDto.type} 不存在`);
      }
    }

    const updatedAlbum = await this.prisma.album.update({
      where: { id },
      data: updateAlbumDto,
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...updatedAlbum,
      typeName: updatedAlbum.albumType?.name || '未分类',
      albumType: undefined,
    };
  }

  // 删除相册
  async remove(id: number, userId: number) {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`相册ID ${id} 不存在`);
    }

    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能删除相册');
    }

    await this.prisma.album.delete({
      where: { id },
    });

    return { success: true };
  }
}
