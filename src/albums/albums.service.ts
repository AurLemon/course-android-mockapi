import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album.dto';
import { AlbumResponseDto } from './dto/album.dto';

type PageMeta = {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: 'id' | 'createTime' | 'updateTime';
  sortOrder: 'asc' | 'desc';
};

type FindAllAlbumsResult = {
  data: AlbumResponseDto[];
  page: PageMeta;
};

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  private safeAlbumConversion(album) {
    if (!album) return null;

    return {
      ...album,
      id: typeof album.id === 'bigint' ? album.id.toString() : album.id,
      typeName: album.albumType?.name || '未分类',
      albumType: undefined,
    };
  }

  // 批量转换相册列表
  private safeAlbumsConversion(albums) {
    return albums.map((album) => this.safeAlbumConversion(album));
  }

  // 获取所有相册
  async findAll(
    pageNum = 1,
    pageSize = 10,
    sortBy: 'id' | 'createTime' | 'updateTime' = 'id',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<FindAllAlbumsResult> {
    const totalItems = await this.prisma.album.count();

    const ps = pageSize > 0 ? pageSize : 10;
    const pn = pageNum > 0 ? pageNum : 1;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / ps) : 1;

    const validSortFields = ['id'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder === 'desc' ? 'desc' : 'asc';
    const orderByClause: Record<string, 'asc' | 'desc'> = {
      [orderByField]: orderDirection,
    };

    const skip = (pn - 1) * ps;

    const rows = await this.prisma.album.findMany({
      include: {
        albumType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: orderByClause,
      skip,
      take: ps,
    });

    const data: AlbumResponseDto[] = rows.map((album, idx) => {
      const formatted: any = {
        ...album,
        createTime: album.createTime
          ? album.createTime
              .toLocaleString('sv-SE', {
                timeZone: 'Asia/Shanghai',
                hour12: false,
              })
              .replace('T', ' ')
          : null,
        updateTime: album.updateTime
          ? album.updateTime
              .toLocaleString('sv-SE', {
                timeZone: 'Asia/Shanghai',
                hour12: false,
              })
              .replace('T', ' ')
          : null,
      };

      const safe = this.safeAlbumConversion(formatted);

      return {
        index: skip + idx + 1,
        ...safe,
      } as AlbumResponseDto;
    });

    const page: PageMeta = {
      pageNum: pn,
      pageSize: ps,
      totalItems,
      totalPages,
      sortBy: orderByField as 'id',
      sortOrder: orderDirection,
    };

    return { data, page };
  }

  // 获取相册总数
  async getTotalCount() {
    return await this.prisma.album.count();
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

    return this.safeAlbumsConversion(albums);
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

    return this.safeAlbumConversion(album);
  }

  // 获取所有相册类型
  async findAllTypes() {
    const types = await this.prisma.albumType.findMany();
    return types.map((type) => ({
      ...type,
      id: typeof type.id === 'bigint' ? String(type.id) : type.id,
    }));
  }

  // 创建相册
  async create(createAlbumDto: CreateAlbumDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user || user.role === 1) {
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

    return this.safeAlbumConversion(album);
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

    if (!user || user.role === 1) {
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

    return this.safeAlbumConversion(updatedAlbum);
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

    if (!user || user.role === 1) {
      throw new ForbiddenException('只有管理员才能删除相册');
    }

    await this.prisma.album.delete({
      where: { id },
    });

    return { success: true };
  }
}
