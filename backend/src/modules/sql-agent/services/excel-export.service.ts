import { Inject, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelExportService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async exportToExcel(
    data: Array<Record<string, unknown>>,
    filename?: string,
    sheetName?: string,
  ): Promise<{ url: string; filename: string }> {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects.');
      }

      const bucketName = 'reporting-agent-files';

      const sanitizeSheetName = (name?: string) => {
        const invalid = /[:\\/?*\[\]]/g;
        const cleaned = (name || 'Report').replace(invalid, ' ').trim();
        return cleaned.slice(0, 31) || 'Report';
      };

      const sanitizeFilename = (name: string) => {
        const base = name.toLowerCase().endsWith('.xlsx')
          ? `${name.split('.xlsx')[0]}_${new Date().getTime()}.xlsx`
          : `${name}_${new Date().getTime()}.xlsx`;
        return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
      };

      const isoDate = new Date().toISOString().slice(0, 10);
      const defaultName = `report_${isoDate}.xlsx`;

      const finalSheetName = sanitizeSheetName(sheetName);
      const finalFilename = sanitizeFilename(filename || defaultName);
      const objectPath = `reports/${finalFilename}`;

      // ---- Build workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
      const buffer: Buffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'buffer',
      });

      // ---- Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectPath,
        Body: buffer,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        CacheControl: 'public, max-age=3600',
      });

      await this.s3Client.send(uploadCommand);

      // ---- Get S3 public URL
      const publicUrl = `https://${bucketName}.s3.amazonaws.com/${objectPath}`;

      return {
        url: publicUrl,
        filename: finalFilename,
      };
    } catch (error: any) {
      console.error(`Excel export service error: ${error?.stack || error}`);
      throw new Error(
        `Failed to generate Excel file: ${error?.message || String(error)}`,
      );
    }
  }
}
