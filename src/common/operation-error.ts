import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";

/**
 * Options for constructing an {@link OperationError}.
 *
 * @experimental
 * @inline
 */
export interface OperationErrorOptions {
  /**
   * State of the operation.
   */
  state: "canceled" | "failed";

  /**
   * Underlying cause of the error.
   */
  cause: Error;
}

/**
 * An error that represents "failed" and "canceled" operation results.
 *
 * @experimental
 */
// XXX: Go: OperationError (nexus/api.go)
// XXX: Java: OperationException (java.io.nexusrpc.OperationException)
// XXX: Python: OperationError (nexusrpc/_common.py)
// XXX: Note the absence of `message`. This is in line with all reference SDKs.
// XXX: Python has one, which is incorrect. We may change this across the board in the future, but not now.
export class OperationError extends Error {
  /**
   * State of the operation.
   */
  public readonly state: "canceled" | "failed";

  /**
   * The error that resulted in this operation error.
   */
  declare public readonly cause: Error;

  constructor(options: OperationErrorOptions) {
    if (options.state !== "canceled" && options.state !== "failed") {
      throw new TypeError(
        `OperationError's state is required and must be either 'canceled' or 'failed'; got: '${options.state}'`,
      );
    }

    if (typeof options.cause !== "object" || options.cause === null) {
      throw new TypeError(
        `OperationError's cause is required and must be an object; got: '${options.cause}'`,
      );
    }

    // According to the spec, OperationError really doesn't have a message of its own,
    // but we make one, because it is generally expected in JS that Error.message is set.
    const message = options.state === "failed" ? `Operation failed` : `Operation canceled`;

    super(message, { cause: options.cause });
    this.state = options.state;
  }

  /**
   * Create a new {@link OperationError} representing a failed operation.
   *
   * This is a convenience method. It is equivalent to:
   *
   * ```ts
   * new OperationError({ state: "failed", cause });
   * ```
   *
   * @experimental
   */
  public static failure(cause: Error): OperationError {
    return new OperationError({
      state: "failed",
      cause,
    });
  }

  /**
   * Create a new {@link OperationError} representing a canceled operation.
   *
   * This is a convenience method. It is equivalent to:
   *
   * ```ts
   * new OperationError({ state: "canceled", cause });
   * ```
   *
   * @experimental
   */
  public static canceled(cause: Error): OperationError {
    return new OperationError({
      state: "canceled",
      cause,
    });
  }
}

injectSymbolBasedInstanceOf(OperationError, "OperationError");
