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
const nexus = __importStar(require("../index"));
const myService = nexus.service("service name", {
    syncOp: nexus.operation(),
    fullOp: nexus.operation({ name: "custom name" }),
});
const myServiceOpsHandler = {
    syncOp: async (_ctx, input) => {
        return input;
    },
    fullOp: {
        async start(_ctx, input) {
            return nexus.HandlerStartOperationResult.sync(input);
        },
        async cancel(_ctx, _token) {
            //
        },
    },
};
const myServiceHandler = nexus.serviceHandler(myService, myServiceOpsHandler);
(0, node_test_1.describe)("ServiceRegistry", () => {
    const registry = nexus.ServiceRegistry.create([myServiceHandler]);
    const mkStartCtx = (service, operation) => ({
        service,
        operation,
        abortSignal: new AbortController().signal,
        headers: {},
        inboundLinks: [{ type: "test", url: new URL("http://test") }],
        outboundLinks: [],
        requestId: "test-req-id",
    });
    (0, node_test_1.it)("throws when trying to register a duplicate service handler", () => {
        assert.throws(() => nexus.ServiceRegistry.create([myServiceHandler, myServiceHandler]), /TypeError: Duplicate registration of nexus service 'service name'/);
    });
    (0, node_test_1.it)("throws when registering a service with some missing operation handlers", () => {
        assert.throws(() => nexus.serviceHandler(myService, {
            syncOp: myServiceOpsHandler.syncOp,
            // Intentionally missing 'fullOp'
        }), /TypeError: No handler registered for operation 'custom name'/);
    });
    (0, node_test_1.it)("throws when registering missing a operation handler", () => {
        assert.throws(() => nexus.serviceHandler(myService, {
            ...myServiceOpsHandler,
            syncOp: {},
        }), /TypeError: Handler for operation 'syncOp' has no start method/);
    });
    (0, node_test_1.it)("throws a not found error if a service or operation is not registered", async () => {
        await assert.rejects(() => registry.start(mkStartCtx("non existing service", "dontCare"), createLazyValue("test")), /HandlerError: No service handler registered for service name 'non existing service'/);
        await assert.rejects(() => registry.start(mkStartCtx("service name", "notFound"), createLazyValue("test")), /HandlerError: Operation handler not registered/);
    });
    (0, node_test_1.it)("routes start to the correct handler", async () => {
        assert.deepEqual(await registry.start(mkStartCtx("service name", "syncOp"), createLazyValue("test")), nexus.HandlerStartOperationResult.sync("test"));
        assert.deepEqual(await registry.start(mkStartCtx("service name", "custom name"), createLazyValue(1)), nexus.HandlerStartOperationResult.sync(1));
    });
    (0, node_test_1.it)("routes cancel to the correct handler", async () => {
        const ctx = {
            service: "service name",
            operation: "syncOp",
            abortSignal: new AbortController().signal,
            headers: {},
        };
        assert.rejects(() => registry.cancel(ctx, "token"), /HandlerError: Not implemented/);
        ctx.operation = "custom name";
        assert.equal(await registry.cancel(ctx, "token"), undefined);
    });
});
function createLazyValue(value) {
    return new nexus.LazyValue({
        deserialize() {
            return value;
        },
        serialize() {
            throw new Error("Not implemented");
        },
    }, {});
}
//# sourceMappingURL=service-registry.test.js.map