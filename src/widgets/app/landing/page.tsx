'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { getToolResponseObject } from '../../lib/tool-response';

export const dynamic = 'force-dynamic';

interface LandingData {
  tagline?: string;
  description?: string;
  default_niche?: string;
  default_audience?: string;
}

const accent = '#10B981';

export default function LandingWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const data = getToolOutput<LandingData>();
  const [idea, setIdea] = useState('');
  const [niche, setNiche] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  if (!isReady) return <div style={{ padding: 24, textAlign: 'center' }}>Connecting…</div>;
  if (!data || typeof data !== 'object') return <div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>;

  const isDark = theme === 'dark';
  const text = isDark ? '#F3F4F6' : '#111827';
  const surface = isDark ? '#111827' : '#FFFFFF';
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: text,
    fontSize: 14,
    fontFamily: 'inherit',
  };

  const currentNiche = niche ?? data.default_niche ?? '';
  const currentAudience = audience ?? data.default_audience ?? '';
  const canSubmit = idea.trim().length >= 10 && currentNiche.trim().length >= 2 && currentAudience.trim().length >= 2 && status !== 'loading';

  const onAnalyze = async () => {
    if (!canSubmit) return;
    setStatus('loading');
    setMessage('');
    try {
      const response = await callTool('analyze_idea_originality', {
        content_idea: idea.trim(),
        creator_niche: currentNiche.trim(),
        target_audience: currentAudience.trim(),
      });
      const result = getToolResponseObject(response);
      if (typeof result.originality_category !== 'string') {
        throw new Error('The analysis did not include an originality category.');
      }
      setCategory(result.originality_category);
      setStatus('done');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Analysis failed. Try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: text, background: surface, borderRadius: 16, padding: 20, maxWidth: 720, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: accent, fontWeight: 700 }}>PerspecTake</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, lineHeight: 1.25 }}>{data.tagline ?? 'Make your LinkedIn ideas distinctly yours.'}</div>
      <div style={{ fontSize: 14, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>{data.description ?? ''}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Content idea
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="e.g. AI is changing everything. Developers need to adapt."
            style={{ ...inputStyle, marginTop: 6, resize: 'vertical' }}
          />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Niche
          <input value={currentNiche} onChange={(e) => setNiche(e.target.value)} maxLength={200} style={{ ...inputStyle, marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Target audience
          <input value={currentAudience} onChange={(e) => setAudience(e.target.value)} maxLength={200} style={{ ...inputStyle, marginTop: 6 }} />
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canSubmit}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: `1px solid ${accent}`,
            background: accent,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 14,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          {status === 'loading' ? 'Analyzing…' : 'Analyze Originality'}
        </button>
        {status === 'done' ? (
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Result: {category || 'see the analysis in chat'}
          </span>
        ) : null}
        {status === 'error' ? <span style={{ fontSize: 13, color: '#DC2626' }}>{message}</span> : null}
      </div>
    </div>
  );
}
