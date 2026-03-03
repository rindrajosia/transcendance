import { ConflictException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthenticationService } from '../authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { RoleType } from 'src/roles/enums/role-type.enum';
import { Auth, AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';


@Auth(AuthType.None)
@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
    private oauthClient: OAuth2Client;

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthenticationService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    ){}

    onModuleInit() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        this.oauthClient = new OAuth2Client(clientId, clientSecret);
    }

    async authenticate(token: string) {
        try {
            const loginTicket = await this.oauthClient.verifyIdToken({
                idToken: token,
            });
            const payload = loginTicket.getPayload();

            if (!payload) {
                throw new UnauthorizedException('Invalid Google token');
            }

            const role = await this.rolesRepository.findOne({where: { role: RoleType.USER}});
            if (!role) {
                throw new NotFoundException(`Role: ${RoleType.USER} not found`);
            }

            const email = payload.email;
            const googleId = payload.sub;
            const username = payload.name;
            const avatar_url = payload.picture;

            if (!email) {
                throw new UnauthorizedException('Email not provided by Google');
            }

            const user = await this.userRepository.findOneBy({googleId});
            if(user){
                return this.authService.generateTokens(user);
            } else {
                const newUser = await this.userRepository.save({username, email, googleId, role, avatar_url});
                return this.authService.generateTokens(newUser);
            }
        }catch(err) {
            const pgUniqueViolationErrorCode = '23505';
            if(err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }
            throw new UnauthorizedException();
        }
    }
}
