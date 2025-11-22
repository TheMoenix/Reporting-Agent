export interface IGraphQLContext {
  user: {
    id: number;
    name: string;
    email: string;
    db: string;
    allowed_company_ids: number[];
    company_id: number;
    context: any;
  };
}

export enum HEADERS {
  COOKIE = 'x-cookie',
  DATABASE = 'x-database',
  CONFIG = 'x-config',
}

export declare enum ENV {
  DEV = 'dev',
  PROD = 'prod',
  LOCAL = 'local',
  TEST = 'test',
}

//triggers
export enum TRIGGERS {
  CHAT_CREATED = 'chatCreated',
  CHAT_UPDATED = 'chatUpdated',
}
