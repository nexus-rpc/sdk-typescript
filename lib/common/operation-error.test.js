"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert/strict"));
const index_1 = require("./index");
(0, node_test_1.describe)("OperationError", () => {
    // Important: Keep these in sync with the sample code on the OperationError class typedoc.
    (0, node_test_1.it)("Can be constructed using sample code", () => {
        {
            const error = new index_1.OperationError("failed", "Not enough inventory");
            assert.equal(error.message, "Not enough inventory");
            assert.equal(error.cause, undefined);
            assert.equal(error.state, "failed");
        }
        {
            const cause = new Error("Cause message");
            const error = new index_1.OperationError("failed", "Not enough inventory", { cause });
            assert.equal(error.message, "Not enough inventory");
            assert.deepEqual(error.cause, new Error("Cause message"));
            assert.equal(error.state, "failed");
        }
        {
            const error = new index_1.OperationError("canceled", "User canceled the operation");
            assert.equal(error.message, "User canceled the operation");
            assert.equal(error.cause, undefined);
            assert.equal(error.state, "canceled");
        }
    });
    (0, node_test_1.it)("Properly handles all combinations of message and cause", () => {
        {
            // Use the default message if neither `message` nor `cause` is provided (canceled)
            const error = new index_1.OperationError("canceled");
            assert.equal(error.message, "Operation canceled");
            assert.equal(error.cause, undefined);
        }
        {
            // Use the default message if neither `message` nor `cause` is provided (failed)
            const error = new index_1.OperationError("failed");
            assert.equal(error.message, "Operation failed");
            assert.equal(error.cause, undefined);
        }
        {
            // Accept only `message`
            const error = new index_1.OperationError("failed", "Error message");
            assert.equal(error.message, "Error message");
            assert.equal(error.cause, undefined);
        }
        {
            // Accept only `cause`
            const cause = new Error("Service unavailable");
            const error = new index_1.OperationError("failed", undefined, { cause });
            assert.equal(error.message, "Operation failed");
            assert.deepEqual(error.cause, cause);
        }
        {
            // Accept both `message` and `cause`.
            const cause = new Error("Service unavailable");
            const error = new index_1.OperationError("failed", "Error message", { cause });
            assert.equal(error.message, "Error message");
            assert.deepEqual(error.cause, cause);
        }
    });
    (0, node_test_1.it)("Requires valid state", () => {
        // @ts-expect-error - Argument ... is not assignable to type ...
        new index_1.OperationError(undefined, "x");
        // @ts-expect-error - Argument ... is not assignable to type ...
        new index_1.OperationError("invalid", "x");
    });
    (0, node_test_1.it)("Constructor accepts stackTrace and originalFailure", () => {
        const error = new index_1.OperationError("failed", "test");
        assert.ok(error.stack);
        assert.ok(error.stack.includes("OperationError"));
        assert.equal(error.originalFailure, undefined);
        const failure = { message: "original" };
        const error2 = new index_1.OperationError("failed", "test", {
            stackTrace: "at bar:2",
            originalFailure: failure,
        });
        assert.equal(error2.stack, "at bar:2");
        assert.deepEqual(error2.originalFailure, failure);
    });
});
//# sourceMappingURL=operation-error.test.js.map