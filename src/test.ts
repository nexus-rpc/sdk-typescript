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
  // Invoke via a string key.
  const _o1: Promise<string> = c.executeOperation("syncOp", "foo");
  const _o2: Promise<number> = c.executeOperation("fullOp", 3);

  // Invoke via an operation reference.
  const _o3: Promise<string> = c.executeOperation(myService.operations.syncOp, "foo");
  const _o4: Promise<number> = c.executeOperation(myService.operations.fullOp, 3);

  // We can't easily prevent this at compile time without unreasonably complicating the types, but we can at runtime.
  const myOtherService = nexus.service("other service", {
    otherOp: nexus.operation<number, number>(),
  });
  const _: Promise<number> = c.executeOperation(myOtherService.operations.otherOp, 3);
}

registerService(myServiceHandler);

//// Helper functions for type assertion.

export interface NexusClient<T extends nexus.Service> {
  executeOperation<O extends T["operations"][keyof T["operations"]]>(
    op: O,
    input: nexus.OperationInput<O>,
  ): Promise<nexus.OperationOutput<O>>;

  executeOperation<K extends nexus.OperationKey<T["operations"]>>(
    op: K,
    input: nexus.OperationInput<T["operations"][K]>,
  ): Promise<nexus.OperationOutput<T["operations"][K]>>;
}

interface NexusClientOptions<T> {
  endpoint: string;
  service: T;
}

export function createNexusClient<T extends nexus.Service>(options: NexusClientOptions<T>): NexusClient<T> {
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
