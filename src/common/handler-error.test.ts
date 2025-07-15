import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { HandlerError } from "./index";

describe("HandlerError", () => {
  // Important: Keep these in sync with the sample code on the HandlerError class typedoc.
  it("Can be constructed using sample code", () => {
    let error = new HandlerError({
      type: "BAD_REQUEST",
      message: "Invalid input provided",
    });

    assert.equal(error.type, "BAD_REQUEST");
    assert.equal(error.message, "Invalid input provided");
    assert.equal(error.cause, undefined);
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, false);

    error = new HandlerError({
      type: "INTERNAL",
      message: "Database unavailable",
      retryableOverride: true,
    });

    assert.equal(error.type, "INTERNAL");
    assert.equal(error.message, "Database unavailable");
    assert.equal(error.cause, undefined);
    assert.equal(error.retryableOverride, true);
    assert.equal(error.retryable, true);
  });

  it("Requires at least one of message or cause", () => {
    // Reject if neither `message` nor `cause` is provided. This check is TS only.
    // At runtime, we simply default error message to "Handler error"; that's better
    // than throwing a type error, which would be masking the actual error.
    // @ts-expect-error 2344 Should require at least one of `message` or `cause`
    let error = new HandlerError({ type: "UNAVAILABLE" });
    assert.equal(error.message, "Handler error");

    // Accept only `message`
    error = new HandlerError({ message: "Error message", type: "UNAVAILABLE" });
    assert.equal(error.message, "Error message");

    // Accept only `cause`
    error = new HandlerError({ cause: new Error("Cause message"), type: "UNAVAILABLE" });
    assert.equal(error.message, "Cause message");
    assert.equal((error.cause as Error).message, "Cause message");

    // FIXME: Waiting for final confirmation on desired behavior.
    // Accept both `message` and `cause`
    error = new HandlerError({
      message: "Error message",
      cause: new Error("Cause message"),
      type: "UNAVAILABLE",
    });
    assert.equal(error.message, "Error message: Cause message");
    assert.equal((error.cause as Error).message, "Cause message");
  });

  it("Correctly compute retry behavior", () => {
    const retryableType = "UNAVAILABLE";
    const nonRetryableType = "BAD_REQUEST";

    let error = new HandlerError({ message: "x", type: retryableType });
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, true);

    error = new HandlerError({ message: "x", type: nonRetryableType });
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, false);

    error = new HandlerError({ message: "x", type: retryableType, retryableOverride: false });
    assert.equal(error.retryableOverride, false);
    assert.equal(error.retryable, false);

    error = new HandlerError({ message: "x", type: nonRetryableType, retryableOverride: true });
    assert.equal(error.retryableOverride, true);
    assert.equal(error.retryable, true);

    // Default to retryable if given an invalid error type. This is in line with all reference SDKs.
    error = new HandlerError({ message: "x", type: "INVALID" as any });
    assert.equal(error.retryableOverride, undefined);
    assert.equal(error.retryable, true);
  });
});
