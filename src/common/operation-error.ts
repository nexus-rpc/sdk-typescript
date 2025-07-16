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
 *     import { OperationError } from "@nexus-rpc/sdk-typescript";
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

  constructor(
    state: OperationErrorState,
    message?: string | undefined,
    options?: OperationErrorOptions,
  ) {
    const defaultMessage = state === "canceled" ? `Operation canceled` : `Operation failed`;
    const actualMessage = message || defaultMessage;

    super(actualMessage, { cause: options?.cause });
    this.state = state;
  }

  /**
   * Create a new {@link OperationError} representing a failed operation.
   *
   * This is a convenience method to create an {@link OperationError} for a failed operation.
   *
   * @experimental
   */
  public static failed(cause: Error): OperationError {
    return new OperationError("failed", undefined, { cause });
  }

  /**
   * Create a new {@link OperationError} representing a canceled operation.
   *
   * This is a convenience method to create an {@link OperationError} for a canceled operation.
   *
   * @experimental
   */
  public static canceled(cause: Error): OperationError {
    return new OperationError("canceled", undefined, { cause });
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
   * Underlying cause of the error.
   */
  cause: Error;
}

/**
 * Describes state of an operation that did not complete successfully.
 *
 * This is a subset of {@link OperationState}.
 *
 * @experimental
 */
export type OperationErrorState = "failed" | "canceled";
