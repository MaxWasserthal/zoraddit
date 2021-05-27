declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_DATABASE_URL: string;
    REACT_APP_REDIS_URL: string;
    REACT_APP_PORT: string;
    REACT_APP_SESSION_SECRET: string;
    REACT_APP_CORS_ORIGIN: string;
  }
}