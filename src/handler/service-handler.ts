import { OperationDefinition, OperationMap, ServiceDefinition } from "../service";
import { OperationHandler, SyncOperationHandler } from "./operation-handler";

/**
 * A type that defines a handler for a given operation.
 *
 * @experimental
 */
export type OperationHandlerFor<T> =
  T extends OperationDefinition<infer I, infer O>
    ? OperationHandler<I, O> | SyncOperationHandler<I, O>
    : never;

/**
 * A type that defines a collection of handlers for a given collection of operation interfaces.
 *
 * @experimental
 */
export type ServiceHandlerFor<T extends OperationMap = OperationMap> = {
  [K in keyof T & string]: OperationHandlerFor<T[K]>;
};

/**
 * A Service that includes a collection of handlers for its operations.
 *
 * @experimental
 */
export interface ServiceHandler<T extends OperationMap = OperationMap>
  extends ServiceDefinition<T> {
  handlers: ServiceHandlerFor<T>;
}

/**
 * Constructs a service handler for a given service contract.
 *
 * @experimental
 */
export function serviceHandler<T extends OperationMap>(
  service: ServiceDefinition<T>,
  handlers: ServiceHandlerFor<T>,
): ServiceHandler<T> {
  const ops = new Set<string>();

  for (const [k, op] of Object.entries(service.operations)) {
    if (!op.name) {
      throw new TypeError(
        `Tried to register an operation with no name for service ${service.name} with key ${k}`,
      );
    }
    if (ops.has(op.name)) {
      throw new TypeError(
        `Operation with name ${op.name} already registered for service ${service.name}`,
      );
    }
    const handler = handlers[k];
    if (!handler) {
      throw new TypeError(`No handler registered for ${k} on service ${service.name}`);
    }
    ops.add(op.name);
  }

  return {
    ...service,
    handlers,
  };
}
