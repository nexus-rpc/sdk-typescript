import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { OperationError } from "./index";

describe("OperationError", () => {
  it("Can be constructed", () => {
    const error = new OperationError({
      state: "failed",
      cause: new Error("Service unavailable"),
    });

    assert.equal(error.message, "Operation failed");
    assert.deepEqual(error.cause, new Error("Service unavailable"));
    assert.equal(error.state, "failed");
  });

  it("Requires cause", () => {
    assert.throws(
      () => {
        // @ts-expect-error - Property cause is missing ...
        new OperationError({ state: "failed" });
      },
      {
        name: "TypeError",
        message: "OperationError's cause is required and must be an object; got: 'undefined'",
      },
    );
  });

  it("Requires valid state", () => {
    assert.throws(
      () => {
        // @ts-expect-error - Property ... is missing in type ...
        new OperationError({ cause: new Error("Service unavailable") });
      },
      {
        name: "TypeError",
        message:
          "OperationError's state is required and must be either 'canceled' or 'failed'; got: 'undefined'",
      },
    );

    assert.throws(
      () => {
        // @ts-expect-error - Type ... is not assignable to type ...
        new OperationError({ cause: new Error("Service unavailable"), state: "invalid" });
      },
      {
        name: "TypeError",
        message:
          "OperationError's state is required and must be either 'canceled' or 'failed'; got: 'invalid'",
      },
    );
  });
});
