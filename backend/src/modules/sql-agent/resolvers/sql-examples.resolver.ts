import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SqlExamplesService } from '../services/sql-examples.service';
import { SqlExample } from '../services/clickhouse.service';

@Resolver()
export class SqlExamplesResolver {
  constructor(private readonly sqlExamplesService: SqlExamplesService) {}

  @Mutation(() => String)
  async addSqlExample(
    @Args('question') question: string,
    @Args('sql') sql: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('databaseSchema', { nullable: true }) databaseSchema?: string,
  ): Promise<string> {
    try {
      return await this.sqlExamplesService.addExample(
        question,
        sql,
        description,
        category,
        databaseSchema,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Query(() => [SqlExampleType])
  async getAllSqlExamples(): Promise<SqlExample[]> {
    try {
      return await this.sqlExamplesService.getAllExamples();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Query(() => [SqlExampleType])
  async searchSqlExamples(
    @Args('query') query: string,
    @Args('limit', { nullable: true, defaultValue: 5 }) limit?: number,
  ): Promise<SqlExample[]> {
    try {
      return await this.sqlExamplesService.findSimilarExamples(query, limit);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async rateQueryResult(
    @Args('threadId') threadId: string,
    @Args('interactionId') interactionId: string,
    @Args('isHelpful') isHelpful: boolean,
    @Args('feedback', { nullable: true }) feedback?: string,
  ): Promise<boolean> {
    try {
      return await this.sqlExamplesService.rateQueryResult(
        threadId,
        interactionId,
        isHelpful,
        feedback,
      );
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async deleteSqlExample(@Args('id') id: string): Promise<boolean> {
    try {
      await this.sqlExamplesService.deleteExample(id);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

// GraphQL Type for SqlExample
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SqlExampleType {
  @Field({ nullable: true })
  id?: string;

  @Field()
  question: string;

  @Field()
  sql: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  database_schema?: string;

  @Field({ nullable: true })
  created_at?: Date;

  @Field({ nullable: true })
  similarity_score?: number;

  @Field({ nullable: true })
  quality_score?: number;

  @Field({ nullable: true })
  usage_count?: number;

  @Field({ nullable: true })
  success_count?: number;

  @Field({ nullable: true })
  is_verified?: boolean;
}
