import { Injectable } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export interface CreatorPost {
  id: string;
  date: string;
  topic: string;
  summary: string;
  framing: string;
  imageUrl: string;
  engagement: { likes: number; comments: number };
}

export interface CreatorProfile {
  id: string;
  name: string;
  headline: string;
  niche: string;
  audience: string;
  interests: string[];
  profileImageUrl: string;
  posts: CreatorPost[];
}

export interface ReferencePost {
  id: string;
  author: string;
  topic: string;
  centralClaim: string;
  framing: string;
  keywords: string[];
  imageUrl: string;
}

export interface SavedIdea {
  id: string;
  text: string;
  originalIdea: string | null;
  creatorId: string;
  savedAt: string;
}

/**
 * Loads the local sample dataset and keeps saved ideas in memory for the MVP demo.
 * No LinkedIn API or credentials are used.
 */
@Injectable()
export class ContextService {
  private creators: CreatorProfile[] | null = null;
  private references: ReferencePost[] | null = null;
  private readonly saved: SavedIdea[] = [];

  getCreator(creatorId: string): CreatorProfile {
    const creators = this.loadCreators();
    const found = creators.find((c) => c.id === creatorId);
    if (!found) {
      const known = creators.map((c) => c.id).join(', ');
      throw new Error(`Creator "${creatorId}" not found. Known creator IDs: ${known}`);
    }
    return found;
  }

  getDefaultCreatorId(): string {
    return this.loadCreators()[0].id;
  }

  getReferencePosts(): ReferencePost[] {
    if (!this.references) {
      const raw = this.readFixture('reference-posts.json');
      this.references = Array.isArray(raw.posts) ? (raw.posts as ReferencePost[]) : [];
    }
    return this.references;
  }

  saveIdea(text: string, originalIdea: string | null, creatorId: string): SavedIdea {
    const idea: SavedIdea = {
      id: `idea_${String(this.saved.length + 1).padStart(3, '0')}`,
      text,
      originalIdea,
      creatorId,
      savedAt: new Date().toISOString(),
    };
    this.saved.push(idea);
    return idea;
  }

  getSavedIdeas(): SavedIdea[] {
    return [...this.saved];
  }

  private loadCreators(): CreatorProfile[] {
    if (!this.creators) {
      const raw = this.readFixture('creator-profile.json');
      this.creators = Array.isArray(raw.creators) ? (raw.creators as CreatorProfile[]) : [];
      if (this.creators.length === 0) {
        throw new Error('Creator fixture is empty: fixtures/creator-profile.json');
      }
    }
    return this.creators;
  }

  private readFixture(fileName: string): any {
    const filePath = path.join(process.cwd(), 'fixtures', fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fixture not found: fixtures/${fileName}`);
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      throw new Error(`Fixture fixtures/${fileName} is not valid JSON`);
    }
  }
}
