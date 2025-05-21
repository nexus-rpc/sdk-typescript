import { it, describe } from "node:test";
import * as nexus from "./index";
import * as assert from "node:assert/strict";

const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<number, number>({ name: "custom name" }),
});

const myServiceHandler = nexus.serviceHandler(myService, {
  async syncOp(input: string, _options: nexus.StartOperationOptions): Promise<string> {
    return input;
  },
  fullOp: {
    async start(input: number, _options) {
      return { value: input };
    },
    async cancel(_token, _options) {
      //
    },
    async getInfo(token, _options) {
      return { token, state: "running" };
    },
    async getResult(_token, _options) {
      return 3;
    },
  },
});

describe("OperationKey", () => {
  it("infers operation keys", () => {
    const _k1: nexus.OperationKey<(typeof myService)["operations"]> = "syncOp";
    const _k2: nexus.OperationKey<(typeof myService)["operations"]> = "fullOp";
  });
});

describe("OperationInput", () => {
  it("infers operation input type", () => {
    const _i1: nexus.OperationInput<(typeof myService)["operations"]["syncOp"]> = "string";
    const _i2: nexus.OperationInput<(typeof myService)["operations"]["fullOp"]> = 1;
  });
});

describe("OperationOutput", () => {
  it("infers operation Output type", () => {
    const _o1: nexus.OperationOutput<(typeof myService)["operations"]["syncOp"]> = "string";
    const _o2: nexus.OperationOutput<(typeof myService)["operations"]["fullOp"]> = 1;
  });
});

describe("service", () => {
  it("throws when registering a service with an empty name", () => {
    assert.throws(() => nexus.service("", {}), /TypeError: Service name must be a non-empty string/);
  });
  it("throws when registering a duplicate operation", () => {
    assert.throws(
      () =>
        nexus.service("service name", {
          syncOp: nexus.operation<string, string>(),
          syncOpAlias: nexus.operation<string, string>({ name: "syncOp" }),
        }),
      /TypeError: Duplicate operation definition for syncOp/,
    );
  });
});

describe("serviceHandler", () => {
  class MyServiceHandler implements nexus.ServiceHandlerFor<(typeof myService)["operations"]> {
    async syncOp(input: string, _options: nexus.StartOperationOptions): Promise<string> {
      return input;
    }
    fullOp: nexus.OperationHandler<number, number> = {
      async start(input: number, _options) {
        return { value: input };
      },
      async cancel(_token, _options) {
        //
      },
      async getInfo(token, _options) {
        return { token, state: "running" };
      },
      async getResult(_token, _options) {
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
  const startOptions: nexus.StartOperationOptions = {
    abortSignal: new AbortController().signal,
    headers: {},
    links: [{ type: "test", url: new URL("http://test") }],
    requestId: "test-req-id",
  };

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
      () => registry.start("non existing service", "dontCare", createLazyValue("test"), startOptions),
      /HandlerError: Service handler not registered/,
    );

    await assert.rejects(
      () => registry.start("service name", "notFound", createLazyValue("test"), startOptions),
      /HandlerError: Operation handler not registered/,
    );
  });

  it("routes start to the correct handler", async () => {
    assert.deepEqual(await registry.start("service name", "syncOp", createLazyValue("test"), startOptions), {
      value: "test",
    });
    assert.deepEqual(await registry.start("service name", "custom name", createLazyValue(1), startOptions), {
      value: 1,
    });
  });

  it("routes getResult to the correct handler", async () => {
    const options = {
      abortSignal: new AbortController().signal,
      headers: {},
      wait: 0,
    };
    assert.rejects(
      () => registry.getResult("service name", "syncOp", "token", options),
      /HandlerError: Not implemented/,
    );
    assert.equal(await registry.getResult("service name", "custom name", "token", options), 3);
  });

  it("routes getInfo to the correct handler", async () => {
    const options = {
      abortSignal: new AbortController().signal,
      headers: {},
    };
    assert.rejects(() => registry.getInfo("service name", "syncOp", "token", options), /HandlerError: Not implemented/);
    assert.deepEqual(await registry.getInfo("service name", "custom name", "token", options), {
      token: "token",
      state: "running",
    });
  });

  it("routes cancel to the correct handler", async () => {
    const options = {
      abortSignal: new AbortController().signal,
      headers: {},
    };
    assert.rejects(() => registry.cancel("service name", "syncOp", "token", options), /HandlerError: Not implemented/);
    assert.equal(await registry.cancel("service name", "custom name", "token", options), undefined);
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
