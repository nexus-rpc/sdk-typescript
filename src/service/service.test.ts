import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as nexus from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<number, number>({ name: "custom name" }),
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
    assert.throws(
      () => nexus.service("", {}),
      /TypeError: Service name must be a non-empty string/,
    );
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
