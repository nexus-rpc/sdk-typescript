import * as nexus from "./index";
import { createNexusClient } from './test';

export const myService = nexus.service("service name", {
  syncOp: nexus.operation(),
  fullOp: nexus.operation({ name: "custom name" }),
});


const c = createNexusClient({ endpoint: "foo", service: myService });
// Invoke via a string key.
const _o1 = c.executeOperation("syncOp", "foo");
const _o2 = c.executeOperation("fullOp", 3);
// Worker but not auto-completed.
c.executeOperation("notAndOp", 3);

// Invoke via an operation reference.
const _o3 = c.executeOperation(myService.operations.syncOp, "foo");
const _o4 = c.executeOperation(myService.operations.fullOp, 3);

// We can't easily prevent this at compile time without unreasonably complicating the types, but we can at runtime.
const myOtherService = nexus.service("other service", {
otherOp: nexus.operation(),
});
const _ = c.executeOperation(myOtherService.operations.otherOp, 3);