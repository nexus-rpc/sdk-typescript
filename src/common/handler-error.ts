import { type RequireAtLeastOneOf } from "../internal/types";
import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";

/**
 * An error type associated with a {@link HandlerError}, defined according to the Nexus specification.
 *
 * @experimental
 */
export type HandlerErrorType = (typeof HandlerErrorType)[keyof typeof HandlerErrorType];
export const HandlerErrorType = {
  /**
   * The handler cannot or will not process the request due to an apparent client error.
   *
   * Clients should not retry this request unless advised otherwise.
   */
  BAD_REQUEST: "BAD_REQUEST",

  /**
   * The client did not supply valid authentication credentials for this request.
   *
   * Clients should not retry this request unless advised otherwise.
   */
  UNAUTHENTICATED: "UNAUTHENTICATED",

  /**
   * The caller does not have permission to execute the specified operation.
   *
   * Clients should not retry this request unless advised otherwise.
   */
  UNAUTHORIZED: "UNAUTHORIZED",

  /**
   * The requested resource could not be found but may be available in the future.
   */
  NOT_FOUND: "NOT_FOUND",

  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system
   * is out of space.
   *
   * Subsequent requests by the client are permissible.
   */
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED",

  /**
   * An internal error occured.
   *
   * Subsequent requests by the client are permissible.
   */
  INTERNAL: "INTERNAL",

  /**
   * The server either does not recognize the request method, or it lacks the ability to fulfill the
   * request. Clients should not retry this request unless advised otherwise.
   */
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",

  /**
   * The service is currently unavailable.
   *
   * Subsequent requests by the client are permissible.
   */
  UNAVAILABLE: "UNAVAILABLE",

  /**
   * Used by gateways to report that a request to an upstream server has timed out.
   *
   * Subsequent requests by the client are permissible.
   */
  UPSTREAM_TIMEOUT: "UPSTREAM_TIMEOUT",
} as const;

/**
 * Options for constructing a {@link HandlerError}.
 *
 * @experimental
 * @inline
 */
export interface HandlerErrorOptions {
  /**
   * A descriptive error message for the error.
   *
   * This will become the `message` in the resulting Nexus Failure object.
   *
   * Either this or {@link cause} must be provided.
   */
  message?: string;

  /**
   * Underlying cause of the error.
   *
   * Either this or {@link message} must be provided.
   */
  cause?: unknown;

  /**
   * One of the predefined error types.
   *
   * This is required.
   */
  type: HandlerErrorType;

  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is retryable by default unless specified otherwise.
   */
  retryable?: boolean;
}

/**
 * A Nexus handler error.
 *
 * This error class is used to represent errors that occur during the handling of a
 * Nexus operation that should be reported to the caller as a handler error.
 *
 * Example:
 *
 * ```ts
 *     import { HandlerError } from "@nexus-rpc/sdk-typescript";
 *
 *     // Throw a bad request error
 *     throw new HandlerError({
 *         type: "BAD_REQUEST",
 *         message: "Invalid input provided",
 *     })
 *
 *     // Throw a retryable internal error
 *     throw new HandlerError({
 *         type: "INTERNAL",
 *         message: "Database unavailable",
 *         retryable: true,
 *     })
 * ```
 *
 * @experimental
 */
export class HandlerError extends Error {
  /**
   * One of the predefined error types.
   *
   * @see {@link HandlerErrorType}
   */
  public readonly type: HandlerErrorType;

  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is retryable by default unless specified otherwise.
   */
  public readonly retryable?: boolean;

  /**
   * Constructs a new {@link HandlerError}.
   *
   * @param options - The options for the error.
   */
  constructor(options: RequireAtLeastOneOf<HandlerErrorOptions, "message" | "cause">) {
    // FIXME: Waiting for confirmation on whether to allow both message and cause, or make them mutually exclusive,
    //        and either message-only should be transformed into a cause.
    const causeMessage = (options.cause as Error)?.message;
    const message =
      options.message && causeMessage
        ? `${options.message}: ${causeMessage}`
        : options.message || causeMessage || "Handler error";

    super(message, { cause: options.cause });
    this.type = options.type;
    this.retryable = options?.retryable;
  }
}

injectSymbolBasedInstanceOf(HandlerError, "HandlerError");
