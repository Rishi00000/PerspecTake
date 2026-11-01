import { Module } from '@nitrostack/core';
import { ContextService } from './context.service.js';
import { ContextTools } from './context.tools.js';
import { ContextResources } from './context.resources.js';

@Module({
  name: 'context',
  description: 'Creator profile, post history, and saved ideas',
  controllers: [ContextTools, ContextResources],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
