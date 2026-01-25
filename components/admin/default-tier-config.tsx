"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { TIER_CONFIGS, type UserTier } from '@/lib/constants'
import { Loader2, Save, Settings } from 'lucide-react'

interface DefaultTierConfig {
    defaultTier: UserTier
    defaultCredits: Record<UserTier, number>
}

export function DefaultTierConfig() {
    const [config, setConfig] = useState<DefaultTierConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/admin/config')
            if (!response.ok) {
                throw new Error('Failed to fetch configuration')
            }
            const data = await response.json()
            setConfig({
                defaultTier: data.defaultTier,
                defaultCredits: data.defaultCredits
            })
        } catch (error) {
            console.error('Error fetching config:', error)
            toast({
                title: "Error",
                description: "Failed to load configuration",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!config) return

        setSaving(true)
        try {
            const response = await fetch('/api/admin/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    defaultTier: config.defaultTier,
                    defaultCredits: config.defaultCredits
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save configuration')
            }

            toast({
                title: "Success",
                description: "Default tier configuration updated successfully",
            })
        } catch (error) {
            console.error('Error saving config:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save configuration",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const updateDefaultTier = (tier: UserTier) => {
        if (!config) return
        setConfig({ ...config, defaultTier: tier })
    }

    const updateTierCredits = (tier: UserTier, credits: number) => {
        if (!config) return
        setConfig({
            ...config,
            defaultCredits: {
                ...config.defaultCredits,
                [tier]: Math.max(0, credits) // Ensure non-negative
            }
        })
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Default Tier Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!config) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Default Tier Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Failed to load configuration</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Default Tier Configuration
                </CardTitle>
                <CardDescription>
                    Configure the default tier and credits assigned to new users upon signup
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Default Tier Selection */}
                <div className="space-y-2">
                    <Label htmlFor="default-tier">Default Tier for New Users</Label>
                    <Select value={config.defaultTier} onValueChange={updateDefaultTier}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="free">
                                <div className="flex items-center gap-2">
                                    Free
                                    <Badge variant="secondary">$0</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="basic">
                                <div className="flex items-center gap-2">
                                    Basic
                                    <Badge variant="secondary">${TIER_CONFIGS.basic.price}</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="pro">
                                <div className="flex items-center gap-2">
                                    Pro
                                    <Badge variant="secondary">${TIER_CONFIGS.pro.price}</Badge>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        New users will be assigned the <Badge variant="outline">{config.defaultTier}</Badge> tier upon signup
                    </p>
                </div>

                <Separator />

                {/* Default Credits Configuration */}
                <div className="space-y-4">
                    <div>
                        <Label>Default Credits by Tier</Label>
                        <p className="text-sm text-muted-foreground">
                            Credits automatically given to new users based on their assigned tier
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {(['free', 'basic', 'pro'] as UserTier[]).map((tier) => (
                            <div key={tier} className="flex items-center gap-4">
                                <div className="w-20">
                                    <Badge variant={tier === config.defaultTier ? "default" : "outline"}>
                                        {tier}
                                    </Badge>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={config.defaultCredits[tier]}
                                        onChange={(e) => updateTierCredits(tier, parseInt(e.target.value) || 0)}
                                        className="w-32"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    credits
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Current Impact */}
                <div className="space-y-2">
                    <Label>Current Configuration Impact</Label>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">
                            New users will receive the <Badge variant="outline">{config.defaultTier}</Badge> tier
                            with <Badge variant="outline">{config.defaultCredits[config.defaultTier]} credits</Badge> automatically.
                        </p>
                        {config.defaultTier !== 'free' && (
                            <p className="text-sm text-muted-foreground mt-2">
                                ⚠️ Users will have access to premium features without payment.
                                Ensure this aligns with your business model.
                            </p>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}