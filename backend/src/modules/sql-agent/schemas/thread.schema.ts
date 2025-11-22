import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Interaction } from './interaction.schema';
import { GraphQLJSONObject } from 'graphql-type-json';
import { SimpleMessage } from '../dto/sql-agent.dto';

export type ThreadDocument = Thread & Document;

// Thread Schema - Main document with references to related data
@Schema({
  timestamps: true,
  collection: 'threads',
})
@ObjectType()
export class Thread {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Prop({ required: true })
  @Field()
  threadId: string;

  @Prop()
  @Field({ nullable: true })
  topic?: string;

  @Prop({ default: 'en' })
  @Field({ nullable: true })
  locale?: 'ar' | 'en';

  @Prop({ default: 'UTC' })
  @Field({ nullable: true })
  timezone?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' })
  @Field(() => ID, { nullable: true })
  connectionId?: Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Interaction' })
  @Field(() => [Interaction])
  interactions?: Interaction[];
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

// Essential indexes only
ThreadSchema.index({ threadId: 1 }, { unique: true });

// Ensure virtual fields are serialized
ThreadSchema.set('toJSON', { virtuals: true });
ThreadSchema.set('toObject', { virtuals: true });

// Pre-remove middleware to cascade delete related documents
ThreadSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    const threadDoc = this as ThreadDocument;

    // Delete all interactions for this thread
    await threadDoc.db
      .collection('interactions')
      .deleteMany({ threadId: threadDoc.threadId });

    // Delete all query results for this thread
    await threadDoc.db
      .collection('query_results')
      .deleteMany({ threadId: threadDoc.threadId });

    // Delete all visualizations for this thread
    await threadDoc.db
      .collection('visualizations')
      .deleteMany({ threadId: threadDoc.threadId });
  },
);

// Pre-remove middleware for Model.deleteOne
ThreadSchema.pre(
  'deleteOne',
  { document: false, query: true },
  async function () {
    const query = this.getQuery();
    const docs = await this.model.find(query);

    for (const doc of docs) {
      // Delete all interactions for this thread
      await this.model.db
        .collection('interactions')
        .deleteMany({ threadId: doc.threadId });

      // Delete all query results for this thread
      await this.model.db
        .collection('query_results')
        .deleteMany({ threadId: doc.threadId });

      // Delete all visualizations for this thread
      await this.model.db
        .collection('visualizations')
        .deleteMany({ threadId: doc.threadId });
    }
  },
);

// Pre-remove middleware for Model.deleteMany
ThreadSchema.pre(
  'deleteMany',
  { document: false, query: true },
  async function () {
    const query = this.getQuery();
    const docs = await this.model.find(query);

    for (const doc of docs) {
      // Delete all interactions for this thread
      await this.model.db
        .collection('interactions')
        .deleteMany({ threadId: doc.threadId });

      // Delete all query results for this thread
      await this.model.db
        .collection('query_results')
        .deleteMany({ threadId: doc.threadId });

      // Delete all visualizations for this thread
      await this.model.db
        .collection('visualizations')
        .deleteMany({ threadId: doc.threadId });
    }
  },
);
