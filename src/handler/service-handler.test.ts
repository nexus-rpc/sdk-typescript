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

describe("ServiceHandler", () => {
  class MyServiceHandler implements nexus.ServiceHandlerFor<(typeof myService)["operations"]> {
    async syncOp(_ctx: nexus.StartOperationContext, input: string): Promise<string> {
      return input;
    }
    fullOp: nexus.OperationHandler<number, number> = {
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
    };
  }

  it("Can be constructed with a plain object", () => {
    const serviceHandler = nexus.serviceHandler(myService, myServiceOpsHandler);
    assert.equal(serviceHandler.getOperationHandler("syncOp").name, "syncOp");
    assert.equal(serviceHandler.getOperationHandler("custom name" as any).name, "custom name");
  });

  it("Can be constructed with a class", () => {
    const handler = new MyServiceHandler();
    const serviceHandler = nexus.serviceHandler(myService, handler);
    assert.equal(serviceHandler.getOperationHandler("syncOp").name, "syncOp");
    assert.equal(serviceHandler.getOperationHandler("custom name" as any).name, "custom name");
  });
});
