import type { CallToolResponse } from '@nitrostack/widgets';

export function getToolResponseObject(response: CallToolResponse): Record<string, unknown> {
  if (response.isError) {
    throw new Error(response.result || 'The tool call failed.');
  }

  const value: unknown = response.structuredContent ?? JSON.parse(response.result);
  if (!isRecord(value)) {
    throw new Error('The tool returned an unexpected response.');
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
