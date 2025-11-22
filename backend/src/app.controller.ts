import { Controller, Get, Param, Post, Response } from '@nestjs/common';
import { Response as Res } from 'express';
import { AppService } from './app.service';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/healthcheck')
  healthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Get('file/:filename')
  getFile(@Response() res: Res, @Param('filename') filename: string) {
    const filePath = join(process.cwd(), filename);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const file = createReadStream(filePath);
    file.pipe(res);
  }
}
