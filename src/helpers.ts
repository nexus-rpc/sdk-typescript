export interface Class<E> {
  new (...args: any[]): E;
  prototype: E;
}

/**
 * A decorator to be used on classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
export function SymbolBasedInstanceOf<E>(markerName: string): (clazz: Class<E>) => void {
  return (clazz: Class<E>): void => {
    const marker = Symbol.for(`__nexus_is${markerName}`);

    Object.defineProperty(clazz.prototype, "name", { value: markerName, enumerable: true });
    Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
    Object.defineProperty(clazz, Symbol.hasInstance, {
      value: function (this: any, value: object): boolean {
        if (this === clazz) {
          return typeof value === "object" && value !== null && (value as any)[marker] === true;
        } else {
          // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
          // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
          // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
          //
          // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
          // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
          // behavior (which is NOT cross-realm safe).
          return this.prototype.isPrototypeOf(value); // eslint-disable-line no-prototype-builtins
        }
      },
    });
  };
}
