import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async onModuleInit(): Promise<void> {
    const pong = await this.redisClient.ping();

    if (pong !== 'PONG') {
      throw new Error(`Redis ping failed: ${pong}`);
    }

    this.logger.log('Redis ping successful');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.redisClient.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
