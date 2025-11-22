import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { ProgressUpdate } from '../dto/sql-agent.dto';
import { PubSubService } from '../services/pubsub.service';

@Resolver()
export class SqlAgentSubscriptionResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => ProgressUpdate, {
    filter: (payload, variables) => {
      return variables.threadId === payload.threadId;
    },
    resolve: (value) => ({
      step: value.step,
      message: value.message.split('] ')[1] || value.message,
      threadId: value.threadId,
      percentage: value.percentage,
      note: value.note,
    }),
  })
  async threadProgress(
    @Args('threadId', { type: () => String }) threadId: string,
  ): Promise<AsyncIterableIterator<ProgressUpdate>> {
    return this.pubSubService.asyncIterableIterator('queryProgress');
  }
}
