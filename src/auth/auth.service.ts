import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 验证用户
  async validateUser(username: string, password: string): Promise<any> {
    if (!username) {
      throw new UnauthorizedException('用户名不能为空');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('密码错误');
    }

    const { password: _, ...result } = user;
    return result;
  }

  // login 方法
  async login(user: any) {
    try {
      /**
       * 是否已有令牌
       */
      const existingToken = await this.prisma.token.findFirst({
        where: { userId: user.uid },
      });

      const now = new Date();
      const tenMinutesFromNow = new Date(now);
      tenMinutesFromNow.setMinutes(tenMinutesFromNow.getMinutes() + 10);

      /**
       * 已有令牌且 access_token 至少 10 分钟内不过期
       */
      if (existingToken && existingToken.tokenExpires > tenMinutesFromNow) {
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: { lastUsed: now },
        });

        return existingToken.token;
      }

      /**
       * 令牌即将过期但refresh_token有效
       */
      if (
        existingToken &&
        existingToken.tokenExpires <= tenMinutesFromNow &&
        existingToken.refreshTokenExpires > now
      ) {
        const payload = {
          username: user.username,
          sub: user.uid,
          role: user.role,
          jti: uuidv4(),
          iat: Math.floor(Date.now() / 1000),
        };

        const newToken = this.jwtService.sign(payload);

        const tokenExpires = new Date(now);
        tokenExpires.setDate(tokenExpires.getDate() + 1); // 1天

        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            token: newToken,
            tokenExpires,
            lastUsed: now,
          },
        });

        return newToken;
      }

      /**
       * 需要完全创建新令牌（两者都过期或不存在）
       */
      const payload = {
        username: user.username,
        sub: user.uid,
        role: user.role,
        jti: uuidv4(),
        iat: Math.floor(Date.now() / 1000),
      };

      const token = this.jwtService.sign(payload);
      const refreshToken = uuidv4();

      const tokenExpires = new Date(now);
      tokenExpires.setDate(tokenExpires.getDate() + 1); // 1天

      const refreshTokenExpires = new Date(now);
      refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 14); // 14天

      if (existingToken) {
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            token,
            refreshToken,
            tokenExpires,
            refreshTokenExpires,
            lastUsed: now,
          },
        });
      } else {
        await this.prisma.token.create({
          data: {
            userId: user.uid,
            token,
            refreshToken,
            tokenExpires,
            refreshTokenExpires,
            lastUsed: now,
            createdAt: now,
          },
        });
      }

      return token;
    } catch (error) {
      if (error.code === 'P2002') {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.prisma.token.deleteMany({
          where: { userId: user.uid },
        });
        return this.login(user);
      }
      throw error;
    }
  }

  // 验证令牌
  async validateToken(token: string): Promise<any> {
    try {
      const tokenRecord = await this.prisma.token.findUnique({
        where: { token },
        include: { user: true },
      });

      // 如果令牌不存在
      if (!tokenRecord) {
        return null;
      }

      // 检查令牌是否过期
      if (new Date() > tokenRecord.tokenExpires) {
        return null;
      }

      // 更新最后使用时间
      await this.prisma.token.update({
        where: { id: tokenRecord.id },
        data: { lastUsed: new Date() },
      });

      return {
        userId: tokenRecord.user.uid,
        username: tokenRecord.user.username,
        role: tokenRecord.user.role,
      };
    } catch (error) {
      return null;
    }
  }

  // 使用刷新令牌获取新令牌
  async refreshToken(refreshToken: string): Promise<any> {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || new Date() > tokenRecord.refreshTokenExpires) {
      throw new UnauthorizedException('刷新令牌无效或已过期，请重新登录');
    }

    const payload = {
      username: tokenRecord.user.username,
      sub: tokenRecord.user.uid,
      role: tokenRecord.user.role,
    };

    const newToken = this.jwtService.sign(payload);

    const now = new Date();
    const tokenExpires = new Date(now);
    tokenExpires.setDate(tokenExpires.getDate() + 1); // 1天

    await this.prisma.token.update({
      where: { id: tokenRecord.id },
      data: {
        token: newToken,
        tokenExpires,
        lastUsed: now,
      },
    });

    return {
      access_token: newToken,
      user: {
        uid: tokenRecord.user.uid,
        username: tokenRecord.user.username,
        role: tokenRecord.user.role,
      },
    };
  }

  // 注销
  async logout(token: string): Promise<any> {
    try {
      await this.prisma.token.deleteMany({
        where: { token },
      });

      return { message: '注销成功' };
    } catch (error) {
      throw new BadRequestException('注销失败');
    }
  }

  // 注册
  async register(userData: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名已存在');
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        regtime: new Date(),
      },
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  // 管理员创建单个用户
  async createUser(userData: any, createdBy?: string) {
    if (!userData.username) {
      throw new BadRequestException('用户名不能为空');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new BadRequestException(`用户名 ${userData.username} 已存在`);
    }

    const userToCreate = {
      ...userData,
      password: userData.password || '123456',
      regtime: new Date(),
      role: userData.role !== undefined ? userData.role : 1,
    };

    const newUser = await this.prisma.user.create({
      data: userToCreate,
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  // 管理员批量创建用户
  async createUsers(usersData: any[], createdBy?: string) {
    if (!Array.isArray(usersData) || usersData.length === 0) {
      throw new BadRequestException('无效的用户数据数组');
    }

    const results: {
      success: any[];
      failed: Array<{ data: any; error: string }>;
    } = {
      success: [],
      failed: [],
    };

    const usernames = usersData.map((user) => user.username).filter(Boolean);
    const existingUsers = await this.prisma.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
      select: {
        username: true,
      },
    });

    const existingUsernames = new Set(
      existingUsers.map((user) => user.username),
    );

    for (const userData of usersData) {
      try {
        if (!userData.username) {
          results.failed.push({
            data: userData,
            error: '用户名不能为空',
          });
          continue;
        }

        if (existingUsernames.has(userData.username)) {
          results.failed.push({
            data: userData,
            error: `用户名 ${userData.username} 已存在`,
          });
          continue;
        }

        existingUsernames.add(userData.username);

        const userToCreate = {
          ...userData,
          password: userData.password || '123456',
          regtime: new Date(),
          role: userData.role !== undefined ? userData.role : 1,
        };

        const newUser = await this.prisma.user.create({
          data: userToCreate,
        });

        const { password: _, ...result } = newUser;
        results.success.push(result);
      } catch (error) {
        results.failed.push({
          data: userData,
          error: error.message || '创建用户失败',
        });
      }
    }

    return {
      totalSuccess: results.success.length,
      totalFailed: results.failed.length,
      successUsers: results.success,
      failedUsers: results.failed,
    };
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { uid: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== oldPassword) {
      throw new BadRequestException('原密码不正确');
    }

    await this.prisma.user.update({
      where: { uid: userId },
      data: { password: newPassword },
    });

    return { message: '密码修改成功' };
  }
}
