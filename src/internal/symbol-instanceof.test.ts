import { test, it, describe } from "node:test";
import * as assert from "node:assert/strict";
import vm from "vm";
import { injectSymbolBasedInstanceOf } from "./symbol-instanceof";

describe("injectSymbolBasedInstanceOf", () => {
  const script = new vm.Script(`
    class ClassA extends Error {};
    class ClassB extends ClassA {}
    class ClassC extends ClassB {}
  `);

  function makeContext() {
    const cx1 = vm.createContext();
    cx1.injectSymbolBasedInstanceOf = injectSymbolBasedInstanceOf;
    script.runInContext(cx1);

    const cx2 = vm.createContext();
    cx2.injectSymbolBasedInstanceOf = injectSymbolBasedInstanceOf;
    script.runInContext(cx2);

    return {
      cx1: (script: string) => vm.runInContext(script, cx1),
      cx2: (script: string) => vm.runInContext(script, cx2),
    };
  }

  /**
   * This test is trivial and obvious.
   * It is only meant to clearly establish a baseline for other tests.
   */
  it("instanceof works as expected in single realm, without injectSymbolBasedInstanceOf", () => {
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
  test("instanceof is broken in cross realms, without injectSymbolBasedInstanceOf", () => {
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
  test(`injectSymbolBasedInstanceOf doesn't break any default behaviour of instanceof in single realm`, () => {
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
  test(`instanceof is working as expected across realms with injectSymbolBasedInstanceOf`, () => {
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
  test("injectSymbolBasedInstanceOf doesnt break on non-object values", () => {
    const { cx1 } = makeContext();

    cx1(`injectSymbolBasedInstanceOf(ClassA, 'ClassA')`);

    assert.ok(!((true as any) instanceof cx1("ClassA")));
    assert.ok(!((12 as any) instanceof cx1("ClassA")));
    assert.ok(!((NaN as any) instanceof cx1("ClassA")));
    assert.ok(!(("string" as any) instanceof cx1("ClassA")));
    assert.ok(!(([] as any) instanceof cx1("ClassA")));
    assert.ok(!((undefined as any) instanceof cx1("ClassA")));
    assert.ok(!((null as any) instanceof cx1("ClassA")));
    assert.ok(!(((() => null) as any) instanceof cx1("ClassA")));
    assert.ok(!((Symbol() as any) instanceof cx1("ClassA")));
  });

  test("Same context with same injectSymbolBasedInstanceOf calls also works", () => {
    class ClassA extends Error {}
    class ClassB extends Error {}

    assert.ok(!(new ClassA() instanceof ClassB));
    assert.ok(!(new ClassB() instanceof ClassA));

    injectSymbolBasedInstanceOf(ClassA, "Foo");
    injectSymbolBasedInstanceOf(ClassB, "Foo");

    assert.ok(new ClassA() instanceof ClassB);
    assert.ok(new ClassB() instanceof ClassA);
  });
});
