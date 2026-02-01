"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useExploreStore } from "@/lib/store"
import {
  MODELS,
  getAvailableModels,
  getModelById,
  type UserTier,
  type ModelOption,
} from "@/lib/constants"
import { ChevronDown, Zap, Star, Lock, Sparkles } from "lucide-react"
import Link from "next/link"

interface ModelSelectorProps {
  userTier?: UserTier
  userCredits?: number
}

export function ModelSelector({ userTier = 'free', userCredits = 0 }: ModelSelectorProps) {
  const { selectedModel, setSelectedModel } = useExploreStore()
  const availableModels = getAvailableModels(userTier)
  const currentModel = getModelById(selectedModel) || availableModels[0]

  // Group models by tier for display
  const freeModels = availableModels.filter(m => m.tier === 'free')
  const basicModels = availableModels.filter(m => m.tier === 'basic')
  const proModels = availableModels.filter(m => m.tier === 'pro')

  // Get locked models for upgrade CTA
  const lockedModels = MODELS.filter(m => !availableModels.includes(m))

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'Free':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Fast':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Premium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return ''
    }
  }

  const renderModelItem = (model: ModelOption, disabled = false) => (
    <DropdownMenuItem
      key={model.id}
      onClick={() => !disabled && setSelectedModel(model.id)}
      className={`${selectedModel === model.id ? "bg-accent" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} p-3`}
      disabled={disabled}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate text-sm">{model.name}</span>
            {model.recommended && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded flex-shrink-0">
                <Star className="h-2.5 w-2.5" />
                Best
              </span>
            )}
            {model.badge && (
              <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${getBadgeStyles(model.badge)}`}>
                {model.badge}
              </span>
            )}
            {disabled && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{model.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold">
            {model.costPerTrail === 0 ? (
              <span className="text-green-600 dark:text-green-400">Free</span>
            ) : (
              <span>{model.costPerTrail} credits</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            <Zap className="h-3 w-3" />
            {model.speed}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px] md:max-w-none">
          <div className="flex items-center gap-2 min-w-0">
            {currentModel?.badge === 'Premium' && <Sparkles className="h-3 w-3 text-orange-500 flex-shrink-0" />}
            <span className="truncate">{currentModel?.name || 'Select Model'}</span>
            {currentModel?.costPerTrail === 0 ? (
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1.5 py-0.5 rounded flex-shrink-0">
                Free
              </span>
            ) : currentModel?.costPerTrail ? (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {currentModel.costPerTrail}c
              </span>
            ) : null}
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 md:w-80 max-h-[70vh] overflow-y-auto">
        {/* Credit balance display for paid tiers */}
        {userTier !== 'free' && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
              <span>Your Balance</span>
              <span className="font-semibold text-foreground">{userCredits} credits</span>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Free models */}
        {freeModels.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Free Models
            </div>
            {freeModels.map(model => renderModelItem(model))}
          </>
        )}

        {/* Basic models */}
        {basicModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Basic Models
            </div>
            {basicModels.map(model => renderModelItem(model))}
          </>
        )}

        {/* Pro models */}
        {proModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Pro Models
            </div>
            {proModels.map(model => renderModelItem(model))}
          </>
        )}

        {/* Upgrade CTA for locked models */}
        {lockedModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked Models
            </div>
            {lockedModels.slice(0, 2).map(model => renderModelItem(model, true))}
            <div className="px-2 py-2">
              <Link href="/pricing" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Unlock {userTier === 'free' ? 'Basic & Pro' : 'Pro'} Models
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Free tier watermark */}
        {userTier === 'free' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-center text-muted-foreground">
              Powered by {currentModel?.name || 'Gemini 2.0 Flash Lite'}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
