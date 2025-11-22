import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export type SqlResultDocument = SqlResult & Document;

@Schema({
  timestamps: true,
  collection: 'query_results',
})
@ObjectType()
export class SqlResult {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Prop({ required: true })
  @Field()
  sql: string;

  @Prop({ type: Array, default: [] })
  @Field(() => [GraphQLJSONObject])
  rows: any[];

  @Prop({ default: 0 })
  @Field()
  row_count: number;

  @Prop({
    default: 'success',
    enum: ['success', 'failed', 'timeout', 'syntax_error', 'permission_error'],
  })
  @Field()
  status:
    | 'success'
    | 'failed'
    | 'timeout'
    | 'syntax_error'
    | 'permission_error';

  @Prop()
  @Field({ nullable: true })
  error_message?: string;

  @Prop()
  @Field({ nullable: true })
  execution_time_ms?: number;
}

export const QueryResultSchema = SchemaFactory.createForClass(SqlResult);
