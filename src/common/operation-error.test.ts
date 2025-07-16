import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { OperationError } from "./index";

describe("OperationError", () => {
  // Important: Keep these in sync with the sample code on the OperationError class typedoc.
  it("Can be constructed using sample code", () => {
    {
      const error = new OperationError("failed", "Not enough inventory");

      assert.equal(error.message, "Not enough inventory");
      assert.equal(error.cause, undefined);
      assert.equal(error.state, "failed");
    }

    {
      const cause = new Error("Cause message");
      const error = new OperationError("failed", "Not enough inventory", { cause });

      assert.equal(error.message, "Not enough inventory");
      assert.deepEqual(error.cause, new Error("Cause message"));
      assert.equal(error.state, "failed");
    }

    {
      const error = new OperationError("canceled", "User canceled the operation");

      assert.equal(error.message, "User canceled the operation");
      assert.equal(error.cause, undefined);
      assert.equal(error.state, "canceled");
    }
  });

  it("Properly handles all combinations of message and cause", () => {
    {
      // Use the default message if neither `message` nor `cause` is provided (canceled)
      const error = new OperationError("canceled");
      assert.equal(error.message, "Operation canceled");
      assert.equal(error.cause, undefined);
    }

    {
      // Use the default message if neither `message` nor `cause` is provided (failed)
      const error = new OperationError("failed");
      assert.equal(error.message, "Operation failed");
      assert.equal(error.cause, undefined);
    }

    {
      // Accept only `message`
      const error = new OperationError("failed", "Error message");
      assert.equal(error.message, "Error message");
      assert.equal(error.cause, undefined);
    }

    {
      // Accept only `cause`
      const cause = new Error("Service unavailable");
      const error = new OperationError("failed", undefined, { cause });

      assert.equal(error.message, "Operation failed");
      assert.deepEqual(error.cause, cause);
    }

    {
      // Accept both `message` and `cause`.
      const cause = new Error("Service unavailable");
      const error = new OperationError("failed", "Error message", { cause });

      assert.equal(error.message, "Error message");
      assert.deepEqual(error.cause, cause);
    }
  });

  it("Requires valid state", () => {
    // @ts-expect-error - Argument ... is not assignable to type ...
    new OperationError(undefined, "x");

    // @ts-expect-error - Argument ... is not assignable to type ...
    new OperationError("invalid", "x");
  });
});
