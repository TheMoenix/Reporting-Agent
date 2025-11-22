import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SqlAgentService } from '../services/sql-agent.service';
import { Thread } from '../schemas/thread.schema';
import { QueryRequestInput } from '../dto/sql-agent.dto';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ThreadStats {
  @Field()
  totalThreads: number;

  @Field()
  threadsWithCheckpoints: number;

  @Field({ nullable: true })
  oldestCheckpoint?: Date;

  @Field({ nullable: true })
  newestCheckpoint?: Date;
}

@ObjectType()
export class CleanupResult {
  @Field(() => Int)
  deletedCount: number;

  @Field(() => ThreadStats)
  stats: ThreadStats;
}

@Resolver()
export class SqlAgentResolver {
  constructor(private readonly sqlAgentService: SqlAgentService) {}

  @Mutation(() => Thread, { nullable: true })
  async processQuery(
    @Args('input') input: QueryRequestInput,
  ): Promise<Thread | null> {
    try {
      return await this.sqlAgentService.processQuery(input);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Query(() => Thread, { nullable: true })
  async getThread(@Args('threadId') threadId: string): Promise<Thread | null> {
    return this.sqlAgentService.getUserThread(threadId, true);
  }

  @Query(() => [Thread])
  async getUserThreads(): Promise<Thread[]> {
    return this.sqlAgentService.getUserThreads();
  }
}
