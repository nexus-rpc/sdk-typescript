import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";
import type { Failure } from "./failure";

/**
 * A Nexus handler error.
 *
 * This error class represents an error that occurred during the handling of a
 * Nexus operation that should be reported to the caller as a handler error.
 *
 * Example:
 *
 * ```ts
 *     import { HandlerError, HandlerErrorType } from "nexus-rpc";
 *
 *     // Throw a bad request error
 *     throw new HandlerError("BAD_REQUEST", "Invalid input provided");
 *
 *     // Throw a bad request error, with a cause
 *     throw new HandlerError("BAD_REQUEST", "Invalid input provided", { cause });
 *
 *     // Throw a retryable internal error
 *     throw new HandlerError("INTERNAL", "Database unavailable", { retryableOverride: true });
 *
 *     // Construct from a wire type (including unknown types)
 *     const error = HandlerError.fromWire("CUSTOM_TYPE", "Wire error", {
 *       stackTrace: "at foo:1\nat bar:2",
 *       originalFailure: { message: "original error" },
 *     });
 *     console.log(error.type);         // "UNKNOWN"
 *     console.log(error.rawErrorType); // "CUSTOM_TYPE"
 *     // The remote stack trace is accessible via the native `.stack` property.
 * ```
 *
 * @experimental
 */
export class HandlerError extends Error {
  /**
   * One of the predefined error types.
   *
   * If the constructor received an unknown string, this will be `"UNKNOWN"`.
   * Use {@link rawErrorType} to access the original string.
   *
   * @see {@link HandlerErrorType}
   */
  public readonly type: HandlerErrorType;

  /**
   * The original error type string passed to the constructor.
   *
   * For known types, this equals {@link type}. For unknown types, this preserves
   * the original wire string while {@link type} is set to `"UNKNOWN"`.
   */
  public readonly rawErrorType: string;

  /**
   * Whether this error should be considered retryable.
   *
   * By default, the retry behavior is determined from the error type.
   * For example, by default, `INTERNAL` is retryable, but `UNAVAILABLE` is non-retryable.
   *
   * If specified, `retryableOverride` overrides the default retry behavior determined based on
   * the error type. Use {@link retryable} to determine the effective retry behavior.
   *
   * @see {@link retryable}.
   */
  public readonly retryableOverride: boolean | undefined;

  /**
   * Set if this error was constructed from a {@link Failure} object.
   *
   * Preserves the original failure for round-tripping through the wire format.
   */
  public readonly originalFailure: Failure | undefined;

  /**
   * Constructs a new {@link HandlerError}.
   *
   * @param type - The type of the error. Must be a known {@link HandlerErrorType}.
   *   To construct from an arbitrary wire type string, use {@link HandlerError.fromWire}.
   * @param message - The message of the error.
   * @param options - Extra options for the error, including the cause and retryable override.
   *
   * @experimental
   */
  constructor(type: HandlerErrorType, message?: string | undefined, options?: HandlerErrorOptions) {
    const actualMessage = message || `Handler error: ${type}`;

    super(actualMessage, { cause: options?.cause });

    this.type = type;
    this.rawErrorType = options?.rawErrorType ?? type;
    this.retryableOverride = options?.retryableOverride;
    this.originalFailure = options?.originalFailure;
    if (options?.stackTrace !== undefined) {
      this.stack = options.stackTrace;
    }
  }

  /**
   * Constructs a {@link HandlerError} from an arbitrary wire type string.
   *
   * If the string matches a known {@link HandlerErrorType}, the error's {@link type} will be set
   * to that value. Otherwise, {@link type} will be set to `"UNKNOWN"`.
   * The original string is always preserved in {@link rawErrorType}.
   *
   * @param type - The error type string received over the wire.
   * @param message - The message of the error.
   * @param options - Extra options for the error, including wire-specific fields like
   *   {@link HandlerErrorOptions.stackTrace | stackTrace} and
   *   {@link HandlerErrorOptions.originalFailure | originalFailure}.
   *
   * @experimental
   */
  static fromWire(
    type: string,
    message?: string | undefined,
    options?: HandlerErrorOptions,
  ): HandlerError {
    const resolvedType = type in HandlerErrorType
      ? (type as HandlerErrorType)
      : HandlerErrorType.UNKNOWN;

    return new HandlerError(resolvedType, message, {
      ...options,
      rawErrorType: type,
    });
  }

  /**
   * Whether this error is retryable.
   *
   * This differs from the {@link retryableOverride} property in that `retryable` takes into
   * account the default behavior resulting from the error type, if no override is provided.
   *
   * @see {@link retryableOverride}.
   */
  public get retryable(): boolean {
    if (typeof this.retryableOverride === "boolean") return this.retryableOverride;

    switch (this.type) {
      case "BAD_REQUEST":
      case "UNAUTHENTICATED":
      case "UNAUTHORIZED":
      case "NOT_FOUND":
      case "NOT_IMPLEMENTED":
      case "CONFLICT":
        return false;

      case "UNAVAILABLE":
      case "UPSTREAM_TIMEOUT":
      case "RESOURCE_EXHAUSTED":
      case "INTERNAL":
      case "REQUEST_TIMEOUT":
      case "UNKNOWN":
        return true;

      default: {
        // Force a compile time error if missing a case
        const _noMissingCase: never = this.type;
        return true;
      }
    }
  }
}

injectSymbolBasedInstanceOf(HandlerError, "HandlerError");

/**
 * Options for constructing a {@link HandlerError}.
 *
 * @experimental
 * @inline
 */
export interface HandlerErrorOptions {
  /**
   * Underlying cause of the error.
   */
  cause?: unknown;

  /**
   * Whether this error should be considered retryable.
   *
   * If not set, the retry behavior is determined from the error type.
   * For example, by default, `INTERNAL` is retryable, but `UNAVAILABLE` is non-retryable.
   */
  retryableOverride?: boolean | undefined;

  /**
   * An optional stack trace string associated with this error.
   *
   * When provided, this overrides the native `stack` property on the error.
   * This is typically used for remote stack traces received over the wire,
   * which may originate from a different language runtime.
   */
  stackTrace?: string;

  /**
   * An optional {@link Failure} object from which this error was constructed.
   *
   * Preserves the original failure for round-tripping through the wire format.
   */
  originalFailure?: Failure;

  /**
   * The original error type string, preserving the raw wire value.
   *
   * For known types, this defaults to the {@link HandlerErrorType} value.
   * For unknown types received via {@link HandlerError.fromWire}, this preserves
   * the original wire string while the error's type is set to `"UNKNOWN"`.
   */
  rawErrorType?: string;
}

/**
 * An error type associated with a {@link HandlerError}, defined according to the Nexus specification.
 *
 * @experimental
 */
export type HandlerErrorType = (typeof HandlerErrorType)[keyof typeof HandlerErrorType];
export const HandlerErrorType = {
  /**
   * The error type is unknown.
   *
   * Subsequent requests by the client are permissible.
   */
  UNKNOWN: "UNKNOWN",

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
   * Returned by the server when it has given up handling a request. This may occur by enforcing
   * a client provided `Request-Timeout` or for any arbitrary reason such as enforcing some
   * configurable limit.
   *
   * Subsequent requests by the client are permissible.
   */
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",

  /**
   * The request could not be made due to a conflict. This may happen when trying to create an
   * operation that has already been started.
   *
   * Clients should not retry this request unless advised otherwise.
   */
  CONFLICT: "CONFLICT",

  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system
   * is out of space.
   *
   * Subsequent requests by the client are permissible.
   */
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED",

  /**
   * An internal error occurred.
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
