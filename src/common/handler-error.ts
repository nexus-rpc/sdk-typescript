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
 * Options for constructing a {@link HandlerError} from a message, type, and a retryable flag.
 */
export interface HandlerErrorMessageOptions {
  /** Error message. */
  message: string;

  /** One of the predefined error types. */
  type: HandlerErrorType;

  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is retryable by default unless specified otherwise.
   */
  retryable?: boolean;
}

/**
 * Options for constructing a {@link HandlerError} from an underlying cause, type, and a retryable flag.
 */
export interface HandlerErrorCauseOptions extends ErrorOptions {
  /** One of the predefined error types. */
  type: HandlerErrorType;

  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is retryable by default unless specified otherwise.
   */
  retryable?: boolean;
}

/**
 * Options for constructing a {@link HandlerError} from either a message or an underlying cause.
 */
export type HandlerErrorOptions = HandlerErrorMessageOptions | HandlerErrorCauseOptions;

/**
 * A special error that can be returned from {@link OperationHandler} methods for failing a request with a custom status
 * code and failure message.
 */
export class HandlerError extends Error {
  /** One of the predefined error types. */
  public readonly type: HandlerErrorType;

  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is retryable by default unless specified otherwise.
   */
  public readonly retryable?: boolean;

  constructor(options: HandlerErrorOptions) {
    super((options as any).message, options as any as ErrorOptions);
    this.type = options.type;
    this.retryable = options?.retryable;
  }
}

injectSymbolBasedInstanceOf(HandlerError, "HandlerError");
