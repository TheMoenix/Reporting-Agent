import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { CommonModule } from './modules/common/common.module';
import { SqlAgentModule } from './modules/sql-agent/sql-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://test:test@mongo:27017',
      {
        authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
        dbName: 'reporting_agent',
      },
    ),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      debug: true,
      autoSchemaFile: true,
      sortSchema: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),
    CommonModule,
    SqlAgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log(process.env);
  }
}
