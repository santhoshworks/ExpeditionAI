"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Code, Copy, Eye, AlertCircle } from "lucide-react"
import type { Expedition } from "@/types/database"

interface EmbedCodeModalProps {
    expedition: Expedition & { public_slug?: string }
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Helper function to escape HTML entities for XSS protection
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

// Validate dimension input
function validateDimension(value: string, min: number = 200, max: number = 2000): { valid: boolean; value: number } {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < min) {
        return { valid: false, value: min }
    }
    if (num > max) {
        return { valid: false, value: max }
    }
    return { valid: true, value: num }
}

export function EmbedCodeModal({ expedition, open, onOpenChange }: EmbedCodeModalProps) {
    const [width, setWidth] = useState("600")
    const [height, setHeight] = useState("400")
    const [theme, setTheme] = useState<"light" | "dark">("light")

    // Validate dimensions
    const widthValidation = useMemo(() => validateDimension(width), [width])
    const heightValidation = useMemo(() => validateDimension(height), [height])

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const embedUrl = `${baseUrl}/embed/${expedition.public_slug}?theme=${theme}`

    const generateEmbedCode = () => {
        const safeTitle = escapeHtml(expedition.title)
        const safeWidth = widthValidation.value
        const safeHeight = heightValidation.value

        return `<iframe
  src="${embedUrl}"
  width="${safeWidth}"
  height="${safeHeight}"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="${safeTitle} - Learning Expedition"
  loading="lazy">
</iframe>`
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Code copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy code")
        }
    }

    const embedCode = generateEmbedCode()

    if (!expedition.public_slug) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl text-white">
                                <Code className="h-6 w-6" />
                                Embed Code
                            </DialogTitle>
                            <DialogDescription className="text-slate-300">
                                This expedition needs to be public before it can be embedded.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6 text-center">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 mb-6">
                            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                Make your expedition public first, then you can generate embed codes to share it on websites and blogs.
                            </p>
                        </div>
                        <Button onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-6 font-bold">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Code className="h-6 w-6" />
                            Embed Your Expedition
                        </DialogTitle>
                        <DialogDescription className="text-slate-300">
                            Add this interactive learning map to your website, blog, or documentation.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customization Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="width" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                Width (px)
                            </label>
                            <Input
                                id="width"
                                type="number"
                                min="200"
                                max="2000"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                placeholder="600"
                                className={`rounded-xl h-11 ${!widthValidation.valid ? 'border-amber-500' : ''}`}
                            />
                            {!widthValidation.valid && (
                                <p className="text-xs text-amber-600">Using {widthValidation.value}px</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="height" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                Height (px)
                            </label>
                            <Input
                                id="height"
                                type="number"
                                min="200"
                                max="2000"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="400"
                                className={`rounded-xl h-11 ${!heightValidation.valid ? 'border-amber-500' : ''}`}
                            />
                            {!heightValidation.valid && (
                                <p className="text-xs text-amber-600">Using {heightValidation.value}px</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                Theme
                            </label>
                            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
                                <SelectTrigger className="rounded-xl h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            Preview
                        </label>
                        <div className={`border rounded-2xl p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <iframe
                                src={embedUrl}
                                width={Math.min(widthValidation.value, 500)}
                                height={Math.min(heightValidation.value, 300)}
                                frameBorder="0"
                                className="rounded-xl shadow-sm mx-auto block"
                                title={`${expedition.title} - Learning Expedition Preview`}
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Embed Code */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            Embed Code
                        </label>
                        <div className="relative">
                            <Textarea
                                value={embedCode}
                                readOnly
                                rows={7}
                                className="font-mono text-sm resize-none rounded-xl border-slate-200 dark:border-slate-800 pr-20"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 rounded-lg h-8"
                                onClick={() => copyToClipboard(embedCode)}
                            >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                            </Button>
                        </div>
                    </div>

                    {/* Usage Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2">How to use:</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                            <li>1. Copy the embed code above</li>
                            <li>2. Paste it into your website's HTML</li>
                            <li>3. The interactive map will appear on your page</li>
                            <li>4. Visitors can explore and click to view the full expedition</li>
                        </ul>
                    </div>

                    {/* Direct Link */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            Direct Link
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={embedUrl}
                                readOnly
                                className="font-mono text-sm rounded-xl h-11"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(embedUrl)}
                                className="h-11 w-11 rounded-xl"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11">
                            Close
                        </Button>
                        <Button onClick={() => copyToClipboard(embedCode)} className="rounded-xl h-11 bg-slate-900 hover:bg-slate-800 font-bold">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Embed Code
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
