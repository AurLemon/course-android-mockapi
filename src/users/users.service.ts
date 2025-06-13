import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSelfDto,
} from './dto/user.dto';
import { User } from '@prisma/client';
// 定义用户列表项类型
type UserListItem = {
  index: number;
  uid: number;
  username: string;
  trueName: string | null;
  sex: string | null;
  telephone: string | null;
  birth: string | null;
  dept: string | null;
  role: number;
  regtime: string;
  balance: number;
};

// 分页+排序元数据类型
type PageMeta = {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

// 最终返回类型
type UserListResult = {
  data: UserListItem[];
  page: PageMeta;
};

// 定义用户信息返回类型
type UserInfo = {
  uid: number;
  username: string;
  trueName: string | null;
  sex: string | null;
  telephone: string | null;
  birth: string | null;
  dept: string | null;
  role: number;
  balance: number;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 获取所有用户列表
  async findAll(
    pageNum = 1,
    pageSize = 15,
    sortBy = 'uid',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<UserListResult> {
    // 1. 计算总记录数
    const totalItems = await this.prisma.user.count();

    // 2. 计算总页数
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    // 3. 校验并拼装排序字段
    const validSortFields = ['uid', 'regtime'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'uid';
    const orderDirection = sortOrder === 'desc' ? 'desc' : 'asc';

    // 4. 计算跳过数量
    const skip = (pageNum - 1) * pageSize;

    // 5. 拉取当前页数据
    const rows = await this.prisma.user.findMany({
      select: {
        uid: true,
        username: true,
        trueName: true,
        sex: true,
        telephone: true,
        birth: true,
        dept: true,
        role: true,
        regtime: true,
        balance: true,
      },
      orderBy: { [orderByField]: orderDirection },
      skip,
      take: pageSize,
    });

    // 6. 格式化并注入全局 index
    const data: UserListItem[] = rows.map((user, idx) => ({
      index: skip + idx + 1,
      uid: user.uid,
      username: user.username,
      trueName: user.trueName,
      sex: user.sex,
      telephone: user.telephone,
      birth: user.birth,
      dept: user.dept,
      role: user.role,
      balance: user.balance,
      regtime: user.regtime
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })
        .replace('T', ' '),
    }));

    return {
      data,
      page: {
        pageNum,
        pageSize,
        totalItems,
        totalPages,
        sortBy: orderByField,
        sortOrder: orderDirection,
      },
    };
  }

  // 新增统计方法
  async getTotalCount(): Promise<number> {
    return this.prisma.user.count();
  }

  // 通过ID获取用户信息
  async findById(uid: number): Promise<UserInfo> {
    const user = await this.prisma.user.findUnique({
      where: { uid },
      select: {
        uid: true,
        username: true,
        trueName: true,
        sex: true,
        telephone: true,
        birth: true,
        dept: true,
        role: true,
        balance: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${uid} 不存在`);
    }

    return user;
  }

  // 通过用户名获取用户
  async findByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`用户名 ${username} 不存在`);
    }

    return user;
  }

  // 创建新用户
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException(`用户名 ${createUserDto.username} 已存在`);
    }

    // 创建新用户
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: createUserDto.password || '123456', // 默认密码
      },
    });
  }

  // 更新用户信息
  async update(
    uid: number,
    updateUserDto: UpdateUserDto | UpdateUserSelfDto,
  ): Promise<User> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { uid },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${uid} 不存在`);
    }

    // 更新用户信息
    return this.prisma.user.update({
      where: { uid },
      data: updateUserDto,
    });
  }

  // 删除用户
  async remove(uid: number): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { uid },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${uid} 不存在`);
    }

    // 删除用户
    await this.prisma.user.delete({
      where: { uid },
    });
  }

  // 用户注销，使token失效
  async logout(uid: number): Promise<void> {
    // 删除用户的所有token
    await this.prisma.token.deleteMany({
      where: { userId: uid },
    });
  }
}
