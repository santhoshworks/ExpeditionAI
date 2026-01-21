"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Share2, Copy, Globe, Lock } from "lucide-react"
import type { Expedition } from "@/types/database"

interface ShareExpeditionModalProps {
    expedition: Expedition & { is_public?: boolean; public_slug?: string; public_description?: string }
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: (expedition: Partial<Expedition>) => void
}

export function ShareExpeditionModal({
    expedition,
    open,
    onOpenChange,
    onUpdate
}: ShareExpeditionModalProps) {
    const [isPublic, setIsPublic] = useState(expedition.is_public || false)
    const [publicDescription, setPublicDescription] = useState(expedition.public_description || "")
    const [loading, setLoading] = useState(false)
    const [publicUrl, setPublicUrl] = useState("")

    const handleTogglePublic = async () => {
        setLoading(true)
        const supabase = createClient()

        try {
            let updateData: any = {
                is_public: !isPublic,
                updated_at: new Date().toISOString()
            }

            // If making public and no slug exists, generate one
            if (!isPublic && !expedition.public_slug) {
                const { data: slugData, error: slugError } = await supabase
                    .rpc('generate_expedition_slug', { title: expedition.title })

                if (slugError) throw slugError
                updateData.public_slug = slugData
            }

            // Add description if provided when making public
            if (!isPublic && publicDescription.trim()) {
                // Making public - save the description
                updateData.public_description = publicDescription.trim()
            }

            const { error } = await supabase
                .from('expeditions')
                .update(updateData)
                .eq('id', expedition.id)

            if (error) throw error

            const newIsPublic = !isPublic
            setIsPublic(newIsPublic)

            if (newIsPublic) {
                const slug = updateData.public_slug || expedition.public_slug
                const url = `${window.location.origin}/explore/${slug}`
                setPublicUrl(url)
                toast.success("Expedition is now public!")
            } else {
                setPublicUrl("")
                toast.success("Expedition is now private")
            }

            // Notify parent component
            onUpdate?.({
                ...expedition,
                is_public: newIsPublic,
                public_slug: updateData.public_slug || expedition.public_slug,
                public_description: updateData.public_description || expedition.public_description
            })

        } catch (error) {
            console.error('Error updating expedition visibility:', error)
            toast.error("Failed to update expedition visibility")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateDescription = async () => {
        if (!isPublic) return

        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('expeditions')
                .update({
                    public_description: publicDescription.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', expedition.id)

            if (error) throw error

            toast.success("Description updated!")
            onUpdate?.({
                ...expedition,
                public_description: publicDescription.trim() || null
            })

        } catch (error) {
            console.error('Error updating description:', error)
            toast.error("Failed to update description")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    // Set public URL when modal opens if expedition is already public
    useEffect(() => {
        if (expedition.is_public && expedition.public_slug) {
            setPublicUrl(`${window.location.origin}/explore/${expedition.public_slug}`)
        }
    }, [expedition.is_public, expedition.public_slug, open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Expedition
                    </DialogTitle>
                    <DialogDescription>
                        Make your learning journey public so others can explore and learn from it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Public Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                {isPublic ? (
                                    <>
                                        <Globe className="h-4 w-4 text-green-500" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 text-slate-500" />
                                        Private
                                    </>
                                )}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {isPublic
                                    ? "Anyone can view this expedition"
                                    : "Only you can access this expedition"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={isPublic}
                            onCheckedChange={handleTogglePublic}
                            disabled={loading}
                        />
                    </div>

                    {/* Public Description */}
                    {(isPublic || !isPublic) && (
                        <div className="space-y-2">
                            <Label htmlFor="description">Public Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what others will learn from this expedition..."
                                value={publicDescription}
                                onChange={(e) => setPublicDescription(e.target.value)}
                                rows={3}
                                disabled={loading}
                            />
                            {isPublic && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdateDescription}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    Update Description
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Public URL */}
                    {isPublic && publicUrl && (
                        <div className="space-y-2">
                            <Label>Public Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={publicUrl}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(publicUrl)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Share this link with others to let them explore your expedition
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        {isPublic && publicUrl && (
                            <Button onClick={() => copyToClipboard(publicUrl)}>
                                Copy Link
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}