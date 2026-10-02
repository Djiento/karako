"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 600,
  ...props
}: TooltipPrimitive.Provider.Props & {
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider
      delay={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />;
}

function TooltipTrigger({
  render,
  asChild: _asChild,
  ...props
}: TooltipPrimitive.Trigger.Props & {
  asChild?: boolean;
}) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={render}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 4,
  side,
  align,
  ...props
}: TooltipPrimitive.Popup.Props & {
  sideOffset?: number;
  side?: TooltipPrimitive.Positioner.Props["side"];
  align?: TooltipPrimitive.Positioner.Props["align"];
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}


export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};