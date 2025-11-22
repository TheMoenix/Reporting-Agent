import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { DatabaseType } from '../schemas/connection.schema';

@InputType()
export class CreateConnectionDto {
  @Field()
  @IsString()
  @MinLength(1)
  name: string;

  @Field()
  @IsString()
  @MinLength(1)
  host: string;

  @Field(() => Int)
  @IsNumber()
  port: number;

  @Field()
  @IsString()
  @MinLength(1)
  database: string;

  @Field()
  @IsString()
  @MinLength(1)
  username: string;

  @Field()
  @IsString()
  @MinLength(1)
  password: string;

  @Field(() => DatabaseType)
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateConnectionDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  host?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  port?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  database?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => DatabaseType, { nullable: true })
  @IsOptional()
  @IsEnum(DatabaseType)
  type?: DatabaseType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@ObjectType()
export class ConnectionTestResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}
