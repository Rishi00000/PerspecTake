import { Module } from '@nitrostack/core';
import { ContextModule } from '../context/context.module.js';
import { OriginalityService } from './originality.service.js';
import { RefineService } from './refine.service.js';
import { OriginalityTools } from './originality.tools.js';
import { OriginalityPrompts } from './originality.prompts.js';

@Module({
  name: 'originality',
  description: 'Score LinkedIn post ideas for originality and refine personal angles',
  imports: [ContextModule],
  controllers: [OriginalityTools, OriginalityPrompts],
  providers: [OriginalityService, RefineService],
  exports: [OriginalityService, RefineService],
})
export class OriginalityModule {}
