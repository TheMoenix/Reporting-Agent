import { Resolver, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { ExcelExportService } from '../services/excel-export.service';
import {
  Interaction,
  InteractionDocument,
} from '../schemas/interaction.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SqlResultDocument } from '../schemas/query-result.schema';

@ObjectType()
export class ExcelExportResponse {
  @Field()
  url: string;

  @Field()
  filename: string;
}

@Resolver()
export class ExcelExportResolver {
  constructor(
    private excelExportService: ExcelExportService,
    @InjectModel(Interaction.name)
    private interactionModel: Model<InteractionDocument>,
  ) {}

  @Mutation(() => ExcelExportResponse)
  async exportToExcel(
    @Args('interactionId') interactionId: string,
  ): Promise<{ url: string; filename: string }> {
    try {
      const interaction = await this.interactionModel
        .findById(interactionId)
        .populate<{ sqlResult: SqlResultDocument }>('sqlResult');

      if (
        !interaction ||
        !interaction.sqlResult ||
        !interaction.sqlResult.rows
      ) {
        throw new Error('No data found for this interaction.');
      }

      const { rows } = interaction.sqlResult;
      const filename = `report_${interaction.threadId}_${interactionId}.xlsx`;

      return this.excelExportService.exportToExcel(rows, filename);
    } catch (error) {
      console.error(
        `Failed to export Excel for interaction ${interactionId}: ${error.message}`,
      );
      throw new Error('Failed to generate Excel file.');
    }
  }
}
