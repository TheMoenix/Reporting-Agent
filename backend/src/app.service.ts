import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  getHealthcheck(): string {
    return `${process.env.DEPLOYMENT_NAME} is healthy`;
  }
}
