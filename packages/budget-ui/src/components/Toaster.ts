import { Position, Toaster as BPToaster } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const Toaster = BPToaster.create({
  className: "recipe-toaster",
  position: Position.TOP
});
