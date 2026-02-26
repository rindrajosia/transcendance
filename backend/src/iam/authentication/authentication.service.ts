import { ConflictException, Injectable, UnauthorizedException, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import type { ActiveUserData } from '../interfaces/active-user-data';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { InvalidatedRefreshTokenError } from './errors/invalidated-refresh-token-error';
import { Role } from 'src/roles/entities/role.entity';
import { RoleType } from 'src/roles/enums/role-type.enum';
import { OtpAuthenticationService } from './otp-authentication.service';


@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        private readonly otpAuthService: OtpAuthenticationService
    ){}

    async signUp(signUpDto: SignUpDto) {
        try {
            const role = await this.rolesRepository.findOne({where: { role: RoleType.USER}});
            if (!role) {
                throw new NotFoundException(`Role: ${RoleType.USER} not found`);
            }
            const user = new User();
            user.username = signUpDto.username;
            if (signUpDto.avatar_url)
                user.avatar_url = signUpDto.avatar_url;
            if (signUpDto.bio)
                user.bio = signUpDto.bio;
            user.email = signUpDto.email;
            user.password = await this.hashingService.hash(signUpDto.password);
            user.role = role;

            await this.usersRepository.save(user);
        } catch (err) {
            console.error(err);

            const pgUniqueViolationErrorCode = '23505';
            if(err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
        
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.usersRepository.findOneBy({
            email: signInDto.email,
        });
        if(!user) {
            throw new UnauthorizedException('User does not exists');
        }
        const isEqual = await this.hashingService.compare(
            signInDto.password,
            user.password
        );
        if(!isEqual) {
            throw new UnauthorizedException('Password does not match');
        }
        
        if(user.isTfaEnabled) {
            if (!signInDto.tfaCode) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
            const isValid = this.otpAuthService.verifyCode(signInDto.tfaCode, user.tfaSecret);
            if(!isValid) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }
        return await this.generateTokens(user);
    }

   async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        try {
             const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
            Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
            >(refreshTokenDto.refreshToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            
            const user = await this.usersRepository.findOneByOrFail({
                id: sub,
            });

            const isValid = await this.refreshTokenIdsStorage.validate(
                user.id,
                refreshTokenId
            );

            if(isValid) {
                await this.refreshTokenIdsStorage.invalidate(user.id);
            } else {
                throw new Error('Refresh token is invalid');
            }
            return await this.generateTokens(user);
        } catch(err) {
            if(err instanceof InvalidatedRefreshTokenError) {
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException();
        }
    }

    async generateTokens(user: User) {
        const refreshTokenId = randomUUID();
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                { email: user.email, role: user.role.role}
            ),
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
                refreshTokenId
            })
        ]);
        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

        return {
            accessToken,
            refreshToken
        };
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T){
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload,
            },
            {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                expiresIn,
            }
        );
    }
}
