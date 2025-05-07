import * as handler from "./handler";

// Make it safe to use nexus-rpc with multiple versions installed.
// Caching the promise prevents duplicate loading.
export const asyncLocalStoragePromiseSymbol = Symbol.for("__nexus_async_local_storage_promise__");

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
    const { AsyncLocalStorage } = await import("node:async_hooks");
    handler.installContextStorage(new AsyncLocalStorage());
  })();
}
