import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const config = {
          host: process.env.REDIS_HOST || 'redis',
          port: 6379,
        };
        return new Redis(config);
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CommonModule {}
