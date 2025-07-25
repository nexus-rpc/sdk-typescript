import { HandlerError, OperationInfo } from "../common";
import { LazyValue } from "../serialization";
import { HandlerStartOperationResult } from "./start-operation-result";
import {
  OperationContext,
  StartOperationContext,
  GetOperationResultContext,
  GetOperationInfoContext,
  CancelOperationContext,
} from "./operation-context";
import { ServiceHandler } from "./service-handler";
import { OperationHandler, SyncOperationHandler } from "./operation-handler";

/**
 * A collection of service handlers that dispatches requests to the registered service and operation handler.
 *
 * @experimental
 */
export class ServiceRegistry implements OperationHandler<unknown, unknown> {
  private services = new Map<
    string,
    Map<string, OperationHandler<any, any> | SyncOperationHandler<any, any>>
  >();

  /**
   * @experimental
   */
  constructor(services: ServiceHandler[]) {
    for (const s of services) {
      if (!s.name) {
        throw new TypeError("Tried to register a Nexus service with no name");
      }
      if (this.services.has(s.name)) {
        throw new TypeError(`Duplicate registration of nexus service ${s.name}`);
      }
      const ops = new Map<string, OperationHandler<any, any> | SyncOperationHandler<any, any>>();
      for (const [k, op] of Object.entries(s.operations)) {
        if (!op.name) {
          throw new TypeError(
            `Tried to register an operation with no name for service ${s.name} with key ${k}`,
          );
        }
        if (ops.has(op.name)) {
          throw new TypeError(
            `Operation with name ${op.name} already registered for service ${s.name}`,
          );
        }
        const handler = s.handlers[k];
        if (!handler) {
          throw new TypeError(`No handler registered for ${k} on service ${s.name}`);
        }
        ops.set(op.name, handler);
      }
      this.services.set(s.name, ops);
    }
  }

  private getOperationHandler(
    ctx: OperationContext,
  ): OperationHandler<any, any> | SyncOperationHandler<any, any> {
    const { service, operation } = ctx;
    const serviceHandler = this.services.get(service);
    if (serviceHandler == null) {
      throw new HandlerError("NOT_FOUND", `Service handler not registered for service ${service}`);
    }
    const operationHandler = serviceHandler.get(operation);
    if (operationHandler == null) {
      throw new HandlerError(
        "NOT_FOUND",
        `Operation handler not registered for operation ${operation} in service ${service}`,
      );
    }
    return operationHandler;
  }

  async start(
    ctx: StartOperationContext,
    lv: LazyValue,
  ): Promise<HandlerStartOperationResult<any>> {
    const handler = this.getOperationHandler(ctx);
    const input = await lv.consume<any>();
    if (typeof handler === "function") {
      const value = await handler(ctx, input);
      return { value };
    }
    return await handler.start(ctx, input);
  }

  async getResult(ctx: GetOperationResultContext, token: string): Promise<LazyValue> {
    const handler = this.getOperationHandler(ctx);
    if (typeof handler === "function") {
      throw new HandlerError("NOT_IMPLEMENTED", "Not implemented");
    }
    return await handler.getResult(ctx, token);
  }

  async getInfo(ctx: GetOperationInfoContext, token: string): Promise<OperationInfo> {
    const handler = this.getOperationHandler(ctx);
    if (typeof handler === "function") {
      throw new HandlerError("NOT_IMPLEMENTED", "Not implemented");
    }
    return await handler.getInfo(ctx, token);
  }

  async cancel(ctx: CancelOperationContext, token: string): Promise<void> {
    const handler = this.getOperationHandler(ctx);
    if (typeof handler === "function") {
      throw new HandlerError("NOT_IMPLEMENTED", "Not implemented");
    }
    return await handler.cancel(ctx, token);
  }
}
