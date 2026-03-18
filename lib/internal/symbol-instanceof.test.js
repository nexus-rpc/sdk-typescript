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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert/strict"));
const vm_1 = __importDefault(require("vm"));
const symbol_instanceof_1 = require("./symbol-instanceof");
(0, node_test_1.describe)("injectSymbolBasedInstanceOf", () => {
    const script = new vm_1.default.Script(`
    class ClassA extends Error {};
    class ClassB extends ClassA {}
    class ClassC extends ClassB {}
  `);
    function makeContext() {
        const cx1 = vm_1.default.createContext();
        cx1.injectSymbolBasedInstanceOf = symbol_instanceof_1.injectSymbolBasedInstanceOf;
        script.runInContext(cx1);
        const cx2 = vm_1.default.createContext();
        cx2.injectSymbolBasedInstanceOf = symbol_instanceof_1.injectSymbolBasedInstanceOf;
        script.runInContext(cx2);
        return {
            cx1: (script) => vm_1.default.runInContext(script, cx1),
            cx2: (script) => vm_1.default.runInContext(script, cx2),
        };
    }
    /**
     * This test is trivial and obvious.
     * It is only meant to clearly establish a baseline for other tests.
     */
    (0, node_test_1.it)("instanceof works as expected in single realm, without injectSymbolBasedInstanceOf", () => {
        const { cx1 } = makeContext();
        assert.ok(cx1("new ClassA()") instanceof cx1("ClassA"));
        assert.ok(cx1("new ClassB()") instanceof cx1("ClassA"));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassA"));
        assert.ok(!(cx1("new ClassA()") instanceof cx1("ClassB")));
        assert.ok(cx1("new ClassB()") instanceof cx1("ClassB"));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassB"));
        assert.ok(!(cx1("new ClassA()") instanceof cx1("ClassC")));
        assert.ok(!(cx1("new ClassB()") instanceof cx1("ClassC")));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassC"));
        assert.ok(cx1("new ClassA()") instanceof cx1("Object"));
        assert.ok(cx1("new ClassB()") instanceof cx1("Object"));
        assert.ok(cx1("new ClassC()") instanceof cx1("Object"));
    });
    /**
     * This test demonstrates that cross-realm instanceof is indeed broken by default.
     */
    (0, node_test_1.test)("instanceof is broken in cross realms, without injectSymbolBasedInstanceOf", () => {
        const { cx1, cx2 } = makeContext();
        assert.ok(!(cx1("new ClassA()") instanceof cx2("ClassA")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("ClassA")));
        assert.ok(!(cx1("new ClassC()") instanceof cx2("ClassA")));
        assert.ok(!(cx1("new ClassA()") instanceof cx2("ClassB")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("ClassB")));
        assert.ok(!(cx1("new ClassC()") instanceof cx2("ClassB")));
        assert.ok(!(cx1("new ClassA()") instanceof cx2("ClassC")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("ClassC")));
        assert.ok(!(cx1("new ClassC()") instanceof cx2("ClassC")));
        assert.ok(!(cx1("new ClassA()") instanceof cx2("Object")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("Object")));
        assert.ok(!(cx1("new ClassC()") instanceof cx2("Object")));
    });
    /**
     * This test demonstrates that injectSymbolBasedInstanceOf doesn't break any
     * default behaviour of instanceof in single realm.
     */
    (0, node_test_1.test)(`injectSymbolBasedInstanceOf doesn't break any default behaviour of instanceof in single realm`, () => {
        const { cx1 } = makeContext();
        cx1(`injectSymbolBasedInstanceOf(ClassA, 'ClassA')`);
        cx1(`injectSymbolBasedInstanceOf(ClassB, 'ClassB')`);
        assert.ok(cx1("new ClassA()") instanceof cx1("ClassA"));
        assert.ok(cx1("new ClassB()") instanceof cx1("ClassA"));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassA"));
        assert.ok(!(cx1("new ClassA()") instanceof cx1("ClassB")));
        assert.ok(cx1("new ClassB()") instanceof cx1("ClassB"));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassB"));
        assert.ok(!(cx1("new ClassA()") instanceof cx1("ClassC")));
        assert.ok(!(cx1("new ClassB()") instanceof cx1("ClassC")));
        assert.ok(cx1("new ClassC()") instanceof cx1("ClassC"));
        assert.ok(cx1("new ClassA()") instanceof cx1("Object"));
        assert.ok(cx1("new ClassB()") instanceof cx1("Object"));
        assert.ok(cx1("new ClassC()") instanceof cx1("Object"));
    });
    /**
     * This test demonstrates that injectSymbolBasedInstanceOf fixes incorrect
     * instanceof default behavior in cross-realm scenarios.
     */
    (0, node_test_1.test)(`instanceof is working as expected across realms with injectSymbolBasedInstanceOf`, () => {
        const { cx1, cx2 } = makeContext();
        cx1(`injectSymbolBasedInstanceOf(ClassA, 'ClassA')`);
        cx1(`injectSymbolBasedInstanceOf(ClassB, 'ClassB')`);
        cx2(`injectSymbolBasedInstanceOf(ClassA, 'ClassA')`);
        cx2(`injectSymbolBasedInstanceOf(ClassB, 'ClassB')`);
        assert.ok(cx1("new ClassA()") instanceof cx2("ClassA"));
        assert.ok(cx1("new ClassB()") instanceof cx2("ClassA"));
        assert.ok(cx1("new ClassC()") instanceof cx2("ClassA"));
        assert.ok(!(cx1("new ClassA()") instanceof cx2("ClassB")));
        assert.ok(cx1("new ClassB()") instanceof cx2("ClassB"));
        assert.ok(cx1("new ClassC()") instanceof cx2("ClassB"));
        assert.ok(!(cx1("new ClassA()") instanceof cx2("ClassC")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("ClassC")));
        // This one is surprising but expected, as injectSymbolBasedInstanceOf was never called on ClassC;
        // it therefore reverts to the default behavior of instanceof, which is not cross-realm safe.
        assert.ok(!(cx1("new ClassC()") instanceof cx2("ClassC")));
        // The followings are surprising, but expected, as 'Object' differs between realms.
        // injectSymbolBasedInstanceOf doesn't help with that.
        assert.ok(!(cx1("new ClassA()") instanceof cx2("Object")));
        assert.ok(!(cx1("new ClassB()") instanceof cx2("Object")));
        assert.ok(!(cx1("new ClassC()") instanceof cx2("Object")));
    });
    /**
     * This test confirms that injectSymbolBasedInstanceOf doesn't break in
     * situations where the subject of instanceof is not an object.
     */
    (0, node_test_1.test)("injectSymbolBasedInstanceOf doesnt break on non-object values", () => {
        const { cx1 } = makeContext();
        cx1(`injectSymbolBasedInstanceOf(ClassA, 'ClassA')`);
        assert.ok(!(true instanceof cx1("ClassA")));
        assert.ok(!(12 instanceof cx1("ClassA")));
        assert.ok(!(NaN instanceof cx1("ClassA")));
        assert.ok(!("string" instanceof cx1("ClassA")));
        assert.ok(!([] instanceof cx1("ClassA")));
        assert.ok(!(undefined instanceof cx1("ClassA")));
        assert.ok(!(null instanceof cx1("ClassA")));
        assert.ok(!((() => null) instanceof cx1("ClassA")));
        assert.ok(!(Symbol() instanceof cx1("ClassA")));
    });
    (0, node_test_1.test)("Same context with same injectSymbolBasedInstanceOf calls also works", () => {
        class ClassA extends Error {
        }
        class ClassB extends Error {
        }
        assert.ok(!(new ClassA() instanceof ClassB));
        assert.ok(!(new ClassB() instanceof ClassA));
        (0, symbol_instanceof_1.injectSymbolBasedInstanceOf)(ClassA, "Foo");
        (0, symbol_instanceof_1.injectSymbolBasedInstanceOf)(ClassB, "Foo");
        assert.ok(new ClassA() instanceof ClassB);
        assert.ok(new ClassB() instanceof ClassA);
    });
});
//# sourceMappingURL=symbol-instanceof.test.js.map