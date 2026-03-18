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
(0, node_test_1.describe)("HandlerError", () => {
    (0, node_test_1.it)("Can be constructed using sample code", () => {
        // Important: Keep these in sync with the sample code on the HandlerError class typedoc.
        {
            const error = new index_1.HandlerError("BAD_REQUEST", "Invalid input provided");
            assert.equal(error.type, "BAD_REQUEST");
            assert.equal(error.message, "Invalid input provided");
            assert.equal(error.cause, undefined);
            assert.equal(error.retryableOverride, undefined);
            assert.equal(error.retryable, false);
        }
        {
            const cause = new Error("Cause message");
            const error = new index_1.HandlerError("BAD_REQUEST", "Invalid input provided", { cause });
            assert.equal(error.type, "BAD_REQUEST");
            assert.equal(error.message, "Invalid input provided");
            assert.deepEqual(error.cause, new Error("Cause message"));
            assert.equal(error.retryableOverride, undefined);
            assert.equal(error.retryable, false);
        }
        {
            const error = new index_1.HandlerError("INTERNAL", "Database unavailable", {
                retryableOverride: true,
            });
            assert.equal(error.type, "INTERNAL");
            assert.equal(error.message, "Database unavailable");
            assert.equal(error.cause, undefined);
            assert.equal(error.retryableOverride, true);
            assert.equal(error.retryable, true);
        }
    });
    (0, node_test_1.it)("Properly handles all combinations of message and cause", () => {
        {
            // Use a default message if neither `message` nor `cause` is provided.
            const error = new index_1.HandlerError("UNAVAILABLE");
            assert.equal(error.message, "Handler error: UNAVAILABLE");
        }
        {
            // Accept only `message`
            const error = new index_1.HandlerError("UNAVAILABLE", "Error message");
            assert.equal(error.message, "Error message");
        }
        {
            // Accept only `cause`
            const cause = new Error("Cause message");
            const error = new index_1.HandlerError("UNAVAILABLE", undefined, { cause });
            assert.equal(error.message, "Handler error: UNAVAILABLE");
            assert.deepEqual(error.cause, new Error("Cause message"));
        }
        {
            // Accept both `message` and `cause`.
            const cause = new Error("Cause message");
            const error = new index_1.HandlerError("UNAVAILABLE", "Error message", { cause });
            assert.equal(error.message, "Error message");
            assert.deepEqual(error.cause, new Error("Cause message"));
        }
    });
    (0, node_test_1.it)("Correctly compute retry behavior", () => {
        const retryableType = "UNAVAILABLE";
        const nonRetryableType = "BAD_REQUEST";
        {
            const error = new index_1.HandlerError(retryableType, "x");
            assert.equal(error.retryableOverride, undefined);
            assert.equal(error.retryable, true);
        }
        {
            const error = new index_1.HandlerError(nonRetryableType, "x");
            assert.equal(error.retryableOverride, undefined);
            assert.equal(error.retryable, false);
        }
        {
            const error = new index_1.HandlerError(retryableType, "x", { retryableOverride: false });
            assert.equal(error.retryableOverride, false);
            assert.equal(error.retryable, false);
        }
        {
            const error = new index_1.HandlerError(nonRetryableType, "x", { retryableOverride: true });
            assert.equal(error.retryableOverride, true);
            assert.equal(error.retryable, true);
        }
    });
    (0, node_test_1.it)("Constructor respects the rawErrorType for the UNKNOWN HandlerErrorType", () => {
        const error = new index_1.HandlerError("UNKNOWN", "test");
        assert.equal(error.type, "UNKNOWN");
        assert.equal(error.rawErrorType, "UNKNOWN");
        const error2 = new index_1.HandlerError("UNKNOWN", "test", { rawErrorType: "RAW_ERROR_TYPE" });
        assert.equal(error2.type, "UNKNOWN");
        assert.equal(error2.rawErrorType, "RAW_ERROR_TYPE");
    });
    (0, node_test_1.it)("Constructor preserves rawErrorType for known types", () => {
        const error = new index_1.HandlerError("BAD_REQUEST", "test");
        assert.equal(error.type, "BAD_REQUEST");
        assert.equal(error.rawErrorType, "BAD_REQUEST");
        const error2 = new index_1.HandlerError("BAD_REQUEST", "test", { rawErrorType: "RAW_ERROR_TYPE" });
        assert.equal(error2.type, "BAD_REQUEST");
        assert.equal(error2.rawErrorType, "BAD_REQUEST");
    });
    (0, node_test_1.it)("Constructor accepts stackTrace and originalFailure", () => {
        const error = new index_1.HandlerError("INTERNAL", "test");
        assert.ok(error.stack);
        assert.ok(error.stack.includes("HandlerError"));
        assert.equal(error.originalFailure, undefined);
        const failure = { message: "original" };
        const error2 = new index_1.HandlerError("INTERNAL", "test", {
            stackTrace: "at foo:1",
            originalFailure: failure,
        });
        assert.equal(error2.stack, "at foo:1");
        assert.deepEqual(error2.originalFailure, failure);
    });
    (0, node_test_1.it)("UNKNOWN type is retryable by default with override support", () => {
        {
            const error = new index_1.HandlerError("UNKNOWN", "test");
            assert.equal(error.type, "UNKNOWN");
            assert.equal(error.rawErrorType, "UNKNOWN");
            assert.equal(error.retryable, true);
        }
        {
            const error = new index_1.HandlerError("UNKNOWN", "test", { retryableOverride: false });
            assert.equal(error.retryable, false);
        }
    });
    (0, node_test_1.it)("Constructor rejects unknown type strings at runtime", () => {
        assert.throws(
        // @ts-expect-error - Argument of type '"INVALID"' is not assignable to parameter of type 'HandlerErrorType'
        () => new index_1.HandlerError("INVALID", "x"), TypeError);
    });
});
//# sourceMappingURL=handler-error.test.js.map