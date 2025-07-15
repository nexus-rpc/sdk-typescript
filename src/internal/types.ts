// FIXME: Prune unneeded types once we've settled the question of HandlerErrorOptions.

/**
 * A utility type that requires at least one of the specified keys to be present.
 *
 * @template T - The base type
 * @template K - The keys that should have at least one present
 *
 * @example
 * ```ts
 *   interface Options {
 *     message?: string;
 *     cause?: unknown;
 *     type: string;
 *   }
 *
 *   // This ensures at least one of 'message' or 'cause' is present
 *   type ValidOptions = RequireAtLeastOneOf<Options, 'message' | 'cause'>;
 * ```
 *
 * @internal
 */
export type RequireAtLeastOneOf<T, K extends keyof T> = {
  [P in K]-?: Required<Pick<T, P>> & Partial<Omit<Pick<T, K>, P>>;
}[K] &
  Omit<T, K>;

/**
 * A utility type that requires exactly one of the specified keys to be present.
 *
 * @template T - The base type
 * @template K - The keys of which exactly one should be present
 *
 * @example
 * ```ts
 *   interface Options {
 *     message?: string;
 *     cause?: unknown;
 *     type: string;
 *   }
 *
 *   // This ensures either 'message' or 'cause' is present, but not both
 *   type ValidOptions = RequireExactlyOne<Options, 'message' | 'cause'>;
 * ```
 *
 * @internal
 */
export type RequireExactlyOne<T, K extends keyof T> = {
  [P in K]-?: Required<Pick<T, P>> & Forbid<Exclude<K, P>>;
}[K] &
  Omit<T, K>;

/**
 * A utility type that forbids the specified properties
 *
 * @template K - The keys to forbid
 *
 * @internal
 */
export type Forbid<K extends string | number | symbol> = Record<K, never>;
