import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { HandlerError } from "./index";
import type { Failure } from "./index";

describe("HandlerError", () => {
  it("Can be constructed using sample code", () => {
    // Important: Keep these in sync with the sample code on the HandlerError class typedoc.
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
      assert.equal(error.message, "Invalid input provided");
      assert.deepEqual(error.cause, new Error("Cause message"));
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
    {
      // Use a default message if neither `message` nor `cause` is provided.
      const error = new HandlerError("UNAVAILABLE");

      assert.equal(error.message, "Handler error: UNAVAILABLE");
    }

    {
      // Accept only `message`
      const error = new HandlerError("UNAVAILABLE", "Error message");

      assert.equal(error.message, "Error message");
    }

    {
      // Accept only `cause`
      const cause = new Error("Cause message");
      const error = new HandlerError("UNAVAILABLE", undefined, { cause });

      assert.equal(error.message, "Handler error: UNAVAILABLE");
      assert.deepEqual(error.cause, new Error("Cause message"));
    }

    {
      // Accept both `message` and `cause`.
      const cause = new Error("Cause message");
      const error = new HandlerError("UNAVAILABLE", "Error message", { cause });

      assert.equal(error.message, "Error message");
      assert.deepEqual(error.cause, new Error("Cause message"));
    }
  });

  it("Correctly compute retry behavior", () => {
    const retryableType = "UNAVAILABLE";
    const nonRetryableType = "BAD_REQUEST";

    {
      const error = new HandlerError(retryableType, "x");

      assert.equal(error.retryableOverride, undefined);
      assert.equal(error.retryable, true);
    }

    {
      const error = new HandlerError(nonRetryableType, "x");

      assert.equal(error.retryableOverride, undefined);
      assert.equal(error.retryable, false);
    }

    {
      const error = new HandlerError(retryableType, "x", { retryableOverride: false });

      assert.equal(error.retryableOverride, false);
      assert.equal(error.retryable, false);
    }

    {
      const error = new HandlerError(nonRetryableType, "x", { retryableOverride: true });

      assert.equal(error.retryableOverride, true);
      assert.equal(error.retryable, true);
    }

    {
      // Unknown string type defaults to retryable and maps to UNKNOWN via fromWire.
      const error = HandlerError.fromWire("INVALID", "x");

      assert.equal(error.type, "UNKNOWN");
      assert.equal(error.rawErrorType, "INVALID");
      assert.equal(error.retryableOverride, undefined);
      assert.equal(error.retryable, true);
    }
  });

  it("fromWire maps unknown string types to UNKNOWN", () => {
    const error = HandlerError.fromWire("SOME_UNKNOWN_TYPE", "test");

    assert.equal(error.type, "UNKNOWN");
    assert.equal(error.rawErrorType, "SOME_UNKNOWN_TYPE");
    assert.equal(error.retryable, true);
  });

  it("Preserves rawErrorType for known types", () => {
    const error = new HandlerError("BAD_REQUEST", "test");
    assert.equal(error.type, "BAD_REQUEST");
    assert.equal(error.rawErrorType, "BAD_REQUEST");
  });

  it("fromWire accepts stackTrace and originalFailure options", () => {
    const failure: Failure = { message: "original" };
    const error = HandlerError.fromWire("INTERNAL", "test", {
      stackTrace: "at foo:1",
      originalFailure: failure,
    });
    assert.equal(error.stack, "at foo:1");
    assert.deepEqual(error.originalFailure, failure);
  });

  it("fromWire uses native stack trace when stackTrace option is not provided", () => {
    const error = HandlerError.fromWire("INTERNAL", "test");
    assert.ok(error.stack);
    assert.ok(error.stack.includes("HandlerError"));
    assert.equal(error.originalFailure, undefined);
  });

  it("Constructor accepts stackTrace and originalFailure", () => {
    const error = new HandlerError("INTERNAL", "test");
    assert.ok(error.stack);
    assert.ok(error.stack.includes("HandlerError"));
    assert.equal(error.originalFailure, undefined);

    const failure: Failure = { message: "original" };
    const error2 = new HandlerError("INTERNAL", "test", { stackTrace: "at foo:1", originalFailure: failure });
    assert.equal(error2.stack, "at foo:1");
    assert.deepEqual(error2.originalFailure, failure);
  });

  it("UNKNOWN type is retryable by default with override support", () => {
    {
      const error = new HandlerError("UNKNOWN", "test");
      assert.equal(error.type, "UNKNOWN");
      assert.equal(error.rawErrorType, "UNKNOWN");
      assert.equal(error.retryable, true);
    }

    {
      const error = new HandlerError("UNKNOWN", "test", { retryableOverride: false });
      assert.equal(error.retryable, false);
    }
  });

  it("fromWire uses raw type string in default message for unknown types", () => {
    const error = HandlerError.fromWire("CUSTOM_TYPE");
    assert.equal(error.message, "Handler error: CUSTOM_TYPE");
  });

  it("fromWire resolves known types correctly", () => {
    const error = HandlerError.fromWire("BAD_REQUEST", "test");
    assert.equal(error.type, "BAD_REQUEST");
    assert.equal(error.rawErrorType, "BAD_REQUEST");
    assert.equal(error.retryable, false);
  });

  it("Constructor rejects unknown type strings at compile time", () => {
    // @ts-expect-error - Argument of type '"INVALID"' is not assignable to parameter of type 'HandlerErrorType'
    new HandlerError("INVALID", "x");
  });
});
