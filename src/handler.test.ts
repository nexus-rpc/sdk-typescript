import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as nexus from "./index";

const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<number, number>({ name: "custom name" }),
});

const myServiceHandler = nexus.serviceHandler(myService, {
  async syncOp(_ctx, input) {
    return input;
  },
  fullOp: {
    async start(_ctx, input) {
      return { value: input };
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
});

describe("serviceHandler", () => {
  class MyServiceHandler implements nexus.ServiceHandlerFor<(typeof myService)["operations"]> {
    async syncOp(_ctx: nexus.StartOperationContext, input: string): Promise<string> {
      return input;
    }
    fullOp: nexus.OperationHandler<number, number> = {
      async start(_ctx, input) {
        return { value: input };
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
    };
  }

  it("works with a class", () => {
    const handler = new MyServiceHandler();
    const serviceHandler = nexus.serviceHandler(myService, handler);
    assert.equal(serviceHandler.operations.syncOp.name, "syncOp");
    assert.equal(serviceHandler.operations.fullOp.name, "custom name");
  });
});

describe("ServiceRegistry", () => {
  const registry = new nexus.ServiceRegistry([myServiceHandler]);
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
      () => new nexus.ServiceRegistry([myServiceHandler, myServiceHandler]),
      /TypeError: Duplicate registration of nexus service service name/,
    );
  });

  it("throws when registering a duplicate operation", () => {
    const handler = {
      ...myServiceHandler,
      operations: { ...myServiceHandler.operations, syncOpAlias: { name: "syncOp" } },
    };
    assert.throws(
      () => new nexus.ServiceRegistry([handler as any]), // TS rejects this, but we want to test the runtime error.
      /TypeError: Operation with name syncOp already registered for service service name/,
    );
  });

  it("throws when registering missing a operation handler", () => {
    const handler = {
      ...myServiceHandler,
      handlers: { syncOp: {} },
    };
    assert.throws(
      () => new nexus.ServiceRegistry([handler as any]), // TS rejects this, but we want to test the runtime error.
      /TypeError: No handler registered for fullOp on service service name/,
    );
  });

  it("throws a not found error if a service or operation is not registered", async () => {
    await assert.rejects(
      () => registry.start(mkStartCtx("non existing service", "dontCare"), createLazyValue("test")),
      /HandlerError: Service handler not registered/,
    );

    await assert.rejects(
      () => registry.start(mkStartCtx("service name", "notFound"), createLazyValue("test")),
      /HandlerError: Operation handler not registered/,
    );
  });

  it("routes start to the correct handler", async () => {
    assert.deepEqual(
      await registry.start(mkStartCtx("service name", "syncOp"), createLazyValue("test")),
      {
        value: "test",
      },
    );
    assert.deepEqual(
      await registry.start(mkStartCtx("service name", "custom name"), createLazyValue(1)),
      {
        value: 1,
      },
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
