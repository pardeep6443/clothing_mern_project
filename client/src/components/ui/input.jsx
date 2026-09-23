import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-none border border-[#D4D4D4] bg-white px-3.5 py-2 text-sm font-sans text-[#111111] placeholder:text-[#888888] shadow-xs transition-colors outline-none",
        "focus-visible:border-[#111111] focus-visible:ring-1 focus-visible:ring-[#111111]",
        "selection:bg-[#111111] selection:text-white",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-rose-600 aria-invalid:ring-1 aria-invalid:ring-rose-600",
        className
      )}
      {...props} />
  );
}

export { Input }
