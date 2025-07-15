/** A representation of the variable states of an operation. */
export type OperationState = "succeeded" | "failed" | "canceled" | "running";

/**
 * Information about an operation, the return type of {@link OperationHandler["getInfo"]}.
 */
export interface OperationInfo {
  /** Token for the operation. */
  token: string;

  /** State of the operation. */
  state: OperationState;
}
