"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
const common_1 = require("../common");
/**
 * The root Nexus handler, which dispatches Nexus requests to a collection of registered service
 * implementations.
 *
 * @experimental
 */
class ServiceRegistry {
    services;
    /**
     * Constructs a new {@link ServiceRegistry}.
     *
     * @experimental
     */
    static create(services) {
        const serviceMap = new Map();
        for (const s of services) {
            const name = s.definition.name;
            if (!name) {
                throw new TypeError("Tried to register a Nexus service with no name");
            }
            if (serviceMap.has(name)) {
                throw new TypeError(`Duplicate registration of nexus service '${name}'`);
            }
            serviceMap.set(name, s);
        }
        return new ServiceRegistry(serviceMap);
    }
    constructor(
    /**
     * Registered service handlers to which this registry dispatches requests.
     */
    services = new Map()) {
        this.services = services;
    }
    getOperationHandler(ctx) {
        const { service, operation } = ctx;
        const serviceHandler = this.services.get(service);
        if (serviceHandler == null) {
            throw new common_1.HandlerError("NOT_FOUND", `No service handler registered for service name '${service}'`);
        }
        return serviceHandler.getOperationHandler(operation);
    }
    async start(ctx, lv) {
        const handler = this.getOperationHandler(ctx);
        const input = await lv.consume();
        return await handler.start(ctx, input);
    }
    async cancel(ctx, token) {
        return await this.getOperationHandler(ctx).cancel(ctx, token);
    }
}
exports.ServiceRegistry = ServiceRegistry;
//# sourceMappingURL=service-registry.js.map