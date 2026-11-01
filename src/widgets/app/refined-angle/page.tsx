'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { getToolResponseObject } from '../../lib/tool-response';

export const dynamic = 'force-dynamic';

interface RefinedData {
  original_idea?: string;
  identified_generic_angle?: string;
  refined_angle?: string;
  why_it_is_more_distinctive?: string[];
  suggested_post_direction?: string;
}

const accent = '#10B981';

function cardBlock(title: string, body: any, highlight: boolean, isDark: boolean): any {
  const bg = highlight
    ? 'rgba(16,185,129,0.10)'
    : isDark
      ? 'rgba(255,255,255,0.03)'
      : 'rgba(0,0,0,0.02)';
  const border = highlight ? accent : 'rgba(127,127,127,0.25)';
  return (
    <div style={{ flex: '1 1 260px', minWidth: 0, background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, opacity: 0.7, marginBottom: 8 }}>{title}</div>
      {body}
    </div>
  );
}

export default function RefinedAngleWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const data = getToolOutput<RefinedData>();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedId, setSavedId] = useState<string>('');

  if (!isReady) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Connecting…</div>;
  }
  if (!data) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading refined angle…</div>;
  }
  if (typeof data !== 'object' || !data.refined_angle) {
    return <div style={{ padding: 24, textAlign: 'center' }}>The refined angle was incomplete.</div>;
  }

  const isDark = theme === 'dark';
  const text = isDark ? '#F3F4F6' : '#111827';
  const surface = isDark ? '#111827' : '#FFFFFF';
  const reasons = data.why_it_is_more_distinctive ?? [];
  const refined = data.refined_angle;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(refined);
      setCopied(true);
      setCopyError('');
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
      setCopyError(error instanceof Error ? error.message : 'Could not copy the refined angle.');
    }
  };

  const onSave = async () => {
    if (saveState === 'saving') return;
    setSaveState('saving');
    try {
      const response = await callTool('save_idea', {
        idea_text: refined,
        original_idea: data.original_idea ?? '',
      });
      const result = getToolResponseObject(response);
      if (result.saved !== true || typeof result.idea_id !== 'string') {
        throw new Error('The idea was not confirmed as saved.');
      }
      setSavedId(result.idea_id);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const buttonBase = {
    padding: '10px 16px',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    border: `1px solid ${accent}`,
  } as const;

  const originalBody = <div style={{ fontSize: 15, lineHeight: 1.6 }}>{data.original_idea ?? ''}</div>;
  const refinedBody = <div style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 600 }}>{refined}</div>;
  const reasonsBody = (
    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 14 }}>
      {reasons.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: text, background: surface, borderRadius: 16, padding: 20, maxWidth: 900, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: accent, fontWeight: 700 }}>PerspecTake · Refined angle</div>
      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
        <strong>Generic angle identified:</strong> {data.identified_generic_angle ?? ''}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        {cardBlock('Original idea', originalBody, false, isDark)}
        {cardBlock('Refined angle', refinedBody, true, isDark)}
      </div>

      <div style={{ marginTop: 16, border: '1px solid rgba(127,127,127,0.25)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Why it is more distinctive</div>
        {reasonsBody}
      </div>

      {data.suggested_post_direction ? (
        <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6 }}>
          <strong>Suggested post direction:</strong> {data.suggested_post_direction}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, alignItems: 'center' }}>
        <button
          type="button"
          onClick={onCopy}
          style={{ ...buttonBase, background: 'transparent', color: accent }}
        >
          {copied ? 'Copied' : 'Copy angle'}
        </button>
        {copyError ? <span role="alert" style={{ fontSize: 13, color: '#DC2626' }}>{copyError}</span> : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          style={{ ...buttonBase, background: accent, color: '#FFFFFF', opacity: saveState === 'saving' ? 0.7 : 1 }}
        >
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save idea'}
        </button>
        {saveState === 'saved' && savedId ? (
          <span style={{ fontSize: 13, opacity: 0.75 }}>Saved as {savedId}</span>
        ) : null}
        {saveState === 'error' ? (
          <span style={{ fontSize: 13, color: '#DC2626' }}>Could not save. Try again.</span>
        ) : null}
      </div>
    </div>
  );
}
