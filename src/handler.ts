import { type AsyncLocalStorage } from 'node:async_hooks';
import { Link } from './api';

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
  /** Signaled when the current request is canceled.  */
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
let asyncLocalStorage: AsyncLocalStorage<HandlerContext> | undefined = undefined;

// Make it safe to use nexus-rpc with multiple versions installed.
// Caching the promise prevents duplicate loading.
const asyncLocalStoragePromiseSymbol = Symbol.for('__nexus_context_storage_promise__');

/**
 * Install an AsyncLocalStorage instance for use in handler contexts.
 *
 * Must be called by framework implementations at least once per process.
 * Idempotent and can be called multiple times.
 */
export async function installAsyncLocalStorage() {
  if ((globalThis as any)[asyncLocalStoragePromiseSymbol]) {
    return;
  }
  (globalThis as any)[asyncLocalStoragePromiseSymbol] = (async () => {
    const { AsyncLocalStorage } = await import('node:async_hooks');
    asyncLocalStorage = new AsyncLocalStorage();
  })();
}

/**
 * Get the asssociated handler context for the current async context.
 *
 * Meant to be called by frameworks, not handler implmentations.
 */
export function getHandlerContext<T extends HandlerContext = HandlerContext>(): T {
  if (asyncLocalStorage == null) {
    throw new ReferenceError('AsyncLocalStorage uninitialized');
  }
  const context = asyncLocalStorage.getStore();
  if (context == null) {
    throw new ReferenceError('HandlerContext uninitialized');
  }
  return context as T;
}

/**
 * Runs the given funtion in a context where the given HandlerContext instance is available.
 *
 * Meant to be called by frameworks, not handler implmentations.
 */
export async function withContext<T extends HandlerContext, R>(context: T, fn: () => Promise<R>): Promise<R> {
  if (asyncLocalStorage == null) {
    throw new ReferenceError('AsyncLocalStorage uninitialized');
  }
  return await asyncLocalStorage.run(context, fn);
}

/**
 * Returns true if the current context is a handler context where {@link extractHandlerInfo} and {@handlerLinks} can be called.
 * It returns true when called from any OperationHandler method or middleware.
 */
export function inHandlerContext(): boolean {
  return asyncLocalStorage?.getStore() != null
}

/**
 * Extracts the {@link HandlerInfo} for the current request's context.
 *
 * Must be called within a hanler method or middleware function or this method will throw a {@link ReferenceError}.
 * {@link inHandlerContext} can be used to verify the context is valid.
 */
export function extractHandlerInfo(): HandlerInfo {
  return getHandlerContext().info;
}

/**
 * Gets the links associated with the current operation to be propagated back to the caller.
 *
 * The returned array is safe to mutate for attaching links.
 * Links are only attached on successful responses to the StartOperation Handler method.
 * Must be called within a handler method or middleware function or this method will throw a {@link ReferenceError}.
 * {@link inHandlerContext} can be used to verify the context is valid.
 */
export function handlerLinks(): Link[] {
  return getHandlerContext().links;
}
