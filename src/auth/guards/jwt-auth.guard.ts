import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return false;
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return false;
    }

    request.user = await this.authService.validateAccessToken(
      accessToken,
    );

    return true;
  }
}