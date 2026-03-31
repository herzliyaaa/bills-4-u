// /components/ui/input.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Define input variants with CVA
const inputVariants = cva(
  "flex w-full rounded-md border px-3 py-2 text-sm",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white text-gray-900",
        outline: "border-gray-400 bg-gray-50 text-gray-900 focus:border-amber-500 focus:ring-amber-500",
        ghost: "border-none bg-transparent text-gray-900 focus:ring-amber-500",
        error: "border-red-500 bg-white text-gray-900 focus:ring-red-500",
      },
      size: {
        default: "h-10 px-3 py-2 text-sm",
        sm: "h-8 px-2 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  asChild?: boolean
}

// Input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "input"
    return (
      <Comp
        ref={ref}
        className={cn(inputVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }