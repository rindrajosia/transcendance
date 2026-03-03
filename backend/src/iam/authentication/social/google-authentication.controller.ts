import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { AuthType } from '../enums/auth-type.enum';
import { Auth } from '../decorators/auth.decorator';
import type { Request, Response } from 'express';
import jwtConfig from 'src/iam/config/jwt.config';
import type { ConfigType } from '@nestjs/config';

@Auth(AuthType.None) // make it public
@Controller('authentication/google')
export class GoogleAuthenticationController {
    constructor(
        private readonly googleAuthService: GoogleAuthenticationService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ){}

    @Post()
    async authenticate(
        @Body() tokenDto: GoogleTokenDto,
        @Res({passthrough: true}) response: Response
    ) {
        
        const credential = await this.googleAuthService.authenticate(tokenDto.token);
        
        response.cookie('refreshToken', credential.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
        });

        return credential;
    }
}
