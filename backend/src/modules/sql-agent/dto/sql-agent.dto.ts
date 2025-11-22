import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DownloadableFile } from '../types/agent-state';

@InputType()
export class QueryRequestInput {
  @Field()
  @IsString()
  query: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  threadId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  connectionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  llmProvider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locale?: 'ar' | 'en';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;
}

@ObjectType()
export class SimpleMessage {
  @Field()
  role: 'user' | 'assistant' | 'system' | 'tool_call' | 'tool_response';

  @Field()
  interactionId: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  timestamp?: Date;

  @Field({ nullable: true })
  step?: string; // NEW: workflow step (contextLoader, intentClassifier, etc.)

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: any; // NEW: additional tracking data
}

@ObjectType()
export class DownloadableFileType {
  @Field()
  url: string;

  @Field()
  filename: string;

  @Field()
  timestamp: Date;
}

@ObjectType()
export class ProgressUpdate {
  @Field()
  step: string;

  @Field()
  message: string;

  @Field()
  threadId: string;

  @Field(() => Number, { nullable: true })
  percentage?: number;

  @Field({ nullable: true })
  note?: string;
}
