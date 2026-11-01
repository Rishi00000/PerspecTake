import { Injectable } from '@nitrostack/core';
import { ContextService, CreatorPost, ReferencePost } from '../context/context.service.js';

export type OriginalityCategory = 'Common framing' | 'Somewhat distinctive' | 'Distinctive angle';

export interface SimilarReference {
  id: string;
  author: string;
  topic: string;
  central_claim: string;
  similarity: number;
  image_url: string;
}

export interface RepeatedPost {
  id: string;
  date: string;
  topic: string;
  framing: string;
  similarity: number;
  image_url: string;
}

export interface OriginalityAnalysis {
  originality_category: OriginalityCategory;
  topic_saturation: 'High' | 'Medium' | 'Low';
  angle_distinctiveness: 'Low' | 'Medium' | 'High';
  creator_repetition: 'High' | 'Medium' | 'Low';
  reasoning: string[];
  generic_phrases_found: string[];
  missing_perspective: string;
  similar_reference_ideas: SimilarReference[];
  similar_creator_posts: RepeatedPost[];
  suggested_follow_up_question: string;
  recommended_direction: string;
  basis_note: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'be',
  'it', 'its', 'this', 'that', 'these', 'those', 'as', 'at', 'by', 'from', 'my', 'your', 'our', 'their',
  'i', 'you', 'we', 'they', 'he', 'she', 'them', 'me', 'us', 'so', 'do', 'does', 'or', 'not', 'if', 'than',
  'will', 'can', 'just', 'about', 'into', 'out', 'up', 'down', 'more', 'most', 'every', 'everything',
]);

/** Phrases that commonly signal broad, widely repeated LinkedIn framing. */
export const GENERIC_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\beverything\b/i, label: 'sweeping "everything" claim' },
  { pattern: /\bchanging\b/i, label: 'vague "is changing" framing' },
  { pattern: /\badapt or (get )?left behind\b|\bleft behind\b/i, label: '"adapt or get left behind" warning' },
  { pattern: /\bdevelopers? need to\b/i, label: 'prescriptive "developers need to" advice' },
  { pattern: /\bthe future of\b/i, label: '"the future of" prediction' },
  { pattern: /\bgame[- ]changer\b|\brevolution\w*\b/i, label: 'hype language (game-changer / revolution)' },
  { pattern: /\bmust[- ]know\b|\bevery (developer|engineer|creator)\b/i, label: 'universal "must-know" framing' },
  { pattern: /\bwill (replace|take over)\b/i, label: 'replacement prediction' },
  { pattern: /\b(top|\d+) (tips|tools|ways|things)\b/i, label: 'list-style tips framing' },
];

/** Words that signal a personal experience, which makes a post more distinctive. */
const PERSONAL_MARKERS = /\b(i|my|me|we|our)\b/i;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Deterministic originality analysis over the local reference corpus and the
 * creator's own post history. Scores are derived from the actual input text,
 * not from canned answers.
 */
@Injectable({ deps: [ContextService] })
export class OriginalityService {
  constructor(private contextService: ContextService) {}

  analyze(args: {
    contentIdea: string;
    creatorNiche: string;
    targetAudience: string;
    creatorPosts: CreatorPost[];
  }): OriginalityAnalysis {
    const ideaTokens = new Set(tokenize(args.contentIdea));
    const nicheTokens = new Set(tokenize(`${args.creatorNiche} ${args.targetAudience}`));
    const references = this.contextService.getReferencePosts();

    const similarRefs = this.rankReferences(ideaTokens, references);
    const similarOwn = this.rankOwnPosts(ideaTokens, args.creatorPosts);

    const genericHits = GENERIC_PATTERNS.filter((g) => g.pattern.test(args.contentIdea)).map((g) => g.label);
    const hasPersonal = PERSONAL_MARKERS.test(args.contentIdea);
    const hasNumbers = /\d/.test(args.contentIdea);

    const topSimilarRef = similarRefs[0]?.similarity ?? 0;
    const topSimilarOwn = similarOwn[0]?.similarity ?? 0;
    const nicheOverlap = ideaTokens.size > 0 ? [...ideaTokens].filter((t) => nicheTokens.has(t)).length / ideaTokens.size : 0;

    // Saturation: how close the idea sits to widely discussed reference content.
    const refHits = similarRefs.filter((r) => r.similarity >= 0.15).length;
    const saturationScore = topSimilarRef * 0.6 + Math.min(refHits, 4) / 4 * 0.25 + Math.min(genericHits.length, 3) / 3 * 0.15;
    const topic_saturation: OriginalityAnalysis['topic_saturation'] =
      saturationScore >= 0.45 ? 'High' : saturationScore >= 0.22 ? 'Medium' : 'Low';

    // Distinctiveness: penalise generic framing, reward personal voice and specificity.
    let distinct = 0.6;
    distinct -= Math.min(genericHits.length, 3) * 0.15;
    distinct += hasPersonal ? 0.15 : 0;
    distinct += hasNumbers ? 0.05 : 0;
    distinct -= topSimilarRef * 0.3;
    distinct = Math.max(0, Math.min(1, distinct));
    const angle_distinctiveness: OriginalityAnalysis['angle_distinctiveness'] =
      distinct >= 0.6 ? 'High' : distinct >= 0.35 ? 'Medium' : 'Low';

    const creator_repetition: OriginalityAnalysis['creator_repetition'] =
      topSimilarOwn >= 0.3 ? 'High' : topSimilarOwn >= 0.15 ? 'Medium' : 'Low';

    const originality_category: OriginalityCategory =
      distinct >= 0.6 && topic_saturation !== 'High'
        ? 'Distinctive angle'
        : distinct >= 0.35 && topic_saturation !== 'High'
          ? 'Somewhat distinctive'
          : 'Common framing';

    const reasoning = this.buildReasoning({
      genericHits,
      hasPersonal,
      topSimilarRef,
      topSimilarOwn,
      nicheOverlap,
      topic_saturation,
      creator_repetition,
      similarRefCount: refHits,
    });

    return {
      originality_category,
      topic_saturation,
      angle_distinctiveness,
      creator_repetition,
      reasoning,
      generic_phrases_found: genericHits,
      missing_perspective: this.missingPerspective(hasPersonal, hasNumbers),
      similar_reference_ideas: similarRefs.slice(0, 3),
      similar_creator_posts: similarOwn.slice(0, 2),
      suggested_follow_up_question: this.followUpQuestion(hasPersonal, args.contentIdea),
      recommended_direction: this.recommendedDirection(originality_category, hasPersonal, args.targetAudience),
      basis_note:
        'This assessment is based only on the reference collection and creator post history available in this demo. It cannot prove an idea has never been published elsewhere.',
    };
  }

  private rankReferences(ideaTokens: Set<string>, refs: ReferencePost[]): SimilarReference[] {
    return refs
      .map((r) => {
        const refTokens = new Set([...tokenize(r.topic), ...tokenize(r.centralClaim), ...r.keywords.map((k) => k.toLowerCase())]);
        return {
          id: r.id,
          author: r.author,
          topic: r.topic,
          central_claim: r.centralClaim,
          similarity: Math.round(jaccard(ideaTokens, refTokens) * 100) / 100,
          image_url: r.imageUrl,
        };
      })
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
  }

  private rankOwnPosts(ideaTokens: Set<string>, posts: CreatorPost[]): RepeatedPost[] {
    return posts
      .map((p) => ({
        id: p.id,
        date: p.date,
        topic: p.topic,
        framing: p.framing,
        similarity: Math.round(jaccard(ideaTokens, new Set(tokenize(`${p.topic} ${p.summary}`))) * 100) / 100,
        image_url: p.imageUrl,
      }))
      .filter((p) => p.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
  }

  private buildReasoning(s: {
    genericHits: string[];
    hasPersonal: boolean;
    topSimilarRef: number;
    topSimilarOwn: number;
    nicheOverlap: number;
    topic_saturation: string;
    creator_repetition: string;
    similarRefCount: number;
  }): string[] {
    const lines: string[] = [];
    lines.push(
      s.topic_saturation === 'High'
        ? `The topic is heavily covered in the reference collection (${s.similarRefCount} closely related posts).`
        : s.topic_saturation === 'Medium'
          ? `The topic appears in several reference posts, so the angle needs to stand out.`
          : `The reference collection has little direct overlap with this wording.`,
    );
    if (s.genericHits.length) {
      lines.push(`Generic framing detected: ${s.genericHits.join('; ')}.`);
    } else {
      lines.push('No stock-phrase framing was detected in the wording.');
    }
    lines.push(
      s.hasPersonal
        ? 'The idea uses first-person language, which signals a personal angle.'
        : 'The idea has no first-person experience or observation; it reads as a general claim.',
    );
    if (s.creator_repetition === 'High') {
      lines.push('The creator has already published a closely related post, so this would repeat existing content.');
    } else if (s.creator_repetition === 'Medium') {
      lines.push('The creator has covered a related theme before; a new angle will help it feel fresh.');
    }
    if (s.nicheOverlap < 0.3) {
      lines.push('The idea is only loosely tied to the stated niche and audience.');
    }
    return lines;
  }

  private missingPerspective(hasPersonal: boolean, hasNumbers: boolean): string {
    if (!hasPersonal) {
      return 'A first-hand experience: what you personally did, saw, or got wrong, and what changed as a result.';
    }
    if (!hasNumbers) {
      return 'A concrete detail or specific observation that only you could report.';
    }
    return 'A clear point of view on why the common take is incomplete.';
  }

  private followUpQuestion(hasPersonal: boolean, idea: string): string {
    if (!hasPersonal) {
      return 'What changed in your own work after you started using this, and what surprised you most?';
    }
    return `What specific moment or result made you believe this, and what would you tell someone who disagrees with "${idea.slice(0, 80).trim()}"?`;
  }

  private recommendedDirection(cat: OriginalityCategory, hasPersonal: boolean, audience: string): string {
    const who = audience.trim() ? audience.trim() : 'your audience';
    if (cat === 'Distinctive angle') {
      return `Keep the angle and make it concrete for ${who}: lead with your specific observation and close with a clear takeaway.`;
    }
    if (cat === 'Somewhat distinctive') {
      return `Add one specific experience for ${who}, then name the common take you disagree with.`;
    }
    return `Replace the broad claim with a first-hand story for ${who}: what you tried, what broke, and what you'd do differently.${hasPersonal ? '' : ' Start by answering the follow-up question.'}`;
  }
}
