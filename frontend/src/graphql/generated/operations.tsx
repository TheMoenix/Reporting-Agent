import * as Types from './schemas';

export type ProcessQueryMutationVariables = Types.Exact<{
  input: Types.QueryRequestInput;
}>;


export type ProcessQueryMutation = { __typename?: 'Mutation', processQuery?: { __typename?: 'Thread', threadId: string, connectionId?: string | null } | null };

export type RateQueryResultMutationVariables = Types.Exact<{
  threadId: Types.Scalars['String']['input'];
  interactionId: Types.Scalars['String']['input'];
  isHelpful: Types.Scalars['Boolean']['input'];
  feedback?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type RateQueryResultMutation = { __typename?: 'Mutation', rateQueryResult: boolean };

export type CreateConnectionMutationVariables = Types.Exact<{
  createConnectionInput: Types.CreateConnectionDto;
}>;


export type CreateConnectionMutation = { __typename?: 'Mutation', createConnection: { __typename?: 'Connection', _id: string, name: string, description?: string | null, type: Types.DatabaseType, host: string, port: number, database: string, username: string, isActive: boolean, createdAt: any, updatedAt: any } };

export type UpdateConnectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  updateConnectionInput: Types.UpdateConnectionDto;
}>;


export type UpdateConnectionMutation = { __typename?: 'Mutation', updateConnection: { __typename?: 'Connection', _id: string, name: string, description?: string | null, type: Types.DatabaseType, host: string, port: number, database: string, username: string, isActive: boolean, createdAt: any, updatedAt: any } };

export type DeleteConnectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteConnectionMutation = { __typename?: 'Mutation', deleteConnection: boolean };

export type AddSqlExampleMutationVariables = Types.Exact<{
  question: Types.Scalars['String']['input'];
  sql: Types.Scalars['String']['input'];
  category?: Types.InputMaybe<Types.Scalars['String']['input']>;
  description?: Types.InputMaybe<Types.Scalars['String']['input']>;
  databaseSchema?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type AddSqlExampleMutation = { __typename?: 'Mutation', addSqlExample: string };

export type ExportToExcelMutationVariables = Types.Exact<{
  interactionId: Types.Scalars['String']['input'];
}>;


export type ExportToExcelMutation = { __typename?: 'Mutation', exportToExcel: { __typename?: 'ExcelExportResponse', url: string } };

export type GetUserThreadsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUserThreadsQuery = { __typename?: 'Query', getUserThreads: Array<{ __typename?: 'Thread', _id: string, threadId: string, topic?: string | null, connectionId?: string | null, createdAt: any, updatedAt: any }> };

export type GetThreadQueryVariables = Types.Exact<{
  threadId: Types.Scalars['String']['input'];
}>;


export type GetThreadQuery = { __typename?: 'Query', getThread?: { __typename?: 'Thread', _id: string, threadId: string, locale?: string | null, timezone?: string | null, topic?: string | null, connectionId?: string | null, createdAt: any, updatedAt: any, interactions: Array<{ __typename?: 'Interaction', _id: string, userQuery: string, response?: string | null, execution_status: string, execution_time_ms?: number | null, user_rating?: string | null, user_feedback?: string | null, feedback_timestamp?: any | null, createdAt: any, updatedAt: any, visualization?: { __typename?: 'Visualization', _id: string, shouldVisualize: boolean, reasoning?: string | null, graphs: Array<any>, createdAt: any, updatedAt: any } | null, sqlResult?: { __typename?: 'SqlResult', sql: string, rows: Array<any>, row_count: number, status: string, error_message?: string | null, execution_time_ms?: number | null } | null, messages: Array<{ __typename?: 'SimpleMessage', role: string, content: string, step?: string | null, timestamp?: any | null, metadata?: any | null, name?: string | null }>, downloadableFiles?: Array<{ __typename?: 'DownloadableFileType', filename: string, url: string, timestamp: any }> | null }> } | null };

export type GetConnectionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetConnectionsQuery = { __typename?: 'Query', connections: Array<{ __typename?: 'Connection', _id: string, name: string, description?: string | null, type: Types.DatabaseType, host: string, port: number, database: string, username: string, isActive: boolean, createdAt: any, updatedAt: any }> };

export type GetConnectionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetConnectionQuery = { __typename?: 'Query', connection: { __typename?: 'Connection', _id: string, name: string, description?: string | null, type: Types.DatabaseType, host: string, port: number, database: string, username: string, isActive: boolean, createdAt: any, updatedAt: any } };

export type TestConnectionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type TestConnectionQuery = { __typename?: 'Query', testConnection: { __typename?: 'ConnectionTestResult', success: boolean, message?: string | null, error?: string | null } };

export type GetAvailableConnectionTypesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAvailableConnectionTypesQuery = { __typename?: 'Query', availableConnectionTypes: Array<string> };

export type GetAllSqlExamplesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllSqlExamplesQuery = { __typename?: 'Query', getAllSqlExamples: Array<{ __typename?: 'SqlExampleType', id?: string | null, question: string, sql: string, category?: string | null, description?: string | null, database_schema?: string | null, is_verified?: boolean | null, quality_score?: number | null, success_count?: number | null, usage_count?: number | null, created_at?: any | null }> };

export type SearchSqlExamplesQueryVariables = Types.Exact<{
  query: Types.Scalars['String']['input'];
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type SearchSqlExamplesQuery = { __typename?: 'Query', searchSqlExamples: Array<{ __typename?: 'SqlExampleType', id?: string | null, question: string, sql: string, category?: string | null, description?: string | null, database_schema?: string | null, is_verified?: boolean | null, quality_score?: number | null, similarity_score?: number | null, success_count?: number | null, usage_count?: number | null, created_at?: any | null }> };

export type GetAvailableLlMsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAvailableLlMsQuery = { __typename?: 'Query', getAvailableLLMs: Array<{ __typename?: 'LLMProvider', id: string, name: string, provider: string, model: string, isAvailable: boolean }> };

export type ThreadProgressSubscriptionVariables = Types.Exact<{
  threadId: Types.Scalars['String']['input'];
}>;


export type ThreadProgressSubscription = { __typename?: 'Subscription', threadProgress: { __typename?: 'ProgressUpdate', threadId: string, step: string, message: string, note?: string | null, percentage?: number | null } };
