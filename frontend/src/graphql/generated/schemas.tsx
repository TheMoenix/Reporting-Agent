export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
};

export type Connection = {
  __typename?: 'Connection';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  database: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  host: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  port: Scalars['Float']['output'];
  type: DatabaseType;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type ConnectionTestResult = {
  __typename?: 'ConnectionTestResult';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CreateConnectionDto = {
  database: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  host: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  port: Scalars['Int']['input'];
  type: DatabaseType;
  username: Scalars['String']['input'];
};

/** Supported database types */
export enum DatabaseType {
  Mssql = 'MSSQL',
  Mysql = 'MYSQL',
  Postgres = 'POSTGRES',
  Sqlite = 'SQLITE'
}

export type DownloadableFileType = {
  __typename?: 'DownloadableFileType';
  filename: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type ExcelExportResponse = {
  __typename?: 'ExcelExportResponse';
  filename: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Interaction = {
  __typename?: 'Interaction';
  _id: Scalars['ID']['output'];
  confidence?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  downloadableFiles?: Maybe<Array<DownloadableFileType>>;
  error_message?: Maybe<Scalars['String']['output']>;
  execution_status: Scalars['String']['output'];
  execution_time_ms?: Maybe<Scalars['Float']['output']>;
  feedback_timestamp?: Maybe<Scalars['DateTime']['output']>;
  intent?: Maybe<Scalars['String']['output']>;
  messages: Array<SimpleMessage>;
  response?: Maybe<Scalars['String']['output']>;
  sqlResult?: Maybe<SqlResult>;
  threadId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  used_examples?: Maybe<Array<Scalars['String']['output']>>;
  userQuery: Scalars['String']['output'];
  user_feedback?: Maybe<Scalars['String']['output']>;
  user_rating?: Maybe<Scalars['String']['output']>;
  visualization?: Maybe<Visualization>;
};

export type LlmProvider = {
  __typename?: 'LLMProvider';
  id: Scalars['String']['output'];
  isAvailable: Scalars['Boolean']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  provider: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addSqlExample: Scalars['String']['output'];
  createConnection: Connection;
  deleteConnection: Scalars['Boolean']['output'];
  deleteSqlExample: Scalars['Boolean']['output'];
  exportToExcel: ExcelExportResponse;
  processQuery?: Maybe<Thread>;
  rateQueryResult: Scalars['Boolean']['output'];
  updateConnection: Connection;
};


export type MutationAddSqlExampleArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  databaseSchema?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  question: Scalars['String']['input'];
  sql: Scalars['String']['input'];
};


export type MutationCreateConnectionArgs = {
  createConnectionInput: CreateConnectionDto;
};


export type MutationDeleteConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSqlExampleArgs = {
  id: Scalars['String']['input'];
};


export type MutationExportToExcelArgs = {
  interactionId: Scalars['String']['input'];
};


export type MutationProcessQueryArgs = {
  input: QueryRequestInput;
};


export type MutationRateQueryResultArgs = {
  feedback?: InputMaybe<Scalars['String']['input']>;
  interactionId: Scalars['String']['input'];
  isHelpful: Scalars['Boolean']['input'];
  threadId: Scalars['String']['input'];
};


export type MutationUpdateConnectionArgs = {
  id: Scalars['ID']['input'];
  updateConnectionInput: UpdateConnectionDto;
};

export type ProgressUpdate = {
  __typename?: 'ProgressUpdate';
  message: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Float']['output']>;
  step: Scalars['String']['output'];
  threadId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  availableConnectionTypes: Array<Scalars['String']['output']>;
  connection: Connection;
  connections: Array<Connection>;
  getAllSqlExamples: Array<SqlExampleType>;
  getAvailableLLMs: Array<LlmProvider>;
  getThread?: Maybe<Thread>;
  getUserThreads: Array<Thread>;
  searchSqlExamples: Array<SqlExampleType>;
  testConnection: ConnectionTestResult;
};


export type QueryConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetThreadArgs = {
  threadId: Scalars['String']['input'];
};


export type QuerySearchSqlExamplesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTestConnectionArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRequestInput = {
  connectionId?: InputMaybe<Scalars['String']['input']>;
  llmProvider?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  query: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type SimpleMessage = {
  __typename?: 'SimpleMessage';
  content: Scalars['String']['output'];
  interactionId: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  step?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['DateTime']['output']>;
};

export type SqlExampleType = {
  __typename?: 'SqlExampleType';
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['DateTime']['output']>;
  database_schema?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  is_verified?: Maybe<Scalars['Boolean']['output']>;
  quality_score?: Maybe<Scalars['Float']['output']>;
  question: Scalars['String']['output'];
  similarity_score?: Maybe<Scalars['Float']['output']>;
  sql: Scalars['String']['output'];
  success_count?: Maybe<Scalars['Float']['output']>;
  usage_count?: Maybe<Scalars['Float']['output']>;
};

export type SqlResult = {
  __typename?: 'SqlResult';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  error_message?: Maybe<Scalars['String']['output']>;
  execution_time_ms?: Maybe<Scalars['Float']['output']>;
  row_count: Scalars['Float']['output'];
  rows: Array<Scalars['JSONObject']['output']>;
  sql: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  threadProgress: ProgressUpdate;
};


export type SubscriptionThreadProgressArgs = {
  threadId: Scalars['String']['input'];
};

export type Thread = {
  __typename?: 'Thread';
  _id: Scalars['ID']['output'];
  connectionId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  interactions: Array<Interaction>;
  locale?: Maybe<Scalars['String']['output']>;
  threadId: Scalars['String']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ThreadStats = {
  __typename?: 'ThreadStats';
  newestCheckpoint?: Maybe<Scalars['DateTime']['output']>;
  oldestCheckpoint?: Maybe<Scalars['DateTime']['output']>;
  threadsWithCheckpoints: Scalars['Float']['output'];
  totalThreads: Scalars['Float']['output'];
};

export type UpdateConnectionDto = {
  database?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  host?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<DatabaseType>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Visualization = {
  __typename?: 'Visualization';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  graphs: Array<Scalars['JSONObject']['output']>;
  reasoning?: Maybe<Scalars['String']['output']>;
  shouldVisualize: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};
