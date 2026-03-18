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
export declare function somethingOfType<T>(): T;
