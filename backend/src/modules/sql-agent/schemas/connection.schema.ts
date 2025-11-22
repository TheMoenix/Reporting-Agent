import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export type ConnectionDocument = Connection & Document;

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  MSSQL = 'mssql',
}

registerEnumType(DatabaseType, {
  name: 'DatabaseType',
  description: 'Supported database types',
});

@Schema({
  timestamps: true,
  collection: 'connections',
})
@ObjectType()
export class Connection {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true })
  @Field()
  host: string;

  @Prop({ required: true })
  @Field()
  port: number;

  @Prop({ required: true })
  @Field()
  database: string;

  @Prop({ required: true })
  @Field()
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: Object.values(DatabaseType),
    default: DatabaseType.POSTGRES,
  })
  @Field(() => DatabaseType)
  type: DatabaseType;

  @Prop({ default: true })
  @Field()
  isActive: boolean;

  @Prop()
  @Field({ nullable: true })
  description?: string;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);

// Add indexes
ConnectionSchema.index({ isActive: 1 });
ConnectionSchema.index({ name: 1 }, { unique: true });
