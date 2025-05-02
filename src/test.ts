import * as nexus from "./index";
import * as assert from "node:assert/strict";

export const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<number, number>({ name: "custom name" }),
});

export const myServiceHandler = nexus.serviceHandler(myService, {
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

const c1 = createNexusClient({ endpoint: "foo", service: myService });
const c2 = createNexusClient({ endpoint: "foo", service: nexus.serviceHandler(myService, new MyServiceHandler()) });
for (const c of [c1, c2]) {
  const o1: Promise<string> = c.executeOperation("syncOp", "foo");
  const o2: Promise<number> = c.executeOperation("fullOp", 3);
  Promise.all([o1, o2]);
}

registerService(myServiceHandler);

//// Helper functions for type assertion.

export interface NexusClient<T extends nexus.Service> {
  executeOperation<K extends nexus.OperationKey<T["operations"]>>(
    op: K,
    input: nexus.OperationInput<T["operations"], K>,
  ): Promise<nexus.OperationOutput<T["operations"], K>>;
}

interface NexusClientOptions<T> {
  endpoint: string;
  service: T;
}

function createNexusClient<T extends nexus.Service>(options: NexusClientOptions<T>): NexusClient<T> {
  assert.equal(options.service.name, "service name");
  assert.deepEqual(options.service.operations, { syncOp: { name: "syncOp" }, fullOp: { name: "custom name" } });
  return {
    executeOperation: async () => {
      // Simulate an operation execution
      return {} as any;
    },
  };
}

function registerService<T extends nexus.ServiceHandler<any>>(service: T): void {
  assert.deepEqual(Object.keys(service.operations), ["syncOp", "fullOp"]);
  assert.deepEqual(Object.keys(service.handlers), ["syncOp", "fullOp"]);
  // Register the service
}
