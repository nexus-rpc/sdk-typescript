"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const start_operation_result_1 = require("./start-operation-result");
const node_assert_1 = __importDefault(require("node:assert"));
(0, node_test_1.describe)("StartOperationResult", () => {
    (0, node_test_1.it)("Can be created as sync", () => {
        const x = start_operation_result_1.HandlerStartOperationResult.sync(42);
        if (x.isAsync) {
            node_assert_1.default.fail("x.isAsync should be false");
        }
        else {
            node_assert_1.default.equal(x.value, 42);
            // @ts-expect-error Property `token` doesn't exist
            const _token = x.token;
        }
    });
    (0, node_test_1.it)("Can be created as async", () => {
        const x = start_operation_result_1.HandlerStartOperationResult.async("token");
        if (x.isAsync) {
            node_assert_1.default.equal(x.token, "token");
            // @ts-expect-error Property `value` doesn't exist
            const _value = x.value;
        }
        else {
            node_assert_1.default.fail("isAsync should be true");
        }
    });
    (0, node_test_1.it)("Supports instanceof", () => {
        const x = start_operation_result_1.HandlerStartOperationResult.sync(42);
        node_assert_1.default.ok(x instanceof start_operation_result_1.HandlerStartOperationResult);
        const y = start_operation_result_1.HandlerStartOperationResult.async("token");
        node_assert_1.default.ok(y instanceof start_operation_result_1.HandlerStartOperationResult);
        node_assert_1.default.ok(!(null instanceof start_operation_result_1.HandlerStartOperationResult));
        node_assert_1.default.ok(!(undefined instanceof start_operation_result_1.HandlerStartOperationResult));
        node_assert_1.default.ok(!("" instanceof start_operation_result_1.HandlerStartOperationResult));
        node_assert_1.default.ok(!(0 instanceof start_operation_result_1.HandlerStartOperationResult));
        node_assert_1.default.ok(!((() => undefined) instanceof start_operation_result_1.HandlerStartOperationResult));
    });
    (0, node_test_1.it)("Interface can't be implemented directly", () => {
        // @ts-expect-error Property `__isHandlerStartOperationResultSymbol` doesn't exist
        const _x = {
            isAsync: false,
            value: 42,
        };
        // @ts-expect-error Property `__isHandlerStartOperationResultSymbol` doesn't exist
        const _y = {
            isAsync: true,
            token: "token",
        };
    });
});
//# sourceMappingURL=start-operation-result.test.js.map