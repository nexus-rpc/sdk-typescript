import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as nexus from "../index";

class Box {
  constructor(readonly value: bigint) {}
}

const boxTypeInfo: nexus.TypeInfo<Box, string> = {
  transferTypeConverter: {
    fromTransferType: (value) => new Box(BigInt(value)),
    toTransferType: (value) => value.value.toString(),
  },
};

const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<Box, Box>({
    name: "custom name",
    inputType: boxTypeInfo,
    outputType: boxTypeInfo,
  }),
});

describe("service and operation", () => {
  it("defines operation input and output type information", () => {
    assert.strictEqual(myService.operations.fullOp.inputType, boxTypeInfo);
    assert.strictEqual(myService.operations.fullOp.outputType, boxTypeInfo);
  });

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
      /TypeError: Duplicate operation definition for name: 'syncOp'/,
    );
  });
});

describe("Mapped type `OperationKey`", () => {
  it("infers operation keys", () => {
    type Actual = nexus.OperationKey<(typeof myService)["operations"]>;
    type Expected = "syncOp" | "fullOp";
    somethingOfType<Actual>() satisfies Expected;
    somethingOfType<Expected>() satisfies Actual;
  });
});

describe("Mapped type `OperationInput`", () => {
  it("infers operation input type", () => {
    {
      type Actual = nexus.OperationInput<(typeof myService)["operations"]["syncOp"]>;
      type Expected = string;
      somethingOfType<Actual>() satisfies Expected;
      somethingOfType<Expected>() satisfies Actual;
    }
    {
      type Actual = nexus.OperationInput<(typeof myService)["operations"]["fullOp"]>;
      type Expected = Box;
      somethingOfType<Actual>() satisfies Expected;
      somethingOfType<Expected>() satisfies Actual;
    }
  });
});

describe("Mapped type `OperationOutput`", () => {
  it("infers operation Output type", () => {
    {
      type Actual = nexus.OperationOutput<(typeof myService)["operations"]["syncOp"]>;
      type Expected = string;
      somethingOfType<Actual>() satisfies Expected;
      somethingOfType<Expected>() satisfies Actual;
    }
    {
      type Actual = nexus.OperationOutput<(typeof myService)["operations"]["fullOp"]>;
      type Expected = Box;
      somethingOfType<Actual>() satisfies Expected;
      somethingOfType<Expected>() satisfies Actual;
    }
  });
});

/**
 * A utility function that pretends to return something of type `T`.
 *
 * This is meant to be used to simplify writing TypeScript type assertion tests.
 *
 * For example, to test that a given type evaluates exactly to the expected type, one can do:
 *
 * ```ts
 *   {
 *     type Actual = nexus.OperationKey<(typeof myService)["operations"]>;
 *     type Expected = "syncOp" | "fullOp";
 *     somethingOfType<Actual>() satisfies Expected;
 *     somethingOfType<Expected>() satisfies Actual;
 *   }
 * ```
 *
 * If the types are not assignable, TypeScript will produce a compile-time error.
 */
export function somethingOfType<T>(): T {
  return undefined as unknown as T;
}
