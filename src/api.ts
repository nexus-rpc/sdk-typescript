/** A representation of the variable states of an operation. */
export type OperationState = "succeeded" | "failed" | "canceled" | "running";

export interface OperationInfo {
  // Token for the operation.
  token: string;
  // State of the operation.
  state: OperationState;
}

/**
 * An error type associated with a {@link HandlerError}, defined according to the Nexus specification.
 * Only the types defined as consts in this package are valid. Do not use other values. See each type's details below:
 *
 * BAD_REQUEST - The server cannot or will not process the request due to an apparent client error. Clients should not
 * retry this request unless advised otherwise.
 *
 * UNAUTHENTICATED - The client did not supply valid authentication credentials for this request. Clients should not
 * retry this request unless advised otherwise.
 *
 * UNAUTHORIZED - The caller does not have permission to execute the specified operation. Clients should not retry this
 * request unless advised otherwise.
 *
 * NOT_FOUND - The requested resource could not be found but may be available in the future. Clients should not retry
 * this request unless advised otherwise.
 *
 * RESOURCE_EXHAUSTED - Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system
 * is out of space. Subsequent requests by the client are permissible.
 *
 * INTERNAL - An internal error occured. Subsequent requests by the client are permissible.
 *
 * NOT_IMPLEMENTED - The server either does not recognize the request method, or it lacks the ability to fulfill the
 * request. Clients should not retry this request unless advised otherwise.
 *
 * UNAVAILABLE - The service is currently unavailable. Subsequent requests by the client are permissible.
 *
 * UPSTREAM_TIMEOUT - Used by gateways to report that a request to an upstream server has timed out. Subsequent
 * requests by the client are permissible.
 */
export type HandlerErrorType =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "RESOURCE_EXHAUSTED"
  | "INTERNAL"
  | "NOT_IMPLEMENTED"
  | "UNAVAILABLE"
  | "UPSTREAM_TIMEOUT";

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
   * type. For example, INTERNAL is not retryable by default unless specified otherwise.
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
   * type. For example, INTERNAL is not retryable by default unless specified otherwise.
   */
  retryable?: boolean;
}

/**
 * Options for constructing a {@link HandlerError} from either a message or an underlying cause.
 */
export type HandlerErrorOptions =
  | HandlerErrorMessageOptions
  | HandlerErrorCauseOptions;

/**
 * A special error that can be returned from {@link OperationHandler} methods for failing a request with a custom status
 * code and failure message.
 */
export class HandlerError extends Error {
  /** One of the predefined error types. */
  public readonly type: HandlerErrorType;
  /**
   * Whether this error should be considered retryable. If not specified, retry behavior is determined from the error
   * type. For example, INTERNAL is not retryable by default unless specified otherwise.
   */
  public readonly retryable?: boolean;

  constructor(options: HandlerErrorOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super((options as any).message, options as any as ErrorOptions);
    this.type = options.type;
    this.retryable = options?.retryable;
  }
}

/**
 * Options for constructing an {@link OperationError} from a message and operation state.
 */
export interface OperationErrorMessageOptions {
  message: string;
  state: "canceled" | "failed";
}

/**
 * Options for constructing an {@link OperationError} from an underlying cause and operation state.
 */
export interface OperationErrorCauseOptions extends ErrorOptions {
  state: "canceled" | "failed";
}

/**
 * Options for constructing an {@link OperationError} from either a message or an underlying cause.
 */
export type OperationErrorOptions =
  | OperationErrorMessageOptions
  | OperationErrorCauseOptions;

/**
 * An error that represents "failed" and "canceled" operation results.
 */
export class OperationError extends Error {
  /** State of the operation. */
  public readonly state: "canceled" | "failed";

  constructor(options: OperationErrorOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super((options as any).message, options as any as ErrorOptions);
    this.state = options.state;
  }
}

/**
 * Link contains an URL and a Type that can be used to decode the URL.
 * Links can contain any arbitrary information as a percent-encoded URL.
 * It can be used to pass information about the caller to the handler, or vice-versa.
 */
export interface Link {
  /** URL information about the link. It must be URL percent-encoded. */
  url: URL;
  /**
   * Type can describe an actual data type for decoding the URL.
   * Valid chars: alphanumeric, '_', '.', '/'
   */
  type: string;
}
