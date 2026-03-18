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
exports.somethingOfType = somethingOfType;
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert/strict"));
const nexus = __importStar(require("../index"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myService = nexus.service("service name", {
    syncOp: nexus.operation(),
    fullOp: nexus.operation({ name: "custom name" }),
});
(0, node_test_1.describe)("service and operation", () => {
    (0, node_test_1.it)("throws when registering a service with an empty name", () => {
        assert.throws(() => nexus.service("", {}), /TypeError: Service name must be a non-empty string/);
    });
    (0, node_test_1.it)("throws when registering a duplicate operation", () => {
        assert.throws(() => nexus.service("service name", {
            syncOp: nexus.operation(),
            syncOpAlias: nexus.operation({ name: "syncOp" }),
        }), /TypeError: Duplicate operation definition for name: 'syncOp'/);
    });
});
(0, node_test_1.describe)("Mapped type `OperationKey`", () => {
    (0, node_test_1.it)("infers operation keys", () => {
        somethingOfType();
        somethingOfType();
    });
});
(0, node_test_1.describe)("Mapped type `OperationInput`", () => {
    (0, node_test_1.it)("infers operation input type", () => {
        {
            somethingOfType();
            somethingOfType();
        }
        {
            somethingOfType();
            somethingOfType();
        }
    });
});
(0, node_test_1.describe)("Mapped type `OperationOutput`", () => {
    (0, node_test_1.it)("infers operation Output type", () => {
        {
            somethingOfType();
            somethingOfType();
        }
        {
            somethingOfType();
            somethingOfType();
        }
    });
});
/**
 * A utility function that pretends to return something of type `T`.
 *
 * This is meant to be used to simplify writing TypeScript type assertion tests.
 *
 * For example, to test that a given type evaluates exactly to the expected type, one can do:
 *
 * ```ts
 *   {
 *     type Actual = nexus.OperationKey<(typeof myService)["operations"]>;
 *     type Expected = "syncOp" | "fullOp";
 *     somethingOfType<Actual>() satisfies Expected;
 *     somethingOfType<Expected>() satisfies Actual;
 *   }
 * ```
 *
 * If the types are not assignable, TypeScript will produce a compile-time error.
 */
function somethingOfType() {
    return undefined;
}
//# sourceMappingURL=service.test.js.map