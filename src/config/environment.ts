import dotenv from 'dotenv';

dotenv.config();

interface ServerConfig {
  port: number;
  host: string;
  environment: string;
}

interface DatabaseConfig {
  url: string;
  ssl: boolean;
}

interface RedisConfig {
  url: string;
}

interface StravaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface EmailConfig {
  service: string;
  apiKey: string;
  from: string;
}

interface AppConfig {
  server: ServerConfig;
  database?: DatabaseConfig;
  redis?: RedisConfig;
  strava?: StravaConfig;
  jwt?: JWTConfig;
  email?: EmailConfig;
}

export const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  }
};

export default config;
