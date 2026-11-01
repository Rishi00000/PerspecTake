import { PromptDecorator as Prompt, Injectable, ExecutionContext } from '@nitrostack/core';

@Injectable()
export class OriginalityPrompts {
  @Prompt({
    name: 'originality_evaluation',
    description: 'Reusable prompt to evaluate a LinkedIn post idea for originality against reference material and the creator\'s history.',
    arguments: [
      { name: 'content_idea', description: 'The LinkedIn post idea to evaluate', required: true },
      { name: 'creator_niche', description: 'The creator\'s niche', required: true },
      { name: 'target_audience', description: 'The target audience for the post', required: true },
    ],
  })
  async getOriginalityEvaluationPrompt(
    args: { content_idea: string; creator_niche: string; target_audience: string },
    ctx: ExecutionContext,
  ) {
    return {
      messages: [
        {
          role: 'user',
          content: `Evaluate this LinkedIn post idea for originality.\n\nIdea: "${args.content_idea}"\nNiche: ${args.creator_niche}\nAudience: ${args.target_audience}\n\nUse analyze_idea_originality to get the category, generic framing, similar reference ideas, and creator repetition. Then ask the creator one follow-up question about their personal experience. Base every conclusion on the reference material provided; do not claim the idea has never been published.`,
        },
      ],
    };
  }
}
