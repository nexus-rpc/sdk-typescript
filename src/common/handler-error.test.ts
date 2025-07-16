import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { HandlerError } from "./index";

describe("HandlerError", () => {
  // Important: Keep these in sync with the sample code on the HandlerError class typedoc.
  it("Can be constructed using sample code", () => {
    {
      const error = new HandlerError("BAD_REQUEST", "Invalid input provided");

      assert.equal(error.type, "BAD_REQUEST");
      assert.equal(error.message, "Invalid input provided");
      assert.equal(error.cause, undefined);
      assert.equal(error.retryableOverride, undefined);
      assert.equal(error.retryable, false);
    }

    {
      const cause = new Error("Cause message");
      const error = new HandlerError("BAD_REQUEST", "Invalid input provided", { cause });

      assert.equal(error.type, "BAD_REQUEST");
      assert.equal(error.message, "Invalid input provided: Cause message");
      assert.deepEqual(error.cause, cause);
      assert.equal(error.retryableOverride, undefined);
      assert.equal(error.retryable, false);
    }

    {
      const error = new HandlerError("INTERNAL", "Database unavailable", {
        retryableOverride: true,
      });

      assert.equal(error.type, "INTERNAL");
      assert.equal(error.message, "Database unavailable");
      assert.equal(error.cause, undefined);
      assert.equal(error.retryableOverride, true);
      assert.equal(error.retryable, true);
    }
  });

  it("Properly handles all combinations of message and cause", () => {
    // Use a default message if neither `message` nor `cause` is provided.
    let error = new HandlerError("UNAVAILABLE");
    assert.equal(error.message, "Handler error");

    // Accept only `message`
    error = new HandlerError("UNAVAILABLE", "Error message");
    assert.equal(error.message, "Error message");

    // Accept only `cause`
    error = new HandlerError("UNAVAILABLE", undefined, { cause: new Error("Cause message") });
    assert.equal(error.message, "Cause message");
    assert.equal((error.cause as Error).message, "Cause message");

    // Accept both `message` and `cause`, composing the HandlerError message from both.
    error = new HandlerError("UNAVAILABLE", "Error message", { cause: new Error("Cause message") });
    assert.equal(error.message, "Error message: Cause message");
    assert.equal((error.cause as Error).message, "Cause message");
  });

  it("Correctly compute retry behavior", () => {
    const retryableType = "UNAVAILABLE";
    const nonRetryableType = "BAD_REQUEST";

    let error = new HandlerError(retryableType, "x");
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, true);

    error = new HandlerError(nonRetryableType, "x");
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, false);

    error = new HandlerError(retryableType, "x", { retryableOverride: false });
    assert.equal(error.retryableOverride, false);
    assert.equal(error.retryable, false);

    error = new HandlerError(nonRetryableType, "x", { retryableOverride: true });
    assert.equal(error.retryableOverride, true);
    assert.equal(error.retryable, true);

    // Default to retryable if given an invalid error type. This is in line with all reference SDKs.
    error = new HandlerError("INVALID" as any, "x");
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, true);
  });
});
