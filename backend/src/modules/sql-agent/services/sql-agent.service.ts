import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkflowService } from './workflow.service';
import { ConnectionService } from './connection.service';
import { Thread, ThreadDocument } from '../schemas/thread.schema';
import { v4 as uuidv4 } from 'uuid';
import { QueryRequestInput } from '../dto/sql-agent.dto';
import {
  Interaction,
  InteractionDocument,
} from '../schemas/interaction.schema';

@Injectable()
export class SqlAgentService {
  constructor(
    private workflowService: WorkflowService,
    private connectionService: ConnectionService,
    @InjectModel(Thread.name)
    private threadModel: Model<ThreadDocument>,
    @InjectModel(Interaction.name)
    private interactionModel: Model<InteractionDocument>,
  ) {}

  async processQuery(request: QueryRequestInput): Promise<Thread> {
    const threadId = request.threadId || uuidv4();

    // Force connection selection - connectionId is now required
    if (!request.connectionId) {
      throw new HttpException(
        'Connection ID is required. Please select a database connection before submitting your query.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate and get the connection
    let connectionId: Types.ObjectId;
    const connection = await this.connectionService.findOne(
      request.connectionId,
    );
    connectionId = connection?._id;

    //check again
    if (!connectionId) {
      throw new HttpException(
        'Invalid connection ID. Please select a valid database connection.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const interaction = await this.interactionModel.create({
      threadId,
      userQuery: request.query,
    });
    console.debug(interaction);

    // Create a new thread if it doesn't exist (without embedded interactions)
    const existingThread = await this.getUserThread(threadId);
    if (!existingThread) {
      await this.threadModel.create({
        threadId,
        db: 'custom', // Always custom since connectionId is required
        connectionId,
        locale: request.locale || 'en',
        timezone: request.timezone || 'UTC',
        interactions: [interaction._id],
      });
    } else {
      // Update connection and append the new interaction
      const updateData: any = {
        $push: { interactions: interaction._id },
        connectionId, // Always update with the required connectionId
      };

      await this.threadModel.updateOne({ threadId }, updateData);
    }

    // The workflow service will handle creating the Interaction document
    await this.workflowService
      .executeWorkflow(
        request.query,
        threadId,
        interaction._id.toString(),
        request.connectionId,
        request.llmProvider,
      )
      .catch((error) => {
        console.error(
          `Background processing error for thread ${threadId}: ${error.message || error}`,
        );
        throw error;
      });

    return await this.getUserThread(threadId);
  }

  async getUserThread(
    threadId: string,
    deep?: boolean,
  ): Promise<Thread | null> {
    return deep
      ? await this.threadModel
          .findOne({
            threadId,
          })
          .populate({
            path: 'interactions',
            populate: ['visualization', 'sqlResult'],
          })
          .lean()
      : await this.threadModel
          .findOne({
            threadId,
          })
          .lean();
  }

  async getUserThreads(): Promise<Thread[]> {
    return this.threadModel
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50) // Limit to recent threads
      .exec();
  }
}
