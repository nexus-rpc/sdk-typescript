/** @import { OperationHandler } from "./operation-handler" */

/**
 * The return type from the {@link OperationHandler.start} method. May be synchronous or asynchronous.
 *
 * @see {@link HandlerStartOperationResult.sync} or {@link HandlerStartOperationResult.async}
 *
 * @experimental
 */
export type HandlerStartOperationResult<T = unknown> =
  | HandlerStartOperationResultSync<T>
  | HandlerStartOperationResultAsync;

/**
 * The return type from the {@link OperationHandler.start} method. The result may be synchronous or asynchronous.
 *
 * @experimental
 */
export const HandlerStartOperationResult = {
  /**
   * Create a result that indicates that an operation has been accepted and will complete asynchronously.
   */
  async(token: string): HandlerStartOperationResultAsync {
    return {
      isAsync: true,
      token,
    };
  },

  /**
   * Create a result that indicates that an operation completed successfully.
   */
  sync<T>(value: T): HandlerStartOperationResultSync<T> {
    return {
      isAsync: false,
      value,
    };
  },
};

/**
 * A result that indicates that an operation completed successfully.
 *
 * @example
 * ```typescript
 *   return HandlerStartOperationResult.sync(42);
 * ```
 *
 * @experimental
 */
export interface HandlerStartOperationResultSync<T = unknown> {
  /**
   * Indicate whether the operation will complete synchronously (false) or asynchronously (true).
   */
  isAsync: false;

  /**
   * The return value of the operation.
   */
  value: T;
}

/**
 * A result that indicates that an operation has been accepted and will complete asynchronously.
 *
 * @example
 * ```typescript
 *   return HandlerStartOperationResult.async("unique token");
 * ```
 *
 * @experimental
 */
export interface HandlerStartOperationResultAsync {
  /**
   * Indicate whether the operation will complete synchronously (false) or asynchronously (true).
   */
  isAsync: true;

  /**
   * A token to identify the operation in followup handler methods such as {@link OperationHandler.getResult}
   * and {@link OperationHandler.cancel}.
   */
  token: string;
}
