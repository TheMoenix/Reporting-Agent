import { AgentStateType } from '../types/agent-state';

export type NodeType =
  | 'contextLoader'
  | 'topicGenerator'
  | 'intentClassifier'
  | 'executor'
  | 'graphAnalyzer'
  | 'postProcessor'
  | 'chitchatHandler';

export interface AdvanceOptions {
  state?: AgentStateType;
  message: string;
  iteration?: number; // Only for executor node
}

export class ProgressTracker {
  private currentPercentage = 0;
  private executorIterations = 0;
  private executorRemainingPool = 50; // Executor owns 50% total

  // Node weights
  private readonly nodeWeights = {
    // Pre-executor nodes share 25% total
    contextLoader: 8,
    topicGenerator: 8,
    intentClassifier: 9,
    // Executor gets 50% (handled dynamically)
    executor: 50,
    // Post-executor nodes share 25% total
    graphAnalyzer: 15,
    postProcessor: 10,
  };

  constructor(
    private publishProgress: (
      threadId: string,
      step: string,
      message: string,
      state?: AgentStateType,
      percentage?: number,
    ) => Promise<void>,
    private threadId: string,
  ) {}

  async advance(nodeType: NodeType, options: AdvanceOptions): Promise<void> {
    const { state, message, iteration } = options;
    let progressIncrement = 0;

    if (nodeType === 'executor') {
      if (iteration !== undefined) {
        // Each iteration takes 20% of the remaining executor pool
        progressIncrement = this.executorRemainingPool * 0.2;
        this.executorRemainingPool -= progressIncrement;
        this.executorIterations++;
      } else {
        // Initial executor call - no progress increment yet
        progressIncrement = 0;
      }
    } else {
      // Fixed weights for non-executor nodes
      progressIncrement = this.nodeWeights[nodeType];
    }

    this.currentPercentage += progressIncrement;

    // Ensure we never exceed 100%
    this.currentPercentage = Math.min(this.currentPercentage, 100);

    await this.publishProgress(
      this.threadId,
      nodeType,
      message,
      state,
      Math.round(this.currentPercentage * 100) / 100, // Round to 2 decimal places
    );
  }

  getCurrentPercentage(): number {
    return this.currentPercentage;
  }

  getRemainingExecutorPool(): number {
    return this.executorRemainingPool;
  }
}
