import { OperationInfo } from "../common";
import {
  CancelOperationContext,
  GetOperationInfoContext,
  GetOperationResultContext,
  StartOperationContext,
} from "./operation-context";
import { HandlerStartOperationResult } from "./start-operation-result";

/**
 * @experimental
 */
// Can't be an interface because of the optional methods
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type OperationMiddleware = {
  /**
   * Intercept incoming requests to start an operation.
   *
   * @see {@link OperationHandler.start}
   */
  start?(
    ctx: StartOperationContext,
    input: unknown,
    next: Next<OperationMiddleware, "start">,
  ): Promise<HandlerStartOperationResult<unknown>>;

  /**
   * Intercept incoming requests to get information about an asynchronous operation.
   *
   * @see {@link OperationHandler.getInfo}
   */
  getInfo(
    ctx: GetOperationInfoContext,
    token: string,
    next: Next<OperationMiddleware, "getInfo">,
  ): Promise<OperationInfo>;

  /**
   * Intercept incoming requests to get the result of an asynchronous operation.
   *
   * @see {@link OperationHandler.getResult}
   */
  getResult(
    ctx: GetOperationResultContext,
    token: string,
    next: Next<OperationMiddleware, "getResult">,
  ): Promise<unknown>;

  /**
   * Intercept incoming requests to cancel an asynchronous operation.
   *
   * @see {@link OperationHandler.cancel}
   */
  cancel?(
    ctx: CancelOperationContext,
    token: string,
    next: Next<OperationMiddleware, "cancel">,
  ): Promise<void>;
};

/**
 * Compose a chain of middleware methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param middlewares a list of middlewares
 * @param method the name of the middleware method to compose
 * @param next the original function to be executed at the end of the middleware chain
 *
 * @internal
 * @hidden
 */
export function composeMiddlewares<I extends Record<string, AnyFunc>, M extends keyof I>(
  middlewares: I[],
  method: M,
  next: Next<I, M>,
): Next<I, M> {
  for (let i = middlewares.length - 1; i >= 0; --i) {
    const middleware = middlewares[i];
    if (middleware[method] !== undefined) {
      const self = middleware[method];
      const prev = next;
      next = ((...input: OmitLast<Parameters<I[M]>>) => self(...input, prev)) as any;
    }
  }
  return next;
}

/** Shorthand alias */
export type AnyFunc = (...args: any[]) => any;

/** A tuple without its last element */
export type OmitLast<T> = T extends [...infer REST, any] ? REST : never;

/** F with all arguments but the last */
export type OmitLastParam<F extends AnyFunc> = (...args: OmitLast<Parameters<F>>) => ReturnType<F>;

/**
 * Type of the next function for a given interceptor function
 *
 * Called from an interceptor to continue the interception chain
 */
export type Next<IF, FN extends keyof IF> = Required<IF>[FN] extends AnyFunc
  ? OmitLastParam<Required<IF>[FN]>
  : never;
