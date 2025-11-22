import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickHouseService, SqlExample } from './clickhouse.service';
import { LangChainService } from './langchain.service';
import { Thread, ThreadDocument } from '../schemas/thread.schema';
import {
  Interaction,
  InteractionDocument,
} from '../schemas/interaction.schema';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class SqlExamplesService {
  constructor(
    private clickHouseService: ClickHouseService,
    private langChainService: LangChainService,
    @InjectModel(Thread.name)
    private threadModel: Model<ThreadDocument>,
    @InjectModel(Interaction.name)
    private interactionModel: Model<InteractionDocument>,
  ) {}

  async addExample(
    question: string,
    sql: string,
    description?: string,
    category?: string,
    databaseSchema?: string,
  ): Promise<string> {
    try {
      // Generate embedding for the question
      const embedding = await this.generateEmbedding(question);

      const example: Omit<SqlExample, 'id' | 'created_at'> = {
        question,
        sql,
        description,
        category,
        database_schema: databaseSchema,
        embedding,
      };

      const id = await this.clickHouseService.addExample(example);
      console.info(`Added SQL example: ${question} -> ${id}`);
      return id;
    } catch (error) {
      console.error(`Failed to add SQL example: ${error}`);
      throw error;
    }
  }

  async findSimilarExamples(
    userQuery: string,
    limit: number = 5,
    threshold: number = 0.15, // Lowered threshold for real embeddings
  ): Promise<SqlExample[]> {
    try {
      // Generate embedding for the user query
      const queryEmbedding = await this.generateEmbedding(userQuery);

      // Search for similar examples using vector similarity
      const examples = await this.clickHouseService.searchSimilarExamples(
        queryEmbedding,
        limit,
        threshold,
      );

      console.debug(
        `Found ${examples.length} similar examples for query: "${userQuery}"`,
      );
      return examples;
    } catch (error) {
      console.error(`Failed to find similar examples: ${error}`);
      // Fallback to text-based search
      return this.searchByText(userQuery, limit);
    }
  }

  async searchByText(
    searchText: string,
    limit: number = 5,
  ): Promise<SqlExample[]> {
    try {
      return await this.clickHouseService.searchByText(searchText, limit);
    } catch (error) {
      console.error(`Failed to search examples by text: ${error}`);
      return [];
    }
  }

  async getAllExamples(): Promise<SqlExample[]> {
    try {
      return await this.clickHouseService.getAllExamples();
    } catch (error) {
      console.error(`Failed to get all examples: ${error}`);
      return [];
    }
  }

  async deleteExample(id: string): Promise<void> {
    try {
      await this.clickHouseService.deleteExample(id);
      console.info(`Deleted SQL example: ${id}`);
    } catch (error) {
      console.error(`Failed to delete example: ${error}`);
      throw error;
    }
  }

  async getExampleCount(): Promise<number> {
    try {
      return await this.clickHouseService.getExampleCount();
    } catch (error) {
      console.error(`Failed to get example count: ${error}`);
      return 0;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use OpenAI embeddings API
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small', // 1536 dimensions, cost-effective
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Invalid embedding response from OpenAI');
      }

      const embedding = data.data[0].embedding;
      console.debug(
        `Generated embedding with ${embedding.length} dimensions for text: "${text.substring(0, 50)}..."`,
      );

      return embedding;
    } catch (error) {
      console.error(`Failed to generate embedding: ${error}`);
      throw error;
    }
  }

  async formatExamplesForPrompt(examples: SqlExample[]): Promise<string> {
    if (examples.length === 0) {
      return '';
    }

    const formattedExamples = examples
      .map((example, index) => {
        const similarityNote = example.similarity_score
          ? ` (similarity: ${(example.similarity_score * 100).toFixed(1)}%)`
          : '';

        return `Example ${index + 1}${similarityNote}:
Question: "${example.question}"
SQL:
\`\`\`sql
${example.sql}
\`\`\``;
      })
      .join('\n\n');

    return `
Here are some relevant examples of how to answer similar questions:

${formattedExamples}

Now please analyze the user's question and generate an appropriate SQL query following similar patterns.
`;
  }

  // User Feedback Methods for Normal Users (Updated for Interactions)
  async rateQueryResult(
    threadId: string,
    interactionId: string,
    isHelpful: boolean,
    feedback?: string,
  ): Promise<boolean> {
    try {
      // Update the specific interaction with user rating
      const rating = isHelpful ? 'helpful' : 'not_helpful';

      const result = await this.interactionModel.updateOne(
        {
          _id: interactionId,
          threadId,
        },
        {
          $set: {
            user_rating: rating,
            user_feedback: feedback || null,
            feedback_timestamp: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        throw new Error(
          `Interaction ${interactionId} not found in thread ${threadId}`,
        );
      }

      // Get the updated thread and interaction
      const thread = await this.threadModel
        .findOne({ threadId })
        .populate({
          path: 'interactions',
          populate: ['visualization', 'sqlResult'],
        })
        .lean();
      const interaction = thread?.interactions.find(
        (i) => i._id.toString() === interactionId,
      );

      if (
        interaction &&
        interaction.execution_status === 'success' &&
        isHelpful
      ) {
        // Generate learning example from this interaction
        await this.generateLearningExampleFromInteraction(thread, interaction);
      }

      console.info(`User rated interaction ${interactionId} as ${rating}`);
      return true;
    } catch (error) {
      console.error(`Failed to rate query result: ${error}`);
      return false;
    }
  }

  // NEW: Generate learning example from specific interaction with full context
  private async generateLearningExampleFromInteraction(
    thread: Thread,
    interaction: Interaction, // QueryInteraction type
  ): Promise<void> {
    try {
      let conversationHistory = '';
      thread.interactions
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .forEach((i) => {
          if (i.userQuery) conversationHistory += `\nUser: ${i.userQuery}\n`;
          if (i.sqlResult?.sql)
            conversationHistory += `SQL-BY-AI: ${i.sqlResult?.sql}\n`;
          if (i.response) conversationHistory += `AI-Response: ${i.response}\n`;
        });

      const contextPrompt = ChatPromptTemplate.fromTemplate(`
        Create a single, comprehensive question that captures the full intent of this conversation.
        The question should be standalone and include all necessary context.

        Conversation:
        {conversation}

        Current Query: {currentQuery}
        Final SQL Result: {finalSql}

        Create a single question that someone could ask to get the same final SQL result.
        The question should be clear, specific, and include all relevant details.

        Example:
        Instead of: "Show me sales" followed by "add customer names" followed by "filter by last month"
        Create: "Show me sales with customer names filtered by last month"

        Respond with just the question, no explanation.
      `);

      const chain = contextPrompt
        .pipe(this.langChainService.getLLM())
        .pipe(new StringOutputParser());
      const contextualQuestion = await chain.invoke({
        conversation: conversationHistory,
        currentQuery: interaction.userQuery,
        finalSql: interaction.sqlResult?.sql,
      });

      // Build the contextual question including conversation history
      const question = contextualQuestion.trim();
      const sql = interaction.sqlResult?.sql;

      // Check if similar example already exists
      const similarExamples = await this.findSimilarExamples(question, 1, 0.85);
      if (similarExamples.length > 0) {
        console.debug(`Similar example already exists for: ${question}`);
        return;
      }

      // Generate embedding for the contextual question
      const embedding = await this.generateEmbedding(question);

      const example: Omit<SqlExample, 'id' | 'created_at'> = {
        question,
        sql,
        description: `Auto-generated from user feedback (helpful rating). Context: ${interaction.user_feedback || 'User found this helpful'}`,
        category: 'user_feedback',
        embedding,
        quality_score: 0.8, // High score since user marked as helpful
        is_verified: true, // Auto-approve since user liked it
      };

      await this.clickHouseService.addExample(example);
      console.info(
        `Generated learning example from interaction feedback: ${question}`,
      );
    } catch (error) {
      console.error(
        `Failed to generate learning example from interaction: ${error}`,
      );
    }
  }
}
