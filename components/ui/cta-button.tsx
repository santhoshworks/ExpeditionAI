import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ctaButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg hover:shadow-xl",
        secondary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg hover:shadow-xl",
        outline: "border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/50",
        ghost: "text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800",
        destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-lg hover:shadow-xl",
        success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 shadow-lg hover:shadow-xl",
      },
      size: {
        sm: "h-9 px-4 py-2 text-sm rounded-lg",
        default: "h-12 px-6 py-3 text-base rounded-xl",
        lg: "h-14 px-8 py-4 text-lg rounded-2xl",
        xl: "h-16 px-12 py-5 text-xl rounded-2xl",
        icon: "h-10 w-10 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface CTAButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ctaButtonVariants> {
  asChild?: boolean
}

const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(ctaButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CTAButton.displayName = "CTAButton"

export { CTAButton, ctaButtonVariants }