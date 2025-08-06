import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as nexus from "../index";

const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<number, number>({ name: "custom name" }),
});

const myServiceOpsHandler: nexus.ServiceHandlerFor<(typeof myService)["operations"]> = {
  syncOp: async (_ctx, input) => {
    return input;
  },
  fullOp: {
    async start(_ctx, input) {
      return nexus.HandlerStartOperationResult.sync(input);
    },
    async cancel(_ctx, _token) {
      //
    },
    async getInfo(_ctx, token) {
      return { token, state: "running" };
    },
    async getResult(_ctx, _token) {
      return 3;
    },
  },
} as const;

const myServiceHandler = nexus.serviceHandler(myService, myServiceOpsHandler);

describe("ServiceRegistry", () => {
  const registry = nexus.ServiceRegistry.create([myServiceHandler]);

  const mkStartCtx = (service: string, operation: string): nexus.StartOperationContext => ({
    service,
    operation,
    abortSignal: new AbortController().signal,
    headers: {},
    inboundLinks: [{ type: "test", url: new URL("http://test") }],
    outboundLinks: [],
    requestId: "test-req-id",
  });

  it("throws when trying to register a duplicate service handler", () => {
    assert.throws(
      () => nexus.ServiceRegistry.create([myServiceHandler, myServiceHandler]),
      /TypeError: Duplicate registration of nexus service 'service name'/,
    );
  });

  it("throws when registering a service with some missing operation handlers", () => {
    assert.throws(
      () =>
        nexus.serviceHandler(myService, {
          syncOp: myServiceOpsHandler.syncOp,
          // Intentionally missing 'fullOp'
        } as any),
      /TypeError: No handler registered for operation 'custom name'/,
    );
  });

  it("throws when registering missing a operation handler", () => {
    assert.throws(
      () =>
        nexus.serviceHandler(myService, {
          ...myServiceOpsHandler,
          syncOp: {} as any,
        }),
      /TypeError: Handler for operation 'syncOp' has no start method/,
    );
  });

  it("throws a not found error if a service or operation is not registered", async () => {
    await assert.rejects(
      () => registry.start(mkStartCtx("non existing service", "dontCare"), createLazyValue("test")),
      /HandlerError: No service handler registered for service name 'non existing service'/,
    );

    await assert.rejects(
      () => registry.start(mkStartCtx("service name", "notFound"), createLazyValue("test")),
      /HandlerError: Operation handler not registered/,
    );
  });

  it("routes start to the correct handler", async () => {
    assert.deepEqual(
      await registry.start(mkStartCtx("service name", "syncOp"), createLazyValue("test")),
      nexus.HandlerStartOperationResult.sync("test"),
    );
    assert.deepEqual(
      await registry.start(mkStartCtx("service name", "custom name"), createLazyValue(1)),
      nexus.HandlerStartOperationResult.sync(1),
    );
  });

  it("routes getResult to the correct handler", async () => {
    const ctx = {
      service: "service name",
      operation: "syncOp",
      abortSignal: new AbortController().signal,
      headers: {},
      timeoutMs: 0,
    };
    assert.rejects(() => registry.getResult(ctx, "token"), /HandlerError: Not implemented/);
    ctx.operation = "custom name";
    assert.equal(await registry.getResult(ctx, "token"), 3);
  });

  it("routes getInfo to the correct handler", async () => {
    const ctx = {
      service: "service name",
      operation: "syncOp",
      abortSignal: new AbortController().signal,
      headers: {},
    };
    assert.rejects(() => registry.getInfo(ctx, "token"), /HandlerError: Not implemented/);
    ctx.operation = "custom name";
    assert.deepEqual(await registry.getInfo(ctx, "token"), {
      token: "token",
      state: "running",
    });
  });

  it("routes cancel to the correct handler", async () => {
    const ctx = {
      service: "service name",
      operation: "syncOp",
      abortSignal: new AbortController().signal,
      headers: {},
    };
    assert.rejects(() => registry.cancel(ctx, "token"), /HandlerError: Not implemented/);
    ctx.operation = "custom name";
    assert.equal(await registry.cancel(ctx, "token"), undefined);
  });
});

function createLazyValue(value: unknown): nexus.LazyValue {
  return new nexus.LazyValue(
    {
      deserialize() {
        return value as any;
      },
      serialize() {
        throw new Error("Not implemented");
      },
    },
    {},
  );
}
