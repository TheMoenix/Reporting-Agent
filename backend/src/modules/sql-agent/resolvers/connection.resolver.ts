import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Connection } from '../schemas/connection.schema';
import { ConnectionService } from '../services/connection.service';
import {
  CreateConnectionDto,
  UpdateConnectionDto,
  ConnectionTestResult,
} from '../dto/connection.dto';

@Resolver(() => Connection)
export class ConnectionResolver {
  constructor(private readonly connectionService: ConnectionService) {}

  @Mutation(() => Connection)
  async createConnection(
    @Args('createConnectionInput') createConnectionDto: CreateConnectionDto,
  ): Promise<Connection> {
    return this.connectionService.create(createConnectionDto);
  }

  @Query(() => [Connection])
  async connections(): Promise<Connection[]> {
    return this.connectionService.findAll();
  }

  @Query(() => Connection)
  async connection(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Connection> {
    return this.connectionService.findOne(id);
  }

  @Mutation(() => Connection)
  async updateConnection(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateConnectionInput') updateConnectionDto: UpdateConnectionDto,
  ): Promise<Connection> {
    return this.connectionService.update(id, updateConnectionDto);
  }

  @Mutation(() => Boolean)
  async deleteConnection(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.connectionService.remove(id);
  }

  @Query(() => ConnectionTestResult)
  async testConnection(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ConnectionTestResult> {
    return this.connectionService.testConnection(id);
  }

  @Query(() => [String])
  async availableConnectionTypes(): Promise<string[]> {
    return this.connectionService.getAvailableConnectionTypes();
  }
}
