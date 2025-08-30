#!/usr/bin/env node

import Fastify from 'fastify';
import { config } from './config/environment.js';

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  uptime: number;
}

interface AppModule {
  config: typeof config;
  start: () => Promise<void>;
}

const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    timestamp: { type: 'string' },
    environment: { type: 'string' },
    uptime: { type: 'number' }
  }
};

const startServer = async () => {
  const fastify = Fastify({
    logger: true
  });

  fastify.get('/health', {
    schema: {
      response: {
        200: healthResponseSchema
      }
    }
  }, async () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.server.environment,
      uptime: process.uptime()
    };
    return response;
  });

  try {
    await fastify.listen({ port: config.server.port, host: config.server.host });
    console.log(`🚴 Strava Vagabond server running on port ${config.server.port}`);
    console.log(`📊 Health check available at http://localhost:${config.server.port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const appModule: AppModule = {
  config,
  start: startServer
};

export default appModule;
