import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";

/**
 * An operation result was requested, but the operation is still running.
 *
 * @experimental
 */
export class OperationStillRunningError extends Error {
  constructor() {
    super("Operation still running");
  }
}

injectSymbolBasedInstanceOf(OperationStillRunningError, "OperationStillRunningError");
