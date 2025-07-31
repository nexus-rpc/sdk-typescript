import { describe, it } from "node:test";
import { HandlerStartOperationResult } from "./start-operation-result";
import assert from "node:assert";

describe("StartOperationResult", () => {
  it("Can be created as sync", () => {
    const x = HandlerStartOperationResult.sync(42) as HandlerStartOperationResult;
    if (x.isAsync) {
      assert.fail("x.isAsync should be false");
    } else {
      assert.equal(x.value, 42);
      // @ts-expect-error Property `token` doesn't exist
      const _token = x.token;
    }
  });

  it("Can be created as async", () => {
    const x = HandlerStartOperationResult.async("token") as HandlerStartOperationResult;
    if (x.isAsync) {
      assert.equal(x.token, "token");
      // @ts-expect-error Property `value` doesn't exist
      const _value = x.value;
    } else {
      assert.fail("isAsync should be true");
    }
  });

  it("Supports instanceof", () => {
    const x: HandlerStartOperationResult = HandlerStartOperationResult.sync(42);
    assert.ok(x instanceof HandlerStartOperationResult);

    const y: HandlerStartOperationResult = HandlerStartOperationResult.async("token");
    assert.ok(y instanceof HandlerStartOperationResult);

    assert.ok(!((null as any) instanceof HandlerStartOperationResult));
    assert.ok(!((undefined as any) instanceof HandlerStartOperationResult));
    assert.ok(!(("" as any) instanceof HandlerStartOperationResult));
    assert.ok(!((0 as any) instanceof HandlerStartOperationResult));
    assert.ok(!(((() => undefined) as any) instanceof HandlerStartOperationResult));
  });

  it("Interface can't be implemented directly", () => {
    // @ts-expect-error Property `__isHandlerStartOperationResultSymbol` doesn't exist
    const _x: HandlerStartOperationResult = {
      isAsync: false,
      value: 42,
    };

    // @ts-expect-error Property `__isHandlerStartOperationResultSymbol` doesn't exist
    const _y: HandlerStartOperationResult = {
      isAsync: true,
      token: "token",
    };
  });
});
