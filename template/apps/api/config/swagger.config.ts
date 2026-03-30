import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import basicAuth = require('express-basic-auth');
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';

const documentConfig = new DocumentBuilder()
  .setTitle('Dummy API')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Paste JWT here (without "Bearer ")',
    },
    'Bearer',
  )
  .addSecurityRequirements('Bearer')
  .build();

const swaggerUiOptions: SwaggerCustomOptions = {
  swaggerOptions: { persistAuthorization: true },
  customSiteTitle: 'Dummy API Documentation',
  customJs: [
    'https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js',
  ],
  customCssUrl: ['https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css'],
};

export const configureSwaggerUI = (app: INestApplication) => {
  const document = SwaggerModule.createDocument(app, documentConfig);

  const express = app.getHttpAdapter().getInstance();

  express.get('/openapi.json', (_req: Request, res: Response) =>
    res.json(document),
  );

  // Scalar Docs
  express.use(
    '/docs',
    apiReference({
      url: '/openapi.json',
      theme: 'default',
    }),
  );

  // Swagger UI
  SwaggerModule.setup('swagger', app, document, swaggerUiOptions);
};
