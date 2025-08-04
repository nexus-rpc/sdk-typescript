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
   * Handle requests to start an operation.
   *
   * Return {@link HandlerStartOperationResultSync} to respond successfully inline, or
   * {@link HandlerStartOperationResultAsync} to indicate that an asynchronous operation was started.
   * Throw an {@link OperationError} to indicate that an operation completed as failed or canceled.
   */
  start(ctx: StartOperationContext, input: I): Promise<HandlerStartOperationResult<O>>;

  /**
   * Handle requests to get information about an asynchronous operation.
   */
  getInfo(ctx: GetOperationInfoContext, token: string): Promise<OperationInfo>;

  /**
   * Handle requests to get the result of an asynchronous operation. Return non error result to
   * respond successfully inline, or throw an {@link OperationStillRunningError} to indicate that an
   * asynchronous operation is still running.
   *
   * Throw an {@link OperationError} to indicate that an operation completed as failed or canceled.
   *
   * When {@link GetOperationResultContext.timeoutMs | timeoutMs} is greater than zero, this request
   * should be treated as a long poll. Note that the specified wait duration may be longer than the
   * configured client or server side request timeout, and should be handled separately.
   *
   * It is the implementor's responsibility to respect the client's timeout duration and return in a
   * timely fashion, leaving enough time for the request to complete and the response to be sent
   * back.
   */
  getResult(ctx: GetOperationResultContext, token: string): Promise<O>;

  /**
   * Handle requests to cancel an asynchronous operation.
   *
   * Cancelation of a Nexus operation is:
   * 1. _asynchronous_ - returning from this method only confirms that cancelation was notified;
   *    the implementation may however choose to process the cancellation at a later time, or to
   *    ignore it entirely.
   * 2. _idempotent_ - implementations must ignore duplicate cancelations for the same operation.
   */
  cancel(ctx: CancelOperationContext, token: string): Promise<void>;
}

/**
 * A shortcut for defining an operation handler that only implements the {@link OperationHandler.start}
 * method and always returns a {@link HandlerStartOperationResultSync}.
 *
 * @experimental
 */
export type SyncOperationHandler<I, O> = (ctx: StartOperationContext, input: I) => Promise<O>;
