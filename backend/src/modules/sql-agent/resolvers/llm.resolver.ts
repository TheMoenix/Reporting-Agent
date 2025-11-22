import { Resolver, Query } from '@nestjs/graphql';
import { LangChainService } from '../services/langchain.service';
import { LLMProvider } from '../dto/llm.dto';

@Resolver()
export class LLMResolver {
  constructor(private readonly langChainService: LangChainService) {}

  @Query(() => [LLMProvider])
  async getAvailableLLMs(): Promise<LLMProvider[]> {
    return this.langChainService.getAvailableLLMs();
  }
}
