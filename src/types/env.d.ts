declare namespace NodeJS {
    interface ProcessEnv {
      // Example environment variables
      PORT: string;
      DATABASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
      JWT_SECRET: string;
      // Add other environment variables you use
    }
  }