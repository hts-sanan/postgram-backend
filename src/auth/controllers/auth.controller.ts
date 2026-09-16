import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { SignupDto } from '../dto/signup.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a new account. Returns an access token and refresh token.' })
  @ApiResponse({ status: 201, description: 'Account created successfully.' })
  @ApiResponse({ status: 409, description: 'Username already taken.' })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.username, dto.password);
  }

  @ApiOperation({ summary: 'Log in with an existing username and password.' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid username or password.' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @ApiOperation({ summary: 'Exchange a valid refresh token for a new access token + refresh token pair.' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Log out — revokes the current access token and the provided refresh token.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any, @Body() dto: RefreshTokenDto) {
    const authorization = req.headers.authorization;
    const accessToken = authorization.slice(7).trim();

    return this.authService.logout(
      req.user.sub,
      accessToken,
      dto.refreshToken,
    );
  }
}
