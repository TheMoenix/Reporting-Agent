import { Injectable } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';

export interface SqlExample {
  id?: string;
  question: string;
  sql: string;
  description?: string;
  category?: string;
  database_schema?: string;
  created_at?: Date;
  updated_at?: Date;
  embedding?: number[];
  similarity_score?: number;
  // Quality tracking fields
  quality_score?: number;
  usage_count?: number;
  success_count?: number;
  error_count?: number;
  is_verified?: boolean;
  feedback_count?: number;
  positive_feedback?: number;
}

@Injectable()
export class ClickHouseService {
  private client: ClickHouseClient;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = createClient({
      url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USER || 'dev',
      password: process.env.CLICKHOUSE_PASSWORD || 'dev',
      database: process.env.CLICKHOUSE_DATABASE || 'sql_examples',
    });

    // Test connection and create database if needed
    this.testConnectionAndInitialize().catch((error) => {
      console.error(`Failed to initialize ClickHouse database: ${error}`);
    });
  }

  async testConnectionAndInitialize() {
    try {
      await this.initializeDatabase();
    } catch (error) {
      console.error(`ClickHouse initialization failed: ${error}`);
      throw error;
    }
  }

  private async initializeDatabase() {
    try {
      // First, try to connect without specifying a database
      const basicClient = createClient({
        url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'dev',
        password: process.env.CLICKHOUSE_PASSWORD || 'dev',
      });

      // Create database if it doesn't exist
      await basicClient.command({
        query: `CREATE DATABASE IF NOT EXISTS sql_examples`,
      });

      // Now create examples table with vector support and quality tracking
      await this.client.command({
        query: `
          CREATE TABLE IF NOT EXISTS sql_examples.examples (
            id String DEFAULT generateUUIDv4(),
            question String NOT NULL,
            sql String NOT NULL,
            description String DEFAULT '',
            category String DEFAULT '',
            database_schema String DEFAULT '',
            created_at DateTime DEFAULT now(),
            updated_at DateTime DEFAULT now(),
            embedding Array(Float32) DEFAULT [],
            quality_score Float32 DEFAULT 0.5,
            usage_count UInt32 DEFAULT 0,
            success_count UInt32 DEFAULT 0,
            error_count UInt32 DEFAULT 0,
            is_verified Bool DEFAULT false,
            feedback_count UInt32 DEFAULT 0,
            positive_feedback UInt32 DEFAULT 0
          ) ENGINE = MergeTree()
          ORDER BY (id, created_at)
          PRIMARY KEY (id)
        `,
      });

      // Add missing columns if table exists but doesn't have them
      await this.ensureColumnsExist();
    } catch (error) {
      console.error(`Failed to initialize ClickHouse database: ${error}`);
      throw error;
    }
  }

  private async ensureColumnsExist() {
    try {
      // List of columns that might be missing in existing tables
      const columnsToAdd = [
        'updated_at DateTime DEFAULT now()',
        'quality_score Float32 DEFAULT 0.5',
        'usage_count UInt32 DEFAULT 0',
        'success_count UInt32 DEFAULT 0',
        'error_count UInt32 DEFAULT 0',
        'is_verified Bool DEFAULT false',
        'feedback_count UInt32 DEFAULT 0',
        'positive_feedback UInt32 DEFAULT 0',
      ];

      for (const column of columnsToAdd) {
        try {
          await this.client.command({
            query: `ALTER TABLE sql_examples.examples ADD COLUMN IF NOT EXISTS ${column}`,
          });
        } catch (columnError) {
          // Column might already exist, which is fine
          console.debug(`Column might already exist: ${columnError.message}`);
        }
      }
    } catch (error) {
      console.error(`Failed to ensure columns exist: ${error}`);
      // Don't throw error - this is not critical
    }
  }

  async addExample(
    example: Omit<SqlExample, 'id' | 'created_at'>,
  ): Promise<string> {
    try {
      const id = `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await this.client.insert({
        table: 'sql_examples.examples',
        values: [
          {
            id,
            question: example.question,
            sql: example.sql,
            description: example.description || '',
            category: example.category || '',
            database_schema: example.database_schema || '',
            embedding: example.embedding || [],
          },
        ],
        format: 'JSONEachRow',
      });

      console.debug(`Added SQL example with ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`Failed to add SQL example: ${error}`);
      throw error;
    }
  }

  async searchSimilarExamples(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.7,
  ): Promise<SqlExample[]> {
    try {
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.debug('No embedding provided, falling back to text search');
        return this.searchByText('', limit);
      }

      console.debug(
        `Searching with embedding of ${queryEmbedding.length} dimensions, threshold: ${threshold}`,
      );

      // Use cosine similarity for vector search
      const resultSet = await this.client.query({
        query: `
          SELECT 
            id,
            question,
            sql,
            description,
            category,
            database_schema,
            created_at,
            embedding,
            cosineDistance(embedding, [${queryEmbedding.join(',')}]) as distance,
            1 - cosineDistance(embedding, [${queryEmbedding.join(',')}]) as similarity_score
          FROM sql_examples.examples
          WHERE length(embedding) > 0
            AND length(embedding) = ${queryEmbedding.length}
          ORDER BY distance ASC
          LIMIT ${limit}
        `,
        format: 'JSONEachRow',
      });

      const examples: SqlExample[] = [];
      const responseText = await resultSet.text();
      const lines = responseText.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const row = JSON.parse(line);
            if (row.similarity_score >= threshold) {
              examples.push({
                id: row.id,
                question: row.question,
                sql: row.sql,
                description: row.description,
                category: row.category,
                database_schema: row.database_schema,
                created_at: new Date(row.created_at),
                similarity_score: row.similarity_score,
              });
            } else {
              console.debug(
                `Filtered out example with similarity ${row.similarity_score} < ${threshold}: "${row.question.substring(0, 50)}..."`,
              );
            }
          } catch (parseError) {
            console.error(`Failed to parse row: ${line}, error: ${parseError}`);
          }
        }
      }

      console.debug(
        `Found ${examples.length} similar examples above threshold ${threshold}`,
      );
      if (examples.length > 0) {
        const topMatches = examples.map((ex) => ({
          question: ex.question.substring(0, 100) + '...',
          similarity: ex.similarity_score,
        }));
        console.debug(`Top matches: ${JSON.stringify(topMatches)}`);
      }
      return examples;
    } catch (error) {
      console.error(`Failed to search similar examples: ${error}`);
      // Fallback to text search
      return this.searchByText('', limit);
    }
  }

  async searchByText(
    searchText: string,
    limit: number = 5,
  ): Promise<SqlExample[]> {
    try {
      const whereClause = searchText
        ? `WHERE position(lower(question), lower('${searchText.replace(/'/g, "''")}')) > 0`
        : '';

      const resultSet = await this.client.query({
        query: `
          SELECT 
            id,
            question,
            sql,
            description,
            category,
            database_schema,
            created_at
          FROM sql_examples.examples
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `,
        format: 'JSONEachRow',
      });

      const examples: SqlExample[] = [];
      const responseText = await resultSet.text();
      const lines = responseText.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const row = JSON.parse(line);
            examples.push({
              id: row.id,
              question: row.question,
              sql: row.sql,
              description: row.description,
              category: row.category,
              database_schema: row.database_schema,
              created_at: new Date(row.created_at),
            });
          } catch (parseError) {
            console.error(`Failed to parse row: ${line}, error: ${parseError}`);
          }
        }
      }

      return examples;
    } catch (error) {
      console.error(`Failed to search examples by text: ${error}`);
      return [];
    }
  }

  async updateExampleEmbedding(id: string, embedding: number[]): Promise<void> {
    try {
      await this.client.exec({
        query: `
          ALTER TABLE sql_examples.examples
          UPDATE embedding = [${embedding.join(',')}]
          WHERE id = '${id}'
        `,
      });

      console.debug(`Updated embedding for example ${id}`);
    } catch (error) {
      console.error(`Failed to update embedding for example ${id}: ${error}`);
      throw error;
    }
  }

  async getAllExamples(): Promise<SqlExample[]> {
    try {
      const resultSet = await this.client.query({
        query: `
          SELECT 
            id,
            question,
            sql,
            description,
            category,
            database_schema,
            created_at
          FROM sql_examples.examples
          ORDER BY created_at DESC
        `,
        format: 'JSONEachRow',
      });

      const examples: SqlExample[] = [];
      const responseText = await resultSet.text();
      const lines = responseText.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const row = JSON.parse(line);
            examples.push({
              id: row.id,
              question: row.question,
              sql: row.sql,
              description: row.description,
              category: row.category,
              database_schema: row.database_schema,
              created_at: new Date(row.created_at),
            });
          } catch (parseError) {
            console.error(`Failed to parse row: ${line}, error: ${parseError}`);
          }
        }
      }

      return examples;
    } catch (error) {
      console.error(`Failed to get all examples: ${error}`);
      return [];
    }
  }

  async deleteExample(id: string): Promise<void> {
    try {
      await this.client.exec({
        query: `DELETE FROM sql_examples.examples WHERE id = '${id}'`,
      });

      console.debug(`Deleted example ${id}`);
    } catch (error) {
      console.error(`Failed to delete example ${id}: ${error}`);
      throw error;
    }
  }

  async getExampleCount(): Promise<number> {
    try {
      const resultSet = await this.client.query({
        query: 'SELECT count() as count FROM sql_examples.examples',
        format: 'JSONEachRow',
      });

      const responseText = await resultSet.text();
      const lines = responseText.trim().split('\n');

      if (lines.length > 0 && lines[0].trim()) {
        try {
          const row = JSON.parse(lines[0]);
          return parseInt(row.count) || 0;
        } catch (parseError) {
          console.error(`Failed to parse count result: ${parseError}`);
        }
      }

      return 0;
    } catch (error) {
      console.error(`Failed to get example count: ${error}`);
      return 0;
    }
  }

  async updateExampleApproval(id: string, isApproved: boolean): Promise<void> {
    try {
      const updateQuery = isApproved
        ? `ALTER TABLE sql_examples.examples 
           UPDATE is_verified = true, quality_score = 1.0, updated_at = now()
           WHERE id = '${id}'`
        : `ALTER TABLE sql_examples.examples 
           UPDATE is_verified = false, quality_score = 0.3, updated_at = now()
           WHERE id = '${id}'`;

      await this.client.exec({
        query: updateQuery,
      });

      console.debug(
        `Updated approval status for example ${id}: ${isApproved ? 'approved' : 'rejected'}`,
      );
    } catch (error) {
      console.error(`Failed to update approval for example ${id}: ${error}`);
      throw error;
    }
  }
}
