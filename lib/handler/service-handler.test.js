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
(0, node_test_1.describe)("ServiceHandler", () => {
    class MyServiceHandler {
        async syncOp(_ctx, input) {
            return input;
        }
        fullOp = {
            async start(_ctx, input) {
                return nexus.HandlerStartOperationResult.sync(input);
            },
            async cancel(_ctx, _token) {
                //
            },
        };
    }
    (0, node_test_1.it)("Can be constructed with a plain object", () => {
        const serviceHandler = nexus.serviceHandler(myService, myServiceOpsHandler);
        assert.equal(serviceHandler.getOperationHandler("syncOp").name, "syncOp");
        assert.equal(serviceHandler.getOperationHandler("custom name").name, "custom name");
    });
    (0, node_test_1.it)("Can be constructed with a class", () => {
        const handler = new MyServiceHandler();
        const serviceHandler = nexus.serviceHandler(myService, handler);
        assert.equal(serviceHandler.getOperationHandler("syncOp").name, "syncOp");
        assert.equal(serviceHandler.getOperationHandler("custom name").name, "custom name");
    });
});
//# sourceMappingURL=service-handler.test.js.map