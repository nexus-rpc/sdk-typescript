import { OperationInfo } from "../common";
import { HandlerStartOperationResult } from "./start-operation-result";
import {
  CancelOperationContext,
  GetOperationInfoContext,
  GetOperationResultContext,
  StartOperationContext,
} from "./operation-context";

/**
 * A handler for an operation.
 *
 * @experimental
 */
export interface OperationHandler<I, O> {
  /**
   * Handles requests for starting an operation.
   *
   * Return {@link HandlerStartOperationResultSync} to respond successfully - inline, or
   * {@link HandlerStartOperationResultAsync} to indicate that an asynchronous operation was started. Throw a
   * {@link OperationError} to indicate that an operation completed as failed or canceled.
   */
  start(ctx: StartOperationContext, input: I): Promise<HandlerStartOperationResult<O>>;

  /**
   * Handles requests to get the result of an asynchronous operation. Return non error result to respond successfully -
   * inline, or error with {@link OperationStillRunningError} to indicate that an asynchronous operation is still
   * running.
   *
   * Throw an {@link OperationError} to indicate that an operation completed as failed or canceled.
   *
   * When {@link GetOperationResultContext.timeoutMs | timeoutMs} is greater than zero, this request should be treated
   * as a long poll. Note that the specified wait duration may be longer than the configured client or server side
   * request timeout, and should be handled separately.
   *
   * It is the implementor's responsiblity to respect the client's wait duration and return in a timely fashion, leaving
   * enough time for the request to complete and the response to be sent back.
   */
  getResult(ctx: GetOperationResultContext, token: string): Promise<O>;

  /**
   * GetInfo handles requests to get information about an asynchronous operation.
   */
  getInfo(ctx: GetOperationInfoContext, token: string): Promise<OperationInfo>;

  /**
   * Handles requests to cancel an asynchronous operation.
   *
   * Cancelation in Nexus is:
   * 1. asynchronous - returning from this method only ensures that cancelation is delivered, it may later be
   * ignored by the underlying operation implemention.
   * 2. idempotent - implementors should ignore duplicate cancelations for the same operation.
   */
  cancel(ctx: CancelOperationContext, token: string): Promise<void>;
}

/**
 * A shortcut for defining an operation handler that only implements the {@link OperationHandler.start} method and
 * always returns a {@link HandlerStartOperationResultSync}.
 *
 * @experimental
 */
export type SyncOperationHandler<I, O> = (ctx: StartOperationContext, input: I) => Promise<O>;
