import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SqlAgentResolver } from './resolvers/sql-agent.resolver';
import { SqlExamplesResolver } from './resolvers/sql-examples.resolver';
import { ConnectionResolver } from './resolvers/connection.resolver';
import { LLMResolver } from './resolvers/llm.resolver';
import { SqlAgentService } from './services/sql-agent.service';
import { WorkflowService } from './services/workflow.service';
import { LangChainService } from './services/langchain.service';
import { ConnectionService } from './services/connection.service';
import { PubSubService } from './services/pubsub.service';
import { ClickHouseService } from './services/clickhouse.service';
import { SqlExamplesService } from './services/sql-examples.service';
import { Thread, ThreadSchema } from './schemas/thread.schema';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { SqlResult, QueryResultSchema } from './schemas/query-result.schema';
import { Connection, ConnectionSchema } from './schemas/connection.schema';
import {
  Visualization,
  VisualizationSchema,
} from './schemas/visualization.schema';
import { CommonModule } from 'src/modules/common/common.module';
import { SqlAgentSubscriptionResolver } from './resolvers/sql-agent.sub.resolver';
import { ExcelExportResolver } from './resolvers/excel-export.resolver';
import { ExcelExportService } from './services/excel-export.service';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Interaction.name, schema: InteractionSchema },
      { name: SqlResult.name, schema: QueryResultSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: Visualization.name, schema: VisualizationSchema },
    ]),
  ],
  providers: [
    SqlAgentResolver,
    SqlExamplesResolver,
    ConnectionResolver,
    LLMResolver,
    SqlAgentService,
    WorkflowService,
    LangChainService,
    ConnectionService,
    PubSubService,
    ClickHouseService,
    SqlExamplesService,
    SqlAgentSubscriptionResolver,
    ExcelExportResolver,
    ExcelExportService,
  ],
  exports: [
    SqlAgentService,
    WorkflowService,
    SqlExamplesService,
    ConnectionService,
  ],
})
export class SqlAgentModule {}
