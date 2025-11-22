import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { SimpleMessage, DownloadableFileType } from '../dto/sql-agent.dto';
import { DownloadableFile } from '../types/agent-state';
import { Thread } from './thread.schema';
import { SqlResult } from './query-result.schema';
import { Visualization } from './visualization.schema';

export type InteractionDocument = Interaction & Document;

@Schema({
  timestamps: true,
  collection: 'interactions',
})
@ObjectType()
export class Interaction {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Prop({ required: true })
  @Field()
  threadId: string;

  // Query details
  @Prop({ required: true })
  @Field()
  userQuery: string;

  @Prop()
  @Field({ nullable: true })
  intent?: string;

  @Prop()
  @Field({ nullable: true })
  confidence?: number;

  // Response
  @Prop()
  @Field({ nullable: true })
  response?: string;

  // Status and timing
  @Prop({
    default: 'pending',
    enum: [
      'pending',
      'success',
      'failed',
      'timeout',
      'syntax_error',
      'permission_error',
    ],
  })
  @Field()
  execution_status:
    | 'pending'
    | 'success'
    | 'failed'
    | 'timeout'
    | 'syntax_error'
    | 'permission_error';

  @Prop()
  @Field({ nullable: true })
  execution_time_ms?: number;

  @Prop()
  @Field({ nullable: true })
  error_message?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SqlResult' })
  @Field(() => SqlResult, { nullable: true })
  sqlResult?: SqlResult;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' })
  @Field(() => Visualization, { nullable: true })
  visualization?: Visualization;

  // Small metadata that can stay in the document
  @Prop({ type: Array, default: [] })
  @Field(() => [DownloadableFileType], { nullable: true })
  downloadableFiles?: DownloadableFile[];

  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  used_examples?: string[];

  @Prop({ type: Array, default: [] })
  @Field(() => [SimpleMessage])
  messages: SimpleMessage[];

  // User feedback
  @Prop()
  @Field({ nullable: true })
  user_rating?: 'helpful' | 'not_helpful' | 'incorrect';

  @Prop()
  @Field({ nullable: true })
  user_feedback?: string;

  @Prop()
  @Field({ nullable: true })
  feedback_timestamp?: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);
