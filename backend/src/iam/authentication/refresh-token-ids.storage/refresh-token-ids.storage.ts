import { Injectable } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { InvalidatedRefreshTokenError } from "../errors/invalidated-refresh-token-error";

@Injectable()
export class RefreshTokenIdsStorage {
    constructor(private readonly redisClient: RedisService){}

    async insert(userId: number, tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: number, tokenId: string): Promise<boolean> {
        const storedId = await this.redisClient.get(this.getKey(userId));
        if(storedId !== tokenId) {
            throw new InvalidatedRefreshTokenError();
        }
        return storedId !== null && storedId === tokenId;
    }

    async invalidate(userId: number): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: number): string {
        return `user-${userId}`;
    }
}
