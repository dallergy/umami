import type { QueryFilters } from './types';

export function sanitizeSortFilters<const T extends readonly string[]>(
  filters: QueryFilters = {},
  allowedFields: T,
  defaults: Partial<Pick<QueryFilters, 'orderBy' | 'sortDescending'>> = {},
): QueryFilters {
  const { orderBy, sortDescending, ...rest } = filters;
  const fallbackOrderBy = defaults.orderBy;
  const fallbackSortDescending = defaults.sortDescending;
  const isAllowed = orderBy ? allowedFields.includes(orderBy as T[number]) : false;

  return {
    ...rest,
    ...(isAllowed
      ? {
          orderBy,
          sortDescending,
        }
      : {
          ...(fallbackOrderBy && { orderBy: fallbackOrderBy }),
          ...(fallbackSortDescending !== undefined && {
            sortDescending: fallbackSortDescending,
          }),
        }),
  };
}

// A column or alias, optionally table-qualified or double-quoted (e.g. created_at, "lastAt",
// session.created_at). Anything else is never interpolated into raw SQL.
const SQL_IDENTIFIER =
  /^(?:"[A-Za-z_][A-Za-z0-9_]*"|[A-Za-z_][A-Za-z0-9_]*)(?:\.(?:"[A-Za-z_][A-Za-z0-9_]*"|[A-Za-z_][A-Za-z0-9_]*))?$/;

/** Returns orderBy when it is a plain SQL identifier, otherwise undefined. */
export function getSafeOrderBy(orderBy?: unknown): string | undefined {
  return typeof orderBy === 'string' && SQL_IDENTIFIER.test(orderBy) ? orderBy : undefined;
}
