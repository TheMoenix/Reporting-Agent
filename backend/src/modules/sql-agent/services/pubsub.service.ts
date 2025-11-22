import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class PubSubService {
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  publish(triggerName: string, payload: any): Promise<void> {
    return this.pubSub.publish(triggerName, payload);
  }

  asyncIterableIterator<T>(
    triggers: string | string[],
  ): AsyncIterableIterator<T> {
    return this.pubSub.asyncIterableIterator<T>(triggers);
  }
}
