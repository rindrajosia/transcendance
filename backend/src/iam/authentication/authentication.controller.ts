import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActiveUser } from '../decorators/active-user.decorator';
import type { ActiveUserData } from '../interfaces/active-user-data';
import { OtpAuthenticationService } from './otp-authentication.service';
import type { Request, Response } from 'express';
import { toFileStream } from 'qrcode';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly otpAuthService: OtpAuthenticationService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ){}

    @Post('sign-up')
    signUp(
        @Body() signUpDto: SignUpDto,
    ) {
        return this.authService.signUp(signUpDto);
    }

    @Get()
    user(
        @ActiveUser() user: ActiveUserData,
        @Req() request: Request
    )
    {
        const refreshToken = request.cookies['refreshToken'];
        if (!refreshToken)
            throw new UnauthorizedException();
        return this.authService.getUser({refreshToken: refreshToken});
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({passthrough: true}) response: Response
    ) {
        const credential = await this.authService.signIn(signInDto);
        
        response.cookie('refreshToken', credential.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
        });

        return credential;
    }

    @HttpCode(HttpStatus.OK)
    @Post('log-out')
    logout(
        @ActiveUser() user: ActiveUserData,
        @Res({passthrough: true}) response: Response,
        @Req() request: Request,
    ) {
        
        const refreshToken = request.cookies['refreshToken'];
        if (!refreshToken)
            throw new UnauthorizedException();
        response.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        return this.authService.logout({refreshToken});
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-tokens')
    async refreshTokens(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response
    ) {
        
        const refreshToken = request.cookies['refreshToken'];
        if (!refreshToken)
            throw new UnauthorizedException();

         const credential = await this.authService.refreshTokens({refreshToken});
        
        response.cookie('refreshToken', credential.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
        });

        return credential;
    }

    @Auth(AuthType.Bearer)
    @HttpCode(HttpStatus.OK)
    @Post('2fa/generate')
    async generateQrCode(
        @ActiveUser() activeUSer: ActiveUserData,
        @Res() response: Response
    ) {
        const { secret, uri } = await this.otpAuthService.generateSecret(
            activeUSer.email
        );

        await this.otpAuthService.enableTfaForUser(activeUSer.email, secret);
        response.type('png');

        return toFileStream(response, uri);
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
