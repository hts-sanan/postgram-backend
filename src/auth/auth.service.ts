import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(username: string, password: string) {
    const existingUser = await this.usersService.findByUsername(username);

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.usersService.create(username, passwordHash);

    return this.issueTokens(user.id, user.username);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.issueTokens(user.id, user.username);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; type?: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken || storedToken.user.deletedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return this.issueTokens(
      storedToken.user.id,
      storedToken.user.username,
    );
  }

  async logout(userId: string, accessToken: string, refreshToken: string) {
    const now = new Date();

    await this.prisma.authToken.updateMany({
      where: {
        userId,
        tokenHash: this.hashToken(accessToken),
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async validateAccessToken(
    accessToken: string,
  ): Promise<{ sub: string; username: string }> {
    let payload: { sub: string; username: string; type?: string };

    try {
      payload = await this.jwtService.verifyAsync(accessToken);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!payload.sub || payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid access token');
    }

    const tokenHash = this.hashToken(accessToken);

    const storedToken = await this.prisma.authToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Access token is expired or revoked');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    return {
      sub: user.id,
      username: user.username,
    };
  }

  private async issueTokens(userId: string, username: string) {
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      username,
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );

    await this.prisma.authToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(accessToken),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}