
declare namespace NodeJS {
  interface ProcessEnv {
    // Example environment variables
    PORT: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET: string;
    RP_ID: string;
    RP_NAME: string;
    RP_ORIGIN: string;
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY: string;
  }
}