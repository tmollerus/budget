import { Position, Toaster as BPToaster } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const Toaster = BPToaster.create({
  className: "toastMessage",
  position: Position.TOP
});
