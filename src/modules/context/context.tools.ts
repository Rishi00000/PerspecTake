import { ToolDecorator as Tool, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { ContextService } from './context.service.js';

@Injectable({ deps: [ContextService] })
export class ContextTools {
  constructor(private contextService: ContextService) {}

  @Tool({
    name: 'get_creator_context',
    description:
      'Retrieve a creator profile (niche, target audience, interests) and their previous LinkedIn post history from the local sample dataset. Use this to understand a creator before judging originality.',
    inputSchema: z.object({
      creator_id: z
        .string()
        .min(1)
        .max(64)
        .optional()
        .describe('Creator ID from the sample dataset. Defaults to the sample creator (creator_001).'),
    }),
  })
  async getCreatorContext(input: { creator_id?: string }, ctx: ExecutionContext) {
    const creatorId = input.creator_id ?? this.contextService.getDefaultCreatorId();
    ctx.logger.info('Fetching creator context', { creatorId });

    const creator = this.contextService.getCreator(creatorId);
    return {
      creator_id: creator.id,
      name: creator.name,
      headline: creator.headline,
      niche: creator.niche,
      audience: creator.audience,
      interests: creator.interests,
      profile_image_url: creator.profileImageUrl,
      post_count: creator.posts.length,
      posts: creator.posts.map((p) => ({
        id: p.id,
        date: p.date,
        topic: p.topic,
        summary: p.summary,
        framing: p.framing,
        image_url: p.imageUrl,
        engagement: p.engagement,
      })),
    };
  }

  @Tool({
    name: 'save_idea',
    description:
      'Save a refined LinkedIn post angle to the creator\'s saved ideas list and return its saved idea ID.',
    inputSchema: z.object({
      idea_text: z
        .string()
        .min(10, 'Idea text must be at least 10 characters')
        .max(1000)
        .describe('The refined angle or post idea text to save'),
      original_idea: z
        .string()
        .max(1000)
        .optional()
        .describe('The original idea the refined angle came from (optional)'),
      creator_id: z
        .string()
        .min(1)
        .max(64)
        .optional()
        .describe('Creator ID. Defaults to the sample creator (creator_001).'),
    }),
  })
  async saveIdea(input: { idea_text: string; original_idea?: string; creator_id?: string }, ctx: ExecutionContext) {
    const creatorId = input.creator_id ?? this.contextService.getDefaultCreatorId();
    // Validate that the creator exists before saving.
    this.contextService.getCreator(creatorId);

    const idea = this.contextService.saveIdea(input.idea_text.trim(), input.original_idea?.trim() ?? null, creatorId);
    ctx.logger.info('Saved idea', { ideaId: idea.id, creatorId });

    return {
      saved: true,
      idea_id: idea.id,
      creator_id: idea.creatorId,
      saved_at: idea.savedAt,
      idea_text: idea.text,
      message: `Saved idea ${idea.id}.`,
    };
  }
}
