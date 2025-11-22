import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export type VisualizationDocument = Visualization & Document;

@Schema({
  timestamps: true,
  collection: 'visualizations',
})
@ObjectType()
export class Visualization {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Prop({ default: false })
  @Field()
  shouldVisualize: boolean;

  @Prop()
  @Field({ nullable: true })
  reasoning?: string;

  @Prop({ type: Array, default: [] })
  @Field(() => [GraphQLJSONObject])
  graphs: Array<{
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table';
    title: string;
    config: {
      xAxis?: {
        field: string;
        label: string;
        type?: 'category' | 'time' | 'value';
      };
      yAxis?: {
        field: string;
        label: string;
        type?: 'value' | 'category';
      };
      series?: Array<{
        field: string;
        label: string;
        color?: string;
      }>;
      colors?: string[];
      showLegend?: boolean;
      showValues?: boolean;
    };
    reasoning?: string;
  }>;
}

export const VisualizationSchema = SchemaFactory.createForClass(Visualization);
