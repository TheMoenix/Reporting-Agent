import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StateGraph, START, END } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createAgent } from 'langchain';
import { LangChainService } from './langchain.service';
import { SqlExamplesService } from './sql-examples.service';
import { PubSubService } from './pubsub.service';
import { ConnectionService } from './connection.service';
import { Thread, ThreadDocument } from '../schemas/thread.schema';
import {
  Interaction,
  InteractionDocument,
} from '../schemas/interaction.schema';
import { SqlResult, SqlResultDocument } from '../schemas/query-result.schema';
import {
  Visualization,
  VisualizationDocument,
} from '../schemas/visualization.schema';
import {
  AgentState,
  Intent,
  AgentStateType,
  VisualizationSuggestion,
} from '../types/agent-state';
import { ProgressTracker } from '../utils/progress-tracker';
import { SystemPrompt } from 'src/common/constants';

@Injectable()
export class WorkflowService {
  private agent: any;
  private checkpointer: PostgresSaver;
  private initialized = false;
  private progressTracker: ProgressTracker;

  constructor(
    private langChainService: LangChainService,
    private sqlExamplesService: SqlExamplesService,
    private pubSubService: PubSubService,
    private connectionService: ConnectionService,
    @InjectModel(Thread.name)
    private threadModel: Model<ThreadDocument>,
    @InjectModel(Interaction.name)
    private interactionModel: Model<InteractionDocument>,
    @InjectModel(SqlResult.name)
    private queryResultModel: Model<SqlResultDocument>,
    @InjectModel(Visualization.name)
    private visualizationModel: Model<VisualizationDocument>,
  ) {
    this.initialize();
  }

  private async initialize() {
    try {
      if (process.env.ENABLE_CHECKPOINTING === 'true')
        await this.initializeCheckpointer();
      this.initializeWorkflow();

      this.initialized = true;
    } catch (error) {
      console.error(`WorkflowService initialization failed: ${error}`);
    }
  }

  private async initializeCheckpointer() {
    try {
      const host = process.env.CHECKPOINT_PG_HOST || 'localhost';
      const port = +process.env.CHECKPOINT_PG_PORT || 5432;
      const user = process.env.CHECKPOINT_PG_USER || 'postgres';
      const password = process.env.CHECKPOINT_PG_PASSWORD || 'postgres';
      const database =
        process.env.CHECKPOINT_PG_DATABASE || 'reporting_agent_checkpointer';

      const adminPool = new Pool({
        host,
        port,
        user,
        password,
        database: 'postgres',
        max: 1,
        connectionTimeoutMillis: 2000,
      });

      try {
        const checkDbQuery = `
          SELECT 1 FROM pg_database WHERE datname = $1
        `;
        const result = await adminPool.query(checkDbQuery, [database]);

        if (result.rows.length === 0) {
          console.log(`Database '${database}' not found. Creating...`);
          await adminPool.query(`CREATE DATABASE ${database}`);
          console.log(`Database '${database}' created successfully.`);
        }
      } finally {
        await adminPool.end();
      }

      const pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.checkpointer = new PostgresSaver(pool);
      await this.checkpointer.setup();
      console.log('PostgreSQL checkpointer initialized successfully.');
    } catch (error) {
      console.error(`Failed to initialize PostgreSQL checkpointer: ${error}`);
      throw error;
    }
  }
  private initializeWorkflow() {
    try {
      this.agent = new StateGraph(AgentState)
        .addNode('contextLoader', this.contextLoaderNode.bind(this))
        .addNode('intentClassifier', this.intentClassifierNode.bind(this))
        .addNode('chitchatHandler', this.chitchatHandlerNode.bind(this))
        .addNode('executor', this.executorNode.bind(this))
        .addNode('graphAnalyzer', this.graphAnalyzerNode.bind(this))
        .addNode('postProcessor', this.postProcessorNode.bind(this))

        // Define the workflow edges
        .addEdge(START, 'contextLoader')
        .addEdge('contextLoader', 'intentClassifier')

        // Conditional routing based on intent
        .addConditionalEdges(
          'intentClassifier',
          this.routeBasedOnIntent.bind(this),
          {
            chitchat: 'chitchatHandler',
            executor: 'executor',
          },
        )

        // Chitchat goes directly to postProcessor
        .addEdge('chitchatHandler', 'postProcessor')

        // Conditional routing after executor based on intent
        .addConditionalEdges('executor', this.shouldAnalyzeGraphs.bind(this), {
          analyze: 'graphAnalyzer',
          skip: 'postProcessor',
        })

        .addEdge('graphAnalyzer', 'postProcessor')
        .addEdge('postProcessor', END)

        .compile({ checkpointer: this.checkpointer }); // Use PostgreSQL checkpointer
    } catch (error) {
      console.error(`Failed to initialize workflow: ${error}`);
      throw error;
    }
  }

  // Node 2: Context Loader - load schema index + UI terms map from cache
  private async contextLoaderNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('contextLoader', {
      state,
      message: 'Loading database schema and UI context...',
    });
    // state.messages.push(new SystemMessage(SystemPrompt));

    state.messages.push(new HumanMessage(state.userQuery));
    state.simpleMessages.push({
      interactionId: state.interactionId,
      role: 'user',
      content: state.userQuery,
      timestamp: new Date(),
    });

    if (!state.topic) {
      const topicPrompt = ChatPromptTemplate.fromTemplate(`
        Generate a concise, descriptive topic (maximum 6 words) for this user query.
        The topic should capture the main subject matter or business area being discussed.

        User Query: {query}

        Examples:
        - "What are our total sales this month?" → "Monthly Sales Analysis"
        - "Show me customer details for John Smith" → "Customer Information Lookup"
        - "List all pending orders" → "Pending Orders Review"
        - "How many users registered today?" → "Daily User Registration"

        Respond with just the topic, no quotes or extra text.
      `);

      const llm = this.langChainService.getLLM(state.llmProvider);
      const chain = topicPrompt.pipe(llm as any).pipe(new StringOutputParser());

      const topic = await chain.invoke({
        query: state.userQuery,
      });

      state.topic = topic.trim();
      console.debug(`Generated topic: ${state.topic}`);

      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'system',
        content: `Thread topic generated: ${state.topic}`,
        timestamp: new Date(),
      });
      await this.progressTracker.advance('topicGenerator', {
        state,
        message: `Thread topic generated: ${state.topic}`,
      });
    }
    return state;
  }

  // Node 3: Intent Classifier - LLM classifies query
  private async intentClassifierNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('intentClassifier', {
      state,
      message: 'Understanding your request...',
    });

    const conversationContext = state.messages
      .map(
        (msg) =>
          `${msg instanceof HumanMessage ? 'User' : 'Assistant'}: ${msg.content}`,
      )
      .join('\n');

    const classificationPrompt = ChatPromptTemplate.fromTemplate(`
      Analyze this user query and classify the intent and confidence level.
      
      Current Query: {query}
      
      Previous Conversation Context:
      {context}

      Classify the intent as one of:
      - "fact": Simple factual questions (What is X?, How does Y work?).
      - "quick_metric": Quick database metrics (How many orders today?, Total revenue?, Show me details).
      - "report": Complex reports with tabular data (List all customers, Show sales by product).
      - "chitchat": Casual conversation, greetings, or questions about the AI itself. No need to access the database.
      - "unknown": Unclear or ambiguous requests.

      **IMPORTANT**: 
      - If the query is about who you are, your capabilities, or general conversation, classify it as "chitchat".
      - If this is a follow-up question that refers to previous context (like "show me more details", "tell me about that", "what about those orders", "the one before that"), classify it based on the original intent from the conversation context.

      Also rate your confidence from 0.0 to 1.0.

      Respond in JSON format:
      {{
        "intent": "chitchat",
        "confidence": 0.95,
        "reasoning": "The user is asking about the AI agent, which is a chitchat topic."
      }}
    `);

    try {
      const llm = this.langChainService.getLLM(state.llmProvider);
      const chain = classificationPrompt
        .pipe(llm as any)
        .pipe(new StringOutputParser());
      const response = await chain.invoke({
        query: state.userQuery,
        context: conversationContext || 'No previous conversation',
      });

      // Extract JSON from markdown code blocks if present
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const result = JSON.parse(jsonString);
      state.intent = result.intent as Intent;
      state.confidence = result.confidence;
      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'system',
        content: `Intent classified as: ${state.intent} (confidence: ${state.confidence}) - ${result.reasoning}`,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Error classifying intent: ${error}`);
      state.errors.push('Failed to classify intent');
      state.intent = 'unknown';
      state.confidence = 0.3;
    } finally {
      return state;
    }
  }

  // Routing logic after intent classification
  private routeBasedOnIntent(state: AgentStateType): string {
    switch (state.intent) {
      case 'chitchat':
        return 'chitchat';
      case 'fact':
      case 'quick_metric':
      case 'report':
      case 'unknown':
      default:
        return 'executor';
    }
  }

  // New Node: Chitchat Handler - handle casual conversation without database access
  private async chitchatHandlerNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('chitchatHandler', {
      state,
      message: 'Generating conversational response...',
    });

    try {
      const llm = this.langChainService.getLLM(state.llmProvider);
      const chain = llm.pipe(new StringOutputParser());

      // Use existing messages (which already include SystemPrompt + user query)
      const response = await chain.invoke([
        new SystemMessage(SystemPrompt),
        ...state.messages,
      ]);

      state.response = response;
      state.execution_status = 'success';

      state.messages.push(new AIMessage(response));
      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      return state;
    } catch (error) {
      console.error(`Error in chitchat handler: ${error}`);
      state.errors.push('Failed to generate conversational response');
      state.response =
        "I'm here to help with your business data questions. What would you like to know?";
      state.execution_status = 'success';

      return state;
    }
  }

  // Routing logic after executor to determine if graph analysis is needed
  private shouldAnalyzeGraphs(state: AgentStateType): string {
    // Skip graph analysis for quick_metric intent or if no data
    if (
      state.intent === 'quick_metric' ||
      !state.rows ||
      state.rows.length === 0
    ) {
      return 'skip';
    }

    // Analyze graphs for report intent and other cases with data
    return 'analyze';
  }

  // Node 9: Executor - run query on read replica with RAG examples
  private async executorNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('executor', {
      state,
      message: 'Contacting database...',
    });

    // Initialize execution tracking
    state.execution_start_time = new Date();
    state.execution_status = 'pending';
    state.used_examples = [];

    try {
      const llm = this.langChainService.getLLM(state.llmProvider);

      // Get connection configuration
      let connectionConfig;
      try {
        const connection = await this.connectionService.findOne(
          state.connectionId,
        );
        connectionConfig = {
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
          type: connection.type,
        };
      } catch (error) {
        throw new Error(
          `Failed to get connection configuration: ${error.message}. Please ensure the connection is valid and accessible.`,
        );
      }

      const toolkit = await this.langChainService.createSqlToolkit(
        llm,
        connectionConfig,
      );

      // Retrieve similar examples using RAG
      await this.progressTracker.advance('executor', {
        state,
        message: 'Finding relevant examples...',
      });

      const similarExamples = await this.sqlExamplesService.findSimilarExamples(
        state.userQuery,
        5, // Get top 5 most similar examples
        0.2, // Realistic threshold for real embeddings
      );

      // Track which examples were used
      state.used_examples = similarExamples
        .map((ex) => ex.id)
        .filter(Boolean) as string[];

      const examplesPrompt =
        await this.sqlExamplesService.formatExamplesForPrompt(similarExamples);

      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'system',
        content: `Examples Found: ${JSON.stringify(similarExamples)}`,
        timestamp: new Date(),
      });

      const thread = await this.threadModel
        .findOne({
          threadId: state.threadId,
        })
        .populate({
          path: 'interactions',
          populate: 'sqlResult',
        });

      let conversationHistory = '';
      thread.interactions
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .forEach((interaction) => {
          if (interaction.userQuery)
            conversationHistory += `\nUser: ${interaction.userQuery}\n`;
          if (interaction.sqlResult?.sql)
            conversationHistory += `SQL-BY-AI: ${interaction.sqlResult?.sql}\n`;
          if (interaction.response)
            conversationHistory += `AI-Response: ${interaction.response}\n`;
        });

      // Enhanced SQL Agent prompt with RAG examples
      const enhancedPrompt = `You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run.
Then, analyze the results of the query and provide a concise, natural language summary of the findings.

Do not just list the raw data in a table. Instead, interpret the results and explain what they mean in the context of the user's question.
If the query returns a list of items, you can summarize it in a bulleted list, but avoid large tables.
After your summary, mention that the user can download the full results as an Excel file.

You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for the few relevant columns given the question.

${examplesPrompt}

You have access to the following tools to execute SQL queries.
Only use the below tools. Only use the information returned by the below tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

Here is the conversation so far:\n${conversationHistory}`;

      // Create SQL agent with both SQL and Excel tools
      const sqlAgent = createAgent({
        model: llm,
        tools: [...toolkit.tools],
        systemPrompt: enhancedPrompt,
      });

      await this.progressTracker.advance('executor', {
        state,
        message: 'Executing SQL query with enhanced context...',
      });

      const stream = await sqlAgent.stream({
        messages: state.messages,
      });

      let iterationCount = 0;
      for await (const chunk of stream) {
        const messages = chunk.messages || [];
        if (Array.isArray(messages) && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          state.response =
            lastMessage.content ||
            `Using the ${lastMessage.tool_calls?.[0]?.name} tool`;

          // Progress update for each iteration in the executor loop
          await this.progressTracker.advance('executor', {
            iteration: iterationCount++,
            state,
            message: state.response,
          });

          if (lastMessage.name === 'query-sql') {
            try {
              const newRows = JSON.parse(lastMessage.content || '[]');
              if (!state.rows || newRows.length > 0) {
                state.rows = newRows;
                state.execution_status = 'success';
                state.row_count = newRows.length;
                state.final_sql = state.sql;
              }
            } catch (_) {}
          } else if (
            lastMessage.tool_calls?.[0]?.name === 'query-sql' &&
            lastMessage.tool_calls?.[0]?.type === 'tool_call'
          )
            state.sql = lastMessage.tool_calls?.[0]?.args?.input;

          if (lastMessage.tool_calls?.length > 0)
            state.simpleMessages.push({
              interactionId: state.interactionId,
              role: 'tool_call',
              name: lastMessage.tool_calls?.[0]?.name,
              content: JSON.stringify(lastMessage.tool_calls?.[0]?.args),
              timestamp: new Date(),
            });
          else if (lastMessage.tool_call_id)
            state.simpleMessages.push({
              interactionId: state.interactionId,
              role: 'tool_response',
              name: lastMessage.name,
              content: lastMessage.content,
              timestamp: new Date(),
            });
        }
      }

      if (state.rows && state.rows.length > 0) {
        const queryResult = new this.queryResultModel({
          sql: state.final_sql || state.sql,
          rows: state.rows,
          row_count: state.row_count || state.rows.length,
          status: state.execution_status === 'success' ? 'success' : 'failed',
          error_message: state.error_message,
          execution_time_ms: state.execution_time_ms,
        });
        await queryResult.save();
        await this.interactionModel.updateOne(
          { _id: state.interactionId },
          { $set: { sqlResult: queryResult._id } },
        );
      }

      state.messages.push(new AIMessage(state.response || ''));
      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'assistant',
        content: state.response || '',
        timestamp: new Date(),
      });

      return state;
    } catch (error) {
      console.error(error);

      // Update execution tracking for error case
      state.execution_status = 'failed';
      state.error_message = error.message || 'Unknown execution error';
      if (state.execution_start_time) {
        state.execution_time_ms =
          Date.now() - state.execution_start_time.getTime();
      }

      return {
        ...state,
        errors: [...(state.errors || []), `Execution failed: ${error.message}`],
      };
    }
  }

  // Node: Graph Analyzer - analyze if data needs visualization and generate graph specs
  private async graphAnalyzerNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('graphAnalyzer', {
      state,
      message: 'Analyzing data for visualization opportunities...',
    });

    try {
      // Skip graph analysis if no rows data
      if (!state.rows || state.rows.length === 0) {
        state.visualizations = {
          shouldVisualize: false,
          graphs: [],
          reasoning: 'No data available for visualization',
        };
        return state;
      }

      // Skip if too few rows for meaningful visualization
      if (state.rows.length < 2) {
        state.visualizations = {
          shouldVisualize: false,
          graphs: [],
          reasoning:
            'Insufficient data for meaningful visualization (less than 2 rows)',
        };
        return state;
      }

      const graphAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
        Analyze this SQL query result and determine if it would benefit from data visualization.
        
        Original Query: {userQuery}
        SQL Query: {sql}
        Data Summary: {dataSummary}
        Total Rows: {totalRows}

        Analyze whether this data should be visualized and suggest appropriate chart types.
        Consider:
        1. Data structure, relationships, and statistical properties (uniqueness, distribution).
        2. Total number of records. For large datasets (over 100 rows), you MUST suggest aggregations (e.g., GROUP BY for categories, binning for numbers) or filtering to make the visualization readable. Do not suggest charts with more than 25 data points unless it's a scatter plot.
        3. Data types (numerical, categorical, temporal).
        4. Business context from the user query.

        Guidelines:
        - Temporal data (dates/times) → Line or Area charts. Aggregate by day/week/month if too many data points.
        - Categorical data with counts/amounts → Bar or Pie charts. If more than 15 categories, group smaller ones into an 'Other' category.
        - Two numerical variables → Scatter plots.
        - Single metrics or totals → Do not visualize; present as a key metric.
        - Raw lists of records → Use a 'table' format.

        Respond in JSON format:
        {{
          "shouldVisualize": true/false,
          "reasoning": "Explanation of decision, including any aggregations suggested.",
          "graphs": [
            {{
              "type": "bar|line|pie|scatter|area|table",
              "title": "Chart title",
              "config": {{
                "xAxis": {{"field": "column_name", "label": "Display Label", "type": "category|time|value"}},
                "yAxis": {{"field": "column_name", "label": "Display Label", "type": "value|category"}},
                "series": [{{"field": "column_name", "label": "Series Label"}}],
                "aggregation": {{
                  "type": "sum|avg|count",
                  "dimension": "column_to_group_by",
                  "metric": "column_to_aggregate"
                }}
              }},
              "reasoning": "Why this chart type and aggregation (if any) are appropriate."
            }}
          ]
        }}
      `);

      // Prepare data summary
      const dataSummary = this.summarizeDataForAnalysis(state.rows);

      const llm = this.langChainService.getLLM(state.llmProvider);
      const chain = graphAnalysisPrompt
        .pipe(llm as any)
        .pipe(new StringOutputParser());

      const response = await chain.invoke({
        userQuery: state.userQuery,
        sql: state.sql || 'N/A',
        dataSummary: JSON.stringify(dataSummary, null, 2),
        totalRows: state.rows.length,
      });

      // Parse LLM response
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const analysisResult: VisualizationSuggestion = JSON.parse(jsonString);

      // Post-generation validation
      if (analysisResult.shouldVisualize && analysisResult.graphs.length > 0) {
        analysisResult.graphs = analysisResult.graphs.filter((graph) => {
          if (!graph.config?.xAxis?.field || !graph.config?.yAxis?.field) {
            return false; // Filter out graphs with missing essential config
          }
          return true;
        });

        if (analysisResult.graphs.length === 0) {
          analysisResult.shouldVisualize = false;
          analysisResult.reasoning =
            'Initial suggestions were invalid or empty; filtered out.';
        }
      }

      state.visualizations = analysisResult;

      // Save visualization data separately if it exists
      if (analysisResult && analysisResult.shouldVisualize) {
        const visualization = new this.visualizationModel({
          shouldVisualize: analysisResult.shouldVisualize,
          reasoning: analysisResult.reasoning,
          graphs: analysisResult.graphs,
        });
        await visualization.save();
        await this.interactionModel.updateOne(
          { _id: state.interactionId },
          { $set: { visualization: visualization._id } },
        );
      }

      // Add to message history
      const visualizationMessage = analysisResult.shouldVisualize
        ? `Generated ${analysisResult.graphs.length} visualization(s): ${analysisResult.graphs.map((g) => g.type).join(', ')}`
        : 'No visualization recommended for this data';

      state.simpleMessages.push({
        interactionId: state.interactionId,
        role: 'system',
        content: visualizationMessage,
        timestamp: new Date(),
      });

      return state;
    } catch (error) {
      console.error(`Error in graph analysis: ${error}`);
      state.errors.push('Failed to analyze data for visualization');

      // Fallback: no visualization
      state.visualizations = {
        shouldVisualize: false,
        graphs: [],
        reasoning: 'Graph analysis failed due to technical error',
      };

      return state;
    }
  }

  private summarizeDataForAnalysis(rows: any[]): Record<string, any> {
    if (!rows || rows.length === 0) return {};

    const summary: Record<string, any> = {};
    const sampleRow = rows[0];
    const columnNames = Object.keys(sampleRow);
    const rowCount = rows.length;

    columnNames.forEach((col) => {
      const columnType = this.getQuickColumnType(rows.map((r) => r[col]));
      summary[col] = { type: columnType };

      if (columnType === 'number') {
        const values = rows.map((r) => r[col]).filter((v) => v !== null);
        summary[col].min = Math.min(...values);
        summary[col].max = Math.max(...values);
        summary[col].avg = values.reduce((a, b) => a + b, 0) / values.length;
        summary[col].hasNegative = values.some((v) => v < 0);
      } else if (columnType === 'category' || columnType === 'datetime') {
        const uniqueValues = new Set(rows.map((r) => r[col]));
        summary[col].uniqueValues = uniqueValues.size;
        summary[col].valueDistribution =
          uniqueValues.size > 25 ? 'wide' : 'narrow';
        if (uniqueValues.size <= 10) {
          summary[col].sampleValues = Array.from(uniqueValues).slice(0, 5);
        }
      }
    });

    return summary;
  }

  private getQuickColumnType(values: any[]): string {
    const sample = values.find((v) => v !== null && v !== undefined);
    if (sample === undefined) return 'unknown';

    if (typeof sample === 'number') return 'number';
    if (typeof sample === 'boolean') return 'boolean';
    if (sample instanceof Date) return 'datetime';
    if (typeof sample === 'string') {
      if (!isNaN(Date.parse(sample))) return 'datetime';
      if (!isNaN(Number(sample))) return 'number'; // String-encoded number
    }
    return 'category';
  }

  // Helper method to analyze column data types
  private analyzeColumnTypes(rows: any[]): Record<string, string> {
    if (!rows || rows.length === 0) return {};

    const columnTypes: Record<string, string> = {};
    const sampleRow = rows[0];

    Object.keys(sampleRow).forEach((column) => {
      const values = rows
        .slice(0, 10)
        .map((row) => row[column])
        .filter((val) => val != null);
      if (values.length === 0) {
        columnTypes[column] = 'unknown';
        return;
      }

      const firstValue = values[0];

      // Check for date/time
      if (
        firstValue instanceof Date ||
        (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))
      ) {
        columnTypes[column] = 'datetime';
      }
      // Check for numbers
      else if (
        typeof firstValue === 'number' ||
        (typeof firstValue === 'string' && !isNaN(Number(firstValue)))
      ) {
        columnTypes[column] = 'number';
      }
      // Check for boolean
      else if (typeof firstValue === 'boolean') {
        columnTypes[column] = 'boolean';
      }
      // Default to string/category
      else {
        columnTypes[column] = 'category';
      }
    });

    return columnTypes;
  }

  private async postProcessorNode(
    state: AgentStateType,
  ): Promise<Partial<AgentStateType>> {
    await this.progressTracker.advance('postProcessor', {
      state,
      message: 'Formatting results...',
    });
    return {
      ...state,
    };
  }

  async processInteraction(
    threadId: string,
    interactionId: string,
    userQuery: string,
    connectionId?: string,
    llmProvider?: string,
  ): Promise<AgentStateType> {
    // Find thread (interactions will be handled by resolver)
    const thread = await this.threadModel.findOne({ threadId });

    // Initial state for this interaction
    const initialState = {
      threadId,
      interactionId,
      userQuery,
      connectionId,
      llmProvider,
      execution_status: 'pending' as const,
      errors: [],
      messages: [],
      usedExamples: [],
    };

    // Initialize progress tracker for this interaction
    this.progressTracker = new ProgressTracker(
      this.publishProgress.bind(this),
      threadId,
    );

    // Execute LangGraph workflow with interaction-specific checkpoint
    const result = await this.agent.invoke(initialState, {
      configurable: { thread_id: threadId },
      recursionLimit: 100,
    });

    // Create or update the interaction document
    await this.interactionModel.updateOne(
      { _id: interactionId },
      {
        execution_status: result.execution_status,
        response: result.response,
        execution_time_ms: result.execution_time_ms,
        error_message: result.error_message,
        used_examples: result.used_examples,
        messages: result.simpleMessages.filter(
          (m) => m.interactionId === interactionId,
        ),
        completed_at: new Date(),
      },
    );
    // Update thread topic if changed
    if (result.topic && result.topic !== thread.topic) {
      thread.topic = result.topic;
    }

    await thread.save();

    return result;
  }

  // Enhanced executeWorkflow method for backward compatibility and new functionality
  async executeWorkflow(
    input: string,
    threadId: string,
    interactionId: string,
    connectionId: string,
    llmProvider?: string,
  ): Promise<AgentStateType> {
    // Wait for initialization if not ready
    if (!this.initialized) {
      // Wait for initialization with timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total
      while (!this.initialized && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!this.initialized) {
        throw new Error('WorkflowService initialization timed out');
      }
    }

    try {
      // Use new interaction-based processing
      const result = await this.processInteraction(
        threadId,
        interactionId,
        input,
        connectionId,
        llmProvider,
      );

      // Publish final progress event with 100% completion
      await this.publishProgress(
        threadId,
        'completed',
        'Query processing completed successfully',
        result,
        100,
      );

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Enhanced workflow execution failed: ${errorMsg}`);
      throw error;
    }
  }

  private async publishProgress(
    threadId: string,
    step: string,
    message: string,
    state?: AgentStateType,
    percentage?: number,
  ): Promise<void> {
    await this.pubSubService.publish('queryProgress', {
      message: `[${step}] ${message}`,
      threadId,
      step,
      state,
      percentage,
    });
  }
}
