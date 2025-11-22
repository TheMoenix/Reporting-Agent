import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { SimpleMessage } from '../dto/sql-agent.dto';

export type Intent =
  | 'fact'
  | 'quick_metric'
  | 'report'
  | 'chitchat'
  | 'unknown';

export interface PolicyConfig {
  scopes: string[];
  sqlWhere: string[];
  tableDenyList: string[];
  columnMasks: Record<string, string>;
}

export interface S3Artifact {
  key: string;
  kind: 'xlsx' | 'csv';
  createdAt: Date;
}

export interface DownloadableFile {
  url: string;
  filename: string;
  timestamp: Date;
}

export interface GraphSpec {
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
    groupBy?: string;
    aggregation?: 'sum' | 'count' | 'avg' | 'max' | 'min';
    colors?: string[];
    showLegend?: boolean;
    showValues?: boolean;
  };
  reasoning?: string;
}

export interface VisualizationSuggestion {
  shouldVisualize: boolean;
  graphs: GraphSpec[];
  reasoning: string;
}

export interface AgentStateType {
  // Thread identity
  threadId: string;
  locale: 'ar' | 'en';
  timezone: string;

  // Connection configuration (NEW)
  connectionId?: string;
  connectionConfig?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    type: 'postgres' | 'mysql' | 'sqlite' | 'mssql';
  };

  // LLM configuration
  llmProvider?: string;

  // Current interaction context (NEW)
  interactionId: string;

  // Understanding
  userQuery: string;
  topic?: string;
  intent?: Intent;
  confidence?: number;

  // Plan & execution
  plan?: any;
  sql?: string;
  final_sql?: string; // The final successful SQL query (for learning)
  rows?: any[];

  // Execution tracking
  execution_status?:
    | 'pending'
    | 'success'
    | 'failed'
    | 'timeout'
    | 'syntax_error'
    | 'permission_error';
  execution_time_ms?: number;
  row_count?: number;
  error_message?: string;
  used_examples?: string[];
  execution_start_time?: Date;

  // Output
  response?: string;
  downloadableFiles?: DownloadableFile[];
  visualizations?: VisualizationSuggestion;

  // Ops
  errors: string[];

  // LangGraph specific
  messages: BaseMessage[];
  simpleMessages?: SimpleMessage[];
}

// LangGraph state annotation
export const AgentState = Annotation.Root({
  // Thread identity
  threadId: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  db: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  locale: Annotation<'ar' | 'en'>({
    reducer: (x, y) => y ?? x,
    default: () => 'en',
  }),
  timezone: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => 'UTC',
  }),

  // Connection configuration (NEW)
  connectionId: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  connectionConfig: Annotation<{
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    type: 'postgres' | 'mysql' | 'sqlite' | 'mssql';
  }>({
    reducer: (x, y) => y ?? x,
  }),

  // LLM configuration
  llmProvider: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),

  // Current interaction context (NEW)
  interactionId: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),

  // Understanding
  userQuery: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  topic: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  intent: Annotation<Intent>({
    reducer: (x, y) => y ?? x,
  }),
  confidence: Annotation<number>({
    reducer: (x, y) => y ?? x,
  }),

  // Plan & execution
  plan: Annotation<any>({
    reducer: (x, y) => y ?? x,
  }),
  sql: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  final_sql: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  rows: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
  }),

  // Execution tracking
  execution_status: Annotation<
    | 'pending'
    | 'success'
    | 'failed'
    | 'timeout'
    | 'syntax_error'
    | 'permission_error'
  >({
    reducer: (x, y) => y ?? x,
    default: () => 'pending' as const,
  }),
  execution_time_ms: Annotation<number>({
    reducer: (x, y) => y ?? x,
  }),
  row_count: Annotation<number>({
    reducer: (x, y) => y ?? x,
  }),
  error_message: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  used_examples: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  execution_start_time: Annotation<Date>({
    reducer: (x, y) => y ?? x,
  }),

  // Output
  response: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
  downloadableFiles: Annotation<DownloadableFile[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  visualizations: Annotation<VisualizationSuggestion>({
    reducer: (x, y) => y ?? x,
  }),

  // Ops
  errors: Annotation<string[]>({
    reducer: (x, y) => [...(x || []), ...(y || [])],
    default: () => [],
  }),

  // LangGraph specific
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => {
      if (!y || y.length === 0) return x || [];
      if (!x || x.length === 0) return y;

      // Merge arrays and deduplicate by content and type
      const combined = [...x, ...y];
      const seen = new Set();

      return combined.filter((msg) => {
        const key = `${msg.constructor?.name || msg._getType?.() || 'unknown'}-${msg.content}-${msg.id || ''}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    },
    default: () => [],
  }),

  simpleMessages: Annotation<SimpleMessage[]>({
    reducer: (x, y) => {
      if (!y || y.length === 0) return x || [];
      if (!x || x.length === 0) return y;

      // Merge arrays and deduplicate by content and type
      const combined = [...x, ...y];
      const seen = new Set();

      return combined.filter((msg) => {
        // Ensure timestamp is a proper Date object or null
        if (msg.timestamp) {
          if (typeof msg.timestamp === 'string') {
            msg.timestamp = new Date(msg.timestamp);
          } else if (!(msg.timestamp instanceof Date)) {
            msg.timestamp = new Date(msg.timestamp);
          }
          // If the date is invalid, set to null
          if (isNaN(msg.timestamp.getTime())) {
            msg.timestamp = null;
          }
        }

        const timestampStr =
          msg.timestamp && typeof msg.timestamp.toISOString === 'function'
            ? msg.timestamp.toISOString()
            : msg.timestamp
              ? String(msg.timestamp)
              : '';
        const key = `${msg.role}-${msg.content}-${timestampStr}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    },
    default: () => [],
  }),
});
