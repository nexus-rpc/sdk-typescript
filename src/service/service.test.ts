import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as nexus from "../index";

class ApplicationInput {
  constructor(readonly value: bigint) {}
}

interface InputTransfer {
  value: string;
}

class ApplicationOutput {
  constructor(readonly value: bigint) {}
}

interface OutputTransfer {
  value: string;
}

const inputType = {
  transferTypeConverter: {
    fromTransferType: (value) => new ApplicationInput(BigInt(value.value)),
    toTransferType: (value) => ({ value: value.value.toString() }),
  },
} satisfies nexus.TypeInfo<ApplicationInput, InputTransfer>;

const outputType = {
  transferTypeConverter: {
    fromTransferType: (value) => new ApplicationOutput(BigInt(value.value)),
    toTransferType: (value) => ({ value: value.value.toString() }),
  },
} satisfies nexus.TypeInfo<ApplicationOutput, OutputTransfer>;

const toInputTransfer: (value: ApplicationInput) => InputTransfer =
  inputType.transferTypeConverter.toTransferType;
const fromInputTransfer: (value: InputTransfer) => ApplicationInput =
  inputType.transferTypeConverter.fromTransferType;
void toInputTransfer;
void fromInputTransfer;

const typeInfoForAnotherApplicationType = {
  transferTypeConverter: {
    fromTransferType: (value: string) => value,
    toTransferType: (value: string) => value,
  },
} satisfies nexus.TypeInfo<string>;

nexus.operation<ApplicationInput, ApplicationOutput>({
  // @ts-expect-error Type information must match the operation input type.
  inputType: typeInfoForAnotherApplicationType,
});

const myService = nexus.service("service name", {
  syncOp: nexus.operation<string, string>(),
  fullOp: nexus.operation<ApplicationInput, ApplicationOutput>({
    name: "custom name",
    inputType,
    outputType,
  }),
});

describe("service and operation", () => {
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
      type Expected = ApplicationInput;
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
      type Expected = ApplicationOutput;
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
