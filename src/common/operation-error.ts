import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";

/**
 * Options for constructing an {@link OperationError} from a message and operation state.
 */
export interface OperationErrorMessageOptions {
  /** Error message. */
  message: string;

  /** State of the operation. */
  state: "canceled" | "failed";
}

/**
 * Options for constructing an {@link OperationError} from an underlying cause and operation state.
 */
export interface OperationErrorCauseOptions extends ErrorOptions {
  /** State of the operation. */
  state: "canceled" | "failed";
}

/**
 * Options for constructing an {@link OperationError} from either a message or an underlying cause.
 */
export type OperationErrorOptions = OperationErrorMessageOptions | OperationErrorCauseOptions;

/**
 * An error that represents "failed" and "canceled" operation results.
 */
export class OperationError extends Error {
  /** State of the operation. */
  public readonly state: "canceled" | "failed";

  constructor(options: OperationErrorOptions) {
    super((options as any).message, options as any as ErrorOptions);
    this.state = options.state;
  }
}

injectSymbolBasedInstanceOf(OperationError, "OperationError");
