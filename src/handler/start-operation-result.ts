/** A result that indicates that an operation completed successfully. */
export interface HandlerStartOperationResultSync<T> {
  value: T;
}

/** A result that indicates that an operation has been accepted and will complete asynchronously. */
export interface HandlerStartOperationResultAsync {
  /**
   * A token to identify the operation in followup handler methods such as {@link OperationHandler["getResult"]} and
   * {@link OperationHandler["cancel"]}.
   */
  token: string;
}

/**
 * The return type from the {@link OperationHandler["start"]}. May be synchronous or asynchronous.
 */
export type HandlerStartOperationResult<T> =
  | HandlerStartOperationResultSync<T>
  | HandlerStartOperationResultAsync;
