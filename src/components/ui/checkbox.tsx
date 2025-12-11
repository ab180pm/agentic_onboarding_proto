"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "./utils";

const CheckIcon = () => (
  <svg
    width="12"
    height="9"
    viewBox="0 0 10 7"
    fill="#fff"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.90245 0.908503C9.17185 1.18578 9.16546 1.62895 8.88818 1.89835L4.55742 6.10598C4.28385 6.37177 3.84785 6.36962 3.57692 6.10115L1.10768 3.6543C0.833066 3.38218 0.831048 2.93897 1.10317 2.66436C1.37529 2.38975 1.8185 2.38773 2.09311 2.65985L4.07447 4.62325L7.9126 0.894229C8.18988 0.624832 8.63305 0.631223 8.90245 0.908503Z"
    />
  </svg>
);

function Checkbox({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const isChecked = checked === true;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        "peer w-5 h-5 shrink-0 rounded-sm border-2 shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked
          ? "bg-blue-600 border-blue-600"
          : "bg-white border-gray-300",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
