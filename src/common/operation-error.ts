import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";

/**
 * A Nexus operation error.
 *
 * This error class represents the abnormal completion of a Nexus operation,
 * that should be reported to the caller as an operation error.
 *
 * Example:
 *
 * ```ts
 *     import { OperationError } from "nexus-rpc";
 *
 *     // Throw a failed operation error
 *     throw new OperationError("failed", "Not enough inventory");
 *
 *     // Throw a failed operation error, with a cause
 *     throw new OperationError("failed", "Not enough inventory", { cause });
 *
 *     // Throw a canceled operation error
 *     throw new OperationError("canceled", "User canceled the operation");
 * ```
 *
 * @experimental
 */
export class OperationError extends Error {
  /**
   * State of the operation.
   */
  public readonly state: OperationErrorState;

  /**
   * The error that resulted in this operation error.
   */
  declare public readonly cause: Error;

  /**
   * Constructs a new {@link OperationError}.
   *
   * @param state - The state of the operation.
   * @param message - The message of the error.
   * @param options - Extra options for the error, e.g. the cause.
   */
  constructor(
    state: OperationErrorState,
    message?: string | undefined,
    options?: Omit<OperationErrorOptions, "message">,
  ) {
    const defaultMessage = state === "canceled" ? `Operation canceled` : `Operation failed`;
    const actualMessage = message || defaultMessage;

    super(actualMessage, { cause: options?.cause });
    this.state = state;
  }

  /**
   * Wraps an error in a {@link OperationError}.
   *
   * This is a convenience method to create an {@link OperationError} that simply contains an
   * existing error.
   *
   * @experimental
   */
  public static wrap(
    state: OperationErrorState,
    cause: Error,
    options?: Omit<OperationErrorOptions, "cause">,
  ): OperationError {
    return new OperationError(state, options?.message, { cause });
  }
}

injectSymbolBasedInstanceOf(OperationError, "OperationError");

/**
 * Options for constructing an {@link OperationError}.
 *
 * @experimental
 * @inline
 */
export interface OperationErrorOptions {
  /**
   * Message of the error.
   */
  message?: string | undefined;

  /**
   * Underlying cause of the error.
   */
  cause?: Error | undefined;
}

/**
 * Describes state of an operation that did not complete successfully.
 *
 * This is a subset of {@link OperationState}.
 *
 * @experimental
 * @inline
 */
export type OperationErrorState = "failed" | "canceled";
