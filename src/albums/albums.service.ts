import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album.dto';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  // 获取所有相册
  async findAll() {
    const albums = await this.prisma.album.findMany({
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createTime: 'desc', // 最新相册优先显示
      },
    });

    // 处理返回结果，添加类型名称
    return albums.map((album) => ({
      ...album,
      typeName: album.albumType?.name || '未分类',
      albumType: undefined, // 移除原始albumType对象
    }));
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
    // 检查用户权限
    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能发布相册');
    }

    // 检查相册类型是否存在
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
    // 检查相册是否存在
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`相册ID ${id} 不存在`);
    }

    // 检查用户权限
    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role !== 0) {
      throw new ForbiddenException('只有管理员才能修改相册');
    }

    // 检查相册类型是否存在
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
    // 检查相册是否存在
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`相册ID ${id} 不存在`);
    }

    // 检查用户权限
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
