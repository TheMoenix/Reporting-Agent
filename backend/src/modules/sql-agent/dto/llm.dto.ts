import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LLMProvider {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  provider: string;

  @Field()
  model: string;

  @Field()
  isAvailable: boolean;
}
