import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Connection,
  ConnectionDocument,
  DatabaseType,
} from '../schemas/connection.schema';
import {
  CreateConnectionDto,
  UpdateConnectionDto,
  ConnectionTestResult,
} from '../dto/connection.dto';
import {
  SqlDatabase,
  SqlDatabaseOptionsParams,
} from '@langchain/classic/sql_db';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectModel(Connection.name)
    private connectionModel: Model<ConnectionDocument>,
  ) {}

  async create(createConnectionDto: CreateConnectionDto): Promise<Connection> {
    // Check if connection name already exists for this user
    const existingConnection = await this.connectionModel.findOne({
      name: createConnectionDto.name,
    });

    if (existingConnection) {
      throw new BadRequestException(
        `Connection with name "${createConnectionDto.name}" already exists for this user`,
      );
    }

    const connection = new this.connectionModel(createConnectionDto);
    return connection.save();
  }

  async findAll(): Promise<Connection[]> {
    return this.connectionModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Connection> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid connection ID');
    }

    const connection = await this.connectionModel.findOne({
      _id: id,
      isActive: true,
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    return connection;
  }

  async update(
    id: string,
    updateConnectionDto: UpdateConnectionDto,
  ): Promise<Connection> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid connection ID');
    }

    // If name is being updated, check for duplicates
    if (updateConnectionDto.name) {
      const existingConnection = await this.connectionModel.findOne({
        name: updateConnectionDto.name,
        _id: { $ne: id },
      });

      if (existingConnection) {
        throw new BadRequestException(
          `Connection with name "${updateConnectionDto.name}" already exists`,
        );
      }
    }

    const connection = await this.connectionModel.findOneAndUpdate(
      { _id: id, isActive: true },
      updateConnectionDto,
      { new: true },
    );

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    return connection;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid connection ID');
    }

    const result = await this.connectionModel.deleteOne({
      _id: id,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Connection not found');
    }

    return true;
  }

  async testConnection(id: string): Promise<ConnectionTestResult> {
    const connection = await this.findOne(id);

    try {
      const sqlDatabase =
        await this.createSqlDatabaseFromConnection(connection);

      // Test with a simple query
      const testQuery = this.getTestQuery(connection.type);
      await sqlDatabase.run(testQuery);

      return {
        success: true,
        message: 'SQL connection successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Connection failed',
      };
    }
  }

  async createSqlDatabaseFromConnection(
    connection: Connection,
  ): Promise<SqlDatabase> {
    const options: SqlDatabaseOptionsParams = {
      appDataSourceOptions: {
        type: connection.type as any,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
      },
      ignoreTables: [], // Can be configured per connection if needed
    };

    return SqlDatabase.fromOptionsParams(options);
  }

  private getTestQuery(dbType: DatabaseType): string {
    switch (dbType) {
      case DatabaseType.POSTGRES:
        return 'SELECT 1 as test';
      case DatabaseType.MYSQL:
        return 'SELECT 1 as test';
      case DatabaseType.SQLITE:
        return 'SELECT 1 as test';
      case DatabaseType.MSSQL:
        return 'SELECT 1 as test';
      default:
        return 'SELECT 1 as test';
    }
  }

  getAvailableConnectionTypes(): string[] {
    return Object.values(DatabaseType);
  }
}
