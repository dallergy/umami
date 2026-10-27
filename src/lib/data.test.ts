import { describe, expect, test } from 'vitest';
import { DATA_TYPE, FIELD_LENGTH } from './constants';
import { flattenJSON, getStoredStringValue, MAX_DATA_DEPTH, MAX_DATA_PROPERTIES } from './data';

describe('getStoredStringValue', () => {
  test('truncates oversized string values to the storage limit', () => {
    expect(
      getStoredStringValue('x'.repeat(FIELD_LENGTH.stringValue + 25), DATA_TYPE.string),
    ).toHaveLength(FIELD_LENGTH.stringValue);
  });

  test('drops oversized array payloads instead of storing invalid truncated JSON', () => {
    const oversizedArray = JSON.stringify([`x${'y'.repeat(FIELD_LENGTH.stringValue)}`]);

    expect(getStoredStringValue(oversizedArray, DATA_TYPE.array)).toBeNull();
  });
});

describe('flattenJSON', () => {
  test('flattens nested objects into dotted keys', () => {
    expect(flattenJSON({ a: 1, b: { c: 'x' } }).map(({ key }) => key)).toEqual(['a', 'b.c']);
  });

  test('keeps at most the documented number of properties', () => {
    const data = Object.fromEntries(Array.from({ length: 10_000 }, (_, i) => [`k${i}`, i]));

    expect(flattenJSON(data)).toHaveLength(MAX_DATA_PROPERTIES);
  });

  test('counts nested properties toward the limit', () => {
    const nested = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`n${i}`, i]));
    const data = { a: nested, b: nested };

    expect(flattenJSON(data)).toHaveLength(MAX_DATA_PROPERTIES);
  });

  test('stores objects nested past the depth limit as one JSON value', () => {
    let deep: Record<string, any> = { leaf: 1 };

    for (let i = 0; i < 1_000; i++) {
      deep = { d: deep };
    }

    const [entry] = flattenJSON(deep);

    expect(entry.key.split('.')).toHaveLength(MAX_DATA_DEPTH);
    expect(typeof entry.value).toBe('string');
  });
});
