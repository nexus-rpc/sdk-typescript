import { Link } from "./api";

export interface ContextStorage {
  getStore(): HandlerContext | undefined;
  run<T>(ctx: HandlerContext, fn: () => Promise<T>): Promise<T>;
}

/**
 * Contains general information for an operation invocation, across different handler methods.
 */
export interface HandlerInfo {
  /** Name of the service that contains the operation. */
  service: string;
  /** Name of the operation. */
  operation: string;
  /** Request header fields received by the server. */
  headers: Record<string, string>;
  /** Signaled when the current request is canceled. */
  abortSignal: AbortSignal;
}

/**
 * Internal handler context for use in framework implementations.
 */
export interface HandlerContext {
  info: HandlerInfo;
  links: Link[];
}

// Set to undefined to support importing the SDK without access to node:async_hooks for browsers and sandboxed
// environments.
export let contextStorage: ContextStorage | undefined = undefined;

/**
 * Install a ContextStorage instance for use in handler contexts.
 *
 * Not meant to be called by framework implementations. Frameworks should use `installAsyncLocalStorage` from
 * `nexus-rpc/lib/async-local-storage`.
 *
 * @internal
 */
export async function installContextStorage(als: ContextStorage) {
  contextStorage = als;
}

/**
 * Get the associated handler context for the current async context.
 *
 * Meant to be called by frameworks, not handler implementations.
 */
export function getHandlerContext<T extends HandlerContext = HandlerContext>(): T {
  if (contextStorage == null) {
    throw new ReferenceError("ContextStorage uninitialized");
  }
  const context = contextStorage.getStore();
  if (context == null) {
    throw new ReferenceError("HandlerContext uninitialized");
  }
  return context as T;
}

/**
 * Runs the given funtion in a context where the given HandlerContext instance is available.
 *
 * Meant to be called by frameworks, not handler implementations.
 */
export async function withContext<T extends HandlerContext, R>(context: T, fn: () => Promise<R>): Promise<R> {
  if (contextStorage == null) {
    throw new ReferenceError("ContextStorage uninitialized");
  }
  return await contextStorage.run(context, fn);
}

/**
 * Returns true if the current context is a handler context where {@link extractHandlerInfo} and {@link handlerLinks} can be called.
 * It returns true when called from any OperationHandler method or middleware.
 */
export function inHandlerContext(): boolean {
  return contextStorage?.getStore() != null;
}

/**
 * Extracts the {@link HandlerInfo} for the current request's context.
 *
 * Must be called within a handler method or middleware function or this method will throw a {@link ReferenceError}.
 * {@link inHandlerContext} can be used to verify the context is valid.
 */
export function extractHandlerInfo(): HandlerInfo {
  return getHandlerContext().info;
}

/**
 * Gets the links associated with the current operation to be propagated back to the caller.
 *
 * The returned array is safe to mutate for attaching links.
 * Links are only attached on successful invocations of the `OperationHandler.start` method.
 * Must be called within a handler method or middleware function or this method will throw a {@link ReferenceError}.
 * {@link inHandlerContext} can be used to verify the context is valid.
 */
export function handlerLinks(): Link[] {
  return getHandlerContext().links;
}
