"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-y-1", className)}
        {...props}
    />
))
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("border-b", className)}
        {...props}
    />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    return (
        <div className="flex">
            <button
                ref={ref}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
    >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
))
AccordionContent.displayName = "AccordionContent"

// Simple State Wrapper for the FAQ page since we aren't using Radix currently
export function AccordionWrapper({ children }: { children: React.ReactNode }) {
    const [openItem, setOpenItem] = React.useState<string | null>(null)

    return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
            const isOpen = openItem === child.props.value
            return React.cloneElement(child as React.ReactElement<any>, {
                children: React.Children.map(child.props.children, (innerChild) => {
                    if (React.isValidElement(innerChild)) {
                        if (innerChild.type === AccordionTrigger) {
                            return React.cloneElement(innerChild as React.ReactElement<any>, {
                                onClick: () => setOpenItem(isOpen ? null : child.props.value),
                                "data-state": isOpen ? "open" : "closed",
                            })
                        }
                        if (innerChild.type === AccordionContent) {
                            return isOpen ? innerChild : null
                        }
                    }
                    return innerChild
                }),
            })
        }
        return child
    })
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
