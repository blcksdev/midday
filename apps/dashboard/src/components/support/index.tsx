"use client";

import { cn } from "@midday/ui/cn";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Support({ children }: Props) {
  return (
    <div className={cn("relative flex h-[calc(100vh-88px)] w-full")}>
      {children}
    </div>
  );
}
