import { Injectable } from '@nitrostack/core';
import { GENERIC_PATTERNS, tokenize } from './originality.service.js';

export interface RefinedAngle {
  original_idea: string;
  identified_generic_angle: string;
  refined_angle: string;
  why_it_is_more_distinctive: string[];
  suggested_post_direction: string;
}

/**
 * Builds a refined angle that reuses the creator's own insight. It never invents
 * experiences, numbers, or evidence: every personal claim comes from the input.
 */
@Injectable()
export class RefineService {
  refine(args: { originalIdea: string; personalInsight: string; analysisContext?: string }): RefinedAngle {
    const idea = args.originalIdea.trim();
    const insight = args.personalInsight.trim();

    const genericLabels = GENERIC_PATTERNS.filter((g) => g.pattern.test(idea)).map((g) => g.label);
    const hasPersonalFraming = /\b(i|my|me|we|our)\b/i.test(idea);
    const identifiedGeneric = genericLabels.length
      ? `The idea uses ${genericLabels.join(', ')}. Grounding that framing in a specific detail from your experience can make it more personal.`
      : hasPersonalFraming
        ? 'The idea already uses first-person language; make the observation or result behind it more specific.'
        : 'The idea reads as a broad claim; a specific first-hand example could make it more personal.';

    const insightSentences = splitSentences(insight);
    const leadSentence = insightSentences[0] ?? insight;
    const tailSentence = insightSentences.slice(1).join(' ');

    const refined = buildRefinedText(leadSentence, tailSentence);
    const sharedWithIdea = countShared(tokenize(idea), tokenize(insight));

    const why: string[] = [
      'It leads with the experience you supplied rather than a broad claim about the whole industry.',
      'It uses details from your insight and does not add new personal experiences, facts, or evidence.',
    ];
    if (genericLabels.length) {
      why.push(`It drops the generic framing (${genericLabels.join('; ')}) that the original relied on.`);
    }
    if (sharedWithIdea < 2) {
      why.push('It introduces a perspective the original idea did not contain, so it adds something new to the conversation.');
    }

    return {
      original_idea: idea,
      identified_generic_angle: identifiedGeneric,
      refined_angle: refined,
      why_it_is_more_distinctive: why,
      suggested_post_direction: `Open with the experience you described, explain what it changed in your view of the original idea, and end with one question for your ${args.analysisContext?.trim() ? 'audience' : 'readers'}.`,
    };
  }
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function countShared(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

/**
 * Produces a two-sentence angle from the creator's insight. The first sentence states the
 * personal experience; the second states the contrarian point drawn from their insight.
 */
function buildRefinedText(lead: string, tail: string): string {
  const leadClean = lead.replace(/[.!?]+$/, '');
  const tailClean = tail.replace(/[.!?]+$/, '');
  if (tailClean) {
    return `${leadClean}. ${tailClean}.`;
  }
  return `${leadClean}.`;
}
