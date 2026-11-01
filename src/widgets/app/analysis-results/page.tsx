'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import type { CSSProperties, ReactNode } from 'react';
import { getToolResponseObject } from '../../lib/tool-response';

export const dynamic = 'force-dynamic';

interface SimilarRef {
  id?: string;
  author?: string;
  topic?: string;
  central_claim?: string;
  similarity?: number;
  image_url?: string;
}

interface RepeatedPost {
  id?: string;
  date?: string;
  topic?: string;
  framing?: string;
  similarity?: number;
  image_url?: string;
}

interface AnalysisData {
  content_idea?: string;
  creator_niche?: string;
  target_audience?: string;
  originality_category?: string;
  topic_saturation?: string;
  angle_distinctiveness?: string;
  creator_repetition?: string;
  reasoning?: string[];
  generic_phrases_found?: string[];
  missing_perspective?: string;
  similar_reference_ideas?: SimilarRef[];
  similar_creator_posts?: RepeatedPost[];
  suggested_follow_up_question?: string;
  recommended_direction?: string;
  basis_note?: string;
}

interface RefinedData {
  original_idea: string;
  identified_generic_angle: string;
  refined_angle: string;
  why_it_is_more_distinctive: string[];
  suggested_post_direction: string;
}

const accent = '#10B981';

function isRefinedData(value: Record<string, unknown>): value is Record<string, unknown> & RefinedData {
  return (
    typeof value.original_idea === 'string' &&
    typeof value.identified_generic_angle === 'string' &&
    typeof value.refined_angle === 'string' &&
    Array.isArray(value.why_it_is_more_distinctive) &&
    value.why_it_is_more_distinctive.every((reason) => typeof reason === 'string') &&
    typeof value.suggested_post_direction === 'string'
  );
}

function categoryColor(category: string): string {
  if (category === 'Distinctive angle') return accent;
  if (category === 'Somewhat distinctive') return '#F59E0B';
  return '#EF4444';
}

function initialsOf(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

function percent(value: number | undefined): string {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${Math.round(v * 100)}%`;
}

function sectionBlock(title: string, body: ReactNode): ReactNode {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {body}
    </div>
  );
}

function metricBlock(label: string, value: string): ReactNode {
  return (
    <div style={{ flex: '1 1 120px', border: '1px solid rgba(127,127,127,0.25)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.65 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value || '—'}</div>
    </div>
  );
}

function imageCardBlock(key: string, imageUrl: string | undefined, label: string, title: string, meta: string): ReactNode {
  const frame: CSSProperties = {
    border: '1px solid rgba(127,127,127,0.25)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'rgba(127,127,127,0.06)',
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div key={key} style={frame}>
      <div style={{ aspectRatio: '16 / 9', width: '100%', background: 'rgba(16,185,129,0.12)' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 0 }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: accent }}>
            {initialsOf(label)}
          </div>
        )}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{meta}</div>
      </div>
    </div>
  );
}

export default function AnalysisResultsWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const data = getToolOutput<AnalysisData>();
  const [insight, setInsight] = useState('');
  const [refined, setRefined] = useState<RefinedData | null>(null);
  const [refineStatus, setRefineStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [refineMessage, setRefineMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const onRefine = async () => {
    if (!data || insight.trim().length < 10 || refineStatus === 'loading') return;
    setRefineStatus('loading');
    setRefineMessage('');
    setRefined(null);
    setSaveStatus('idle');
    setSaveMessage('');
    try {
      const response = await callTool('refine_idea_angle', {
        original_idea: data.content_idea ?? '',
        creator_personal_insight: insight.trim(),
        analysis_context: JSON.stringify({
          originality_category: data.originality_category,
          creator_niche: data.creator_niche,
          target_audience: data.target_audience,
          reasoning: data.reasoning,
          recommended_direction: data.recommended_direction,
        }),
      });
      const result = getToolResponseObject(response);
      if (!isRefinedData(result)) {
        throw new Error('The refinement response was incomplete.');
      }
      setRefined(result);
      setRefineStatus('idle');
    } catch (error) {
      setRefineStatus('error');
      setRefineMessage(error instanceof Error ? error.message : 'Could not refine this idea. Try again.');
    }
  };

  const onCopy = async () => {
    if (!refined) return;
    try {
      await navigator.clipboard.writeText(refined.refined_angle);
      setCopied(true);
      setCopyMessage('');
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
      setCopyMessage(error instanceof Error ? error.message : 'Could not copy the refined angle.');
    }
  };

  const onSave = async () => {
    if (!refined || saveStatus === 'loading' || saveStatus === 'saved') return;
    setSaveStatus('loading');
    setSaveMessage('');
    try {
      const response = await callTool('save_idea', {
        idea_text: refined.refined_angle,
        original_idea: refined.original_idea,
      });
      const result = getToolResponseObject(response);
      if (result.saved !== true || typeof result.idea_id !== 'string') {
        throw new Error('The idea was not confirmed as saved.');
      }
      setSaveMessage(`Saved as ${result.idea_id}`);
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Could not save this idea. Try again.');
    }
  };

  if (!isReady) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Connecting…</div>;
  }
  if (!data) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading analysis…</div>;
  }
  if (typeof data !== 'object' || !data.originality_category) {
    return <div style={{ padding: 24, textAlign: 'center' }}>The analysis result was incomplete.</div>;
  }

  const isDark = theme === 'dark';
  const text = isDark ? '#F3F4F6' : '#111827';
  const surface = isDark ? '#111827' : '#FFFFFF';
  const category = data.originality_category;
  const reasoning = data.reasoning ?? [];
  const generic = data.generic_phrases_found ?? [];
  const refs = data.similar_reference_ideas ?? [];
  const own = data.similar_creator_posts ?? [];

  const reasoningBody = (
    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: 14 }}>
      {reasoning.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>
  );

  const genericBody = (
    <>
      {generic.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {generic.map((g, i) => (
            <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', color: '#DC2626' }}>
              {g}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 14, opacity: 0.75 }}>No stock-phrase framing detected.</div>
      )}
      {data.missing_perspective ? (
        <div style={{ fontSize: 14, marginTop: 10 }}>
          <strong>Missing from your perspective:</strong> {data.missing_perspective}
        </div>
      ) : null}
    </>
  );

  const refsBody =
    refs.length === 0 ? (
      <div style={{ fontSize: 14, opacity: 0.75 }}>No closely related reference posts found.</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {refs.map((r, i) =>
          imageCardBlock(
            r.id ?? `ref-${i}`,
            r.image_url,
            r.author ?? r.topic ?? 'Reference',
            r.topic ?? 'Reference post',
            `${r.author ?? 'Unknown author'} · ${percent(r.similarity)} overlap`,
          ),
        )}
      </div>
    );

  const ownBody =
    own.length === 0 ? (
      <div style={{ fontSize: 14, opacity: 0.75 }}>No closely related posts found in the available sample history.</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {own.map((p, i) =>
          imageCardBlock(
            p.id ?? `own-${i}`,
            p.image_url,
            p.topic ?? 'Post',
            p.topic ?? 'Past post',
            `${p.date ?? ''} · ${percent(p.similarity)} overlap`,
          ),
        )}
      </div>
    );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: text, background: surface, borderRadius: 16, padding: 20, maxWidth: 900, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: accent, fontWeight: 700 }}>PerspecTake · Originality</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4, maxWidth: 560 }}>&ldquo;{data.content_idea ?? ''}&rdquo;</div>
        </div>
        <span style={{ background: categoryColor(category), color: '#FFFFFF', fontWeight: 700, fontSize: 14, padding: '8px 14px', borderRadius: 999 }}>
          {category}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        {metricBlock('Topic saturation', data.topic_saturation ?? '')}
        {metricBlock('Angle distinctiveness', data.angle_distinctiveness ?? '')}
        {metricBlock('Creator repetition', data.creator_repetition ?? '')}
      </div>

      {sectionBlock('Why this rating', reasoningBody)}
      {sectionBlock('Generic framing detected', genericBody)}
      {sectionBlock('Similar reference ideas', refsBody)}
      {sectionBlock('Your past posts on this theme', ownBody)}

      {data.suggested_follow_up_question
        ? sectionBlock(
            'Answer this to sharpen your angle',
            <div>
              <div style={{ fontSize: 15, borderLeft: `4px solid ${accent}`, paddingLeft: 12, fontStyle: 'italic' }}>
                {data.suggested_follow_up_question}
              </div>
              <label style={{ display: 'block', marginTop: 14, fontSize: 13, fontWeight: 600 }}>
                Your experience or insight
                <textarea
                  value={insight}
                  onChange={(event) => setInsight(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="What happened when you tried it? What surprised you?"
                  style={{
                    boxSizing: 'border-box',
                    display: 'block',
                    width: '100%',
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(127,127,127,0.35)',
                    background: 'transparent',
                    color: text,
                    font: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </label>
              <button
                type="button"
                onClick={onRefine}
                disabled={insight.trim().length < 10 || refineStatus === 'loading'}
                style={{
                  marginTop: 10,
                  padding: '10px 16px',
                  border: 0,
                  borderRadius: 10,
                  background: accent,
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: insight.trim().length >= 10 && refineStatus !== 'loading' ? 'pointer' : 'not-allowed',
                  opacity: insight.trim().length >= 10 && refineStatus !== 'loading' ? 1 : 0.55,
                }}
              >
                {refineStatus === 'loading' ? 'Finding your angle…' : 'Refine my angle'}
              </button>
              {refineStatus === 'error' ? (
                <div role="alert" style={{ marginTop: 8, color: '#DC2626', fontSize: 13 }}>{refineMessage}</div>
              ) : null}
            </div>,
          )
        : null}

      {refined ? (
        <div style={{ marginTop: 20, padding: 16, border: `1px solid ${accent}`, borderRadius: 14, background: 'rgba(16,185,129,0.08)' }}>
          <div style={{ fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700, color: accent }}>Your refined angle</div>
          <div style={{ marginTop: 8, fontSize: 18, lineHeight: 1.55, fontWeight: 700 }}>{refined.refined_angle}</div>
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
            <strong>Generic framing:</strong> {refined.identified_generic_angle}
          </div>
          <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 13, lineHeight: 1.6 }}>
            {refined.why_it_is_more_distinctive.map((reason, index) => <li key={index}>{reason}</li>)}
          </ul>
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
            <strong>Post direction:</strong> {refined.suggested_post_direction}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 14 }}>
            <button type="button" onClick={onCopy} style={{ padding: '9px 14px', border: `1px solid ${accent}`, borderRadius: 9, background: 'transparent', color: accent, fontWeight: 700, cursor: 'pointer' }}>
              {copied ? 'Copied' : 'Copy angle'}
            </button>
            {copyMessage ? <span role="alert" style={{ fontSize: 12, color: '#DC2626' }}>{copyMessage}</span> : null}
            <button
              type="button"
              onClick={onSave}
              disabled={saveStatus === 'loading' || saveStatus === 'saved'}
              style={{ padding: '9px 14px', border: `1px solid ${accent}`, borderRadius: 9, background: accent, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', opacity: saveStatus === 'loading' || saveStatus === 'saved' ? 0.7 : 1 }}
            >
              {saveStatus === 'loading' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save idea'}
            </button>
            {saveMessage ? (
              <span role={saveStatus === 'error' ? 'alert' : 'status'} style={{ fontSize: 12, color: saveStatus === 'error' ? '#DC2626' : undefined }}>
                {saveMessage}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {data.recommended_direction
        ? sectionBlock('Recommended direction', <div style={{ fontSize: 14, lineHeight: 1.6 }}>{data.recommended_direction}</div>)
        : null}

      {data.basis_note ? (
        <div style={{ marginTop: 18, fontSize: 11, opacity: 0.6, lineHeight: 1.5 }}>{data.basis_note}</div>
      ) : null}
    </div>
  );
}
