import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { config } from 'dotenv';
config();

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}
  async set(model, args, value: any, ttl?: string | number): Promise<void> {
    const key = this.buildCacheKey(model, args);
    await this.redis.set(
      key,
      JSON.stringify(value),
      'EX',
      ttl || process.env.REDIS_TTL,
    );
  }
  async get<T>(model, args): Promise<T> {
    const key = this.buildCacheKey(model, args);
    const cache = await this.redis.get(key);
    return cache ? JSON.parse(cache) : undefined;
  }

  public async invalidate(models: string | string[]) {
    if (typeof models === 'string') {
      const keys = await this.redis.keys(`*_${models}*`);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } else {
      await Promise.all(
        models.map(async (m) => {
          const keys = await this.redis.keys(`*_${m}*`);
          if (keys.length > 0) {
            await this.redis.del(keys);
          }
        }),
      );
    }
  }

  public async clear(key: string) {
    const keys = await this.redis.keys(key);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
  public async pureGet(key: string) {
    const cache = await this.redis.get(key);
    return cache ? JSON.parse(cache) : undefined;
  }
  public async pureSet(key: string, data: any, ttl: number = 86_400) {
    if (key) {
      await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
    }
  }
  private buildCacheKey(model, args) {
    const argKeys = Object.keys(args);
    const parsedKey = argKeys.map((k) => `${k}#${args[k]}`).join('|');
    return `${process.env.DEPLOYMENT_NAME}_${model}${parsedKey}`;
  }
  getInstance() {
    return this.redis;
  }
}
