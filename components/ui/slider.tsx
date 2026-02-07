"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onValueChange([Number(e.target.value)])}
          className="w-full h-2 appearance-none cursor-pointer rounded-full bg-slate-200 dark:bg-slate-700 accent-slate-900 dark:accent-slate-50
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:dark:bg-slate-50 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:shadow-sm
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:dark:bg-slate-50 [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, rgb(15, 23, 42) ${percentage}%, rgb(226, 232, 240) ${percentage}%)`,
          }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
