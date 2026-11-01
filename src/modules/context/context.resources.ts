import { ResourceDecorator as Resource, Injectable, ExecutionContext } from '@nitrostack/core';
import { ContextService } from './context.service.js';

@Injectable({ deps: [ContextService] })
export class ContextResources {
  constructor(private contextService: ContextService) {}

  @Resource({
    uri: 'creator://profile',
    name: 'Creator Profile',
    description: 'Sample LinkedIn creator profile: name, niche, target audience, and interests.',
    mimeType: 'application/json',
  })
  async getProfile(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading creator profile resource');
    const creator = this.contextService.getCreator(this.contextService.getDefaultCreatorId());
    const profile = {
      id: creator.id,
      name: creator.name,
      headline: creator.headline,
      niche: creator.niche,
      audience: creator.audience,
      interests: creator.interests,
    };
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(profile, null, 2) }],
    };
  }

  @Resource({
    uri: 'creator://content-history',
    name: 'Creator Content History',
    description: 'Previous LinkedIn posts by the sample creator, with topic, framing, and summary.',
    mimeType: 'application/json',
  })
  async getContentHistory(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading creator content history resource');
    const creator = this.contextService.getCreator(this.contextService.getDefaultCreatorId());
    const history = creator.posts.map((p) => ({
      id: p.id,
      date: p.date,
      topic: p.topic,
      framing: p.framing,
      summary: p.summary,
    }));
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ posts: history }, null, 2) }],
    };
  }
}
