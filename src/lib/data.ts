import { DATA_TYPE, DATETIME_REGEX, FIELD_LENGTH } from './constants';
import { truncateString } from './format';
import type { DynamicDataType } from './types';

export interface KeyValueData {
  key: string;
  value: any;
  dataType: DynamicDataType;
}

// Documented limit: event and session data objects keep at most 50 properties. Each property
// becomes a stored row, so this also bounds what one tracking request can write.
export const MAX_DATA_PROPERTIES = 50;
// Objects nested deeper than this are stored as a single JSON value instead of being expanded.
export const MAX_DATA_DEPTH = 5;

export function flattenJSON(eventData: Record<string, any>): KeyValueData[] {
  const result: KeyValueData[] = [];

  function flatten(obj: Record<string, any>, parentKey: string, depth: number) {
    for (const [key, value] of Object.entries(obj)) {
      if (result.length >= MAX_DATA_PROPERTIES) {
        return;
      }

      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const isObject =
        value && typeof value === 'object' && !Array.isArray(value) && !isValidDateValue(value);

      if (isObject && depth < MAX_DATA_DEPTH) {
        flatten(value, fullKey, depth + 1);
      } else {
        result.push(createKeyValue(fullKey, value));
      }
    }
  }

  if (eventData && typeof eventData === 'object') {
    flatten(eventData, '', 1);
  }

  return result;
}

export function isValidDateValue(value: string) {
  return typeof value === 'string' && DATETIME_REGEX.test(value);
}

export function getDataType(value: any): string {
  let type: string = typeof value;

  if (isValidDateValue(value)) {
    type = 'date';
  }

  return type;
}

export function getStringValue(value: string, dataType: number) {
  if (dataType === DATA_TYPE.number) {
    return parseFloat(value).toFixed(4);
  }

  if (dataType === DATA_TYPE.date) {
    return new Date(value).toISOString();
  }

  return value;
}

export function getStoredStringValue(value: string, dataType: number) {
  const stringValue = getStringValue(value, dataType);

  if (dataType === DATA_TYPE.array && stringValue.length > FIELD_LENGTH.stringValue) {
    return null;
  }

  return truncateString(stringValue, FIELD_LENGTH.stringValue);
}

export function createKeyValue(key: string, value: any): KeyValueData {
  const type = getDataType(value);
  let dataType: DynamicDataType;
  let processedValue = value;

  switch (type) {
    case 'number':
      dataType = DATA_TYPE.number;
      break;
    case 'string':
      dataType = DATA_TYPE.string;
      break;
    case 'boolean':
      dataType = DATA_TYPE.boolean;
      processedValue = value ? 'true' : 'false';
      break;
    case 'date':
      dataType = DATA_TYPE.date;
      break;
    case 'object':
      dataType = DATA_TYPE.array;
      processedValue = JSON.stringify(value);
      break;
    default:
      dataType = DATA_TYPE.string;
      break;
  }

  return { key, value: processedValue, dataType };
}

export function objectToArray(obj: object) {
  return Object.keys(obj).map(key => obj[key]);
}
