import { ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { ContextService } from '../context/context.service.js';
import { OriginalityService } from './originality.service.js';
import { RefineService } from './refine.service.js';

@Injectable({ deps: [ContextService, OriginalityService, RefineService] })
export class OriginalityTools {
  constructor(
    private contextService: ContextService,
    private originalityService: OriginalityService,
    private refineService: RefineService,
  ) {}

  @Tool({
    name: 'open_perspectake',
    description: 'Open the PerspecTake landing screen to enter a LinkedIn post idea, niche and audience, then analyze its originality.',
    inputSchema: z.object({}),
  })
  @Widget('landing')
  async openPerspectake(_input: Record<string, never>, ctx: ExecutionContext) {
    ctx.logger.info('Opening PerspecTake landing');
    const creator = this.contextService.getCreator(this.contextService.getDefaultCreatorId());
    return {
      tagline: 'Your perspective. Your take. Your originality.',
      description: 'Score a post idea for originality against common framing and your own history, then sharpen it with your personal insight.',
      default_niche: creator.niche,
      default_audience: creator.audience,
    };
  }

  @Tool({
    name: 'analyze_idea_originality',
    description:
      'Assess how original a LinkedIn post idea is. Compares the idea with a reference collection and the creator\'s own past posts, and returns a category (Common framing / Somewhat distinctive / Distinctive angle), generic framing found, similar reference ideas, and a follow-up question. The assessment is based only on the available reference material and cannot prove an idea has never been published.',
    inputSchema: z.object({
      content_idea: z
        .string()
        .min(10, 'Content idea must be at least 10 characters')
        .max(1000)
        .describe('The LinkedIn post idea or draft claim to evaluate'),
      creator_niche: z.string().min(2).max(200).describe('The creator\'s niche, e.g. "AI engineering and software development"'),
      target_audience: z.string().min(2).max(200).describe('Who the post is for, e.g. "Students and early-career developers"'),
    }),
    examples: {
      request: {
        content_idea: 'AI is changing everything. Developers need to adapt or get left behind.',
        creator_niche: 'AI engineering and software development',
        target_audience: 'Students and early-career developers',
      },
    },
  })
  @Widget('analysis-results')
  async analyzeIdeaOriginality(
    input: { content_idea: string; creator_niche: string; target_audience: string },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Analyzing idea originality', { length: input.content_idea.length });

    const creator = this.contextService.getCreator(this.contextService.getDefaultCreatorId());
    const analysis = this.originalityService.analyze({
      contentIdea: input.content_idea.trim(),
      creatorNiche: input.creator_niche.trim(),
      targetAudience: input.target_audience.trim(),
      creatorPosts: creator.posts,
    });

    return {
      content_idea: input.content_idea.trim(),
      creator_niche: input.creator_niche.trim(),
      target_audience: input.target_audience.trim(),
      ...analysis,
    };
  }

  @Tool({
    name: 'refine_idea_angle',
    description:
      'Turn a generic LinkedIn post idea into a more distinctive angle using the creator\'s own personal experience or insight. Preserves the creator\'s meaning and does not invent experiences, numbers, or evidence.',
    inputSchema: z.object({
      original_idea: z.string().min(10, 'Original idea must be at least 10 characters').max(1000).describe('The original post idea'),
      creator_personal_insight: z
        .string()
        .min(10, 'Personal insight must be at least 10 characters')
        .max(1000)
        .describe('The creator\'s own experience or insight to build the angle from'),
      analysis_context: z
        .string()
        .max(2000)
        .optional()
        .describe('Optional context from analyze_idea_originality (category, reasoning, audience)'),
    }),
    examples: {
      request: {
        original_idea: 'AI is changing everything. Developers need to adapt or get left behind.',
        creator_personal_insight:
          'I used AI to build my first prototype, but debugging its assumptions took more effort than writing the code.',
      },
    },
  })
  @Widget('refined-angle')
  async refineIdeaAngle(
    input: { original_idea: string; creator_personal_insight: string; analysis_context?: string },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Refining idea angle');
    const refined = this.refineService.refine({
      originalIdea: input.original_idea,
      personalInsight: input.creator_personal_insight,
      analysisContext: input.analysis_context,
    });
    return {
      original_idea: refined.original_idea,
      identified_generic_angle: refined.identified_generic_angle,
      refined_angle: refined.refined_angle,
      why_it_is_more_distinctive: refined.why_it_is_more_distinctive,
      suggested_post_direction: refined.suggested_post_direction,
    };
  }
}
