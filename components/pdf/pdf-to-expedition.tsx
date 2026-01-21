"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, ArrowRight, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface PdfToExpeditionProps {
    onSuccess?: (expeditionId: string) => void
}

export function PdfToExpedition({ onSuccess }: PdfToExpeditionProps) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.type !== "application/pdf") {
            toast.error("Please upload a PDF file")
            return
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error("File size must be less than 10MB")
            return
        }
        setFile(selectedFile)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append("pdf", file)

        try {
            const response = await fetch("/api/pdf-to-expedition", {
                method: "POST",
                body: formData,
            })

            const responseText = await response.text()
            let data
            try {
                data = JSON.parse(responseText)
            } catch (e) {
                console.error("Failed to parse response as JSON:", responseText)
                throw new Error(`Server responded with ${response.status}: ${responseText.slice(0, 100)}...`)
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to create expedition")
            }

            toast.success("Expedition created successfully!")

            if (onSuccess) {
                onSuccess(data.expedition.id)
            } else {
                router.push(`/expedition/${data.expedition.id}`)
            }
        } catch (error) {
            console.error("Error creating expedition:", error)
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full min-h-[200px] border-3 border-dashed rounded-3xl transition-all cursor-pointer group",
                    dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/50 hover:border-indigo-300",
                    file && "border-indigo-500 bg-indigo-50/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
            >
                <Input
                    id="pdf-upload-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                />

                {file ? (
                    <div className="flex flex-col items-center p-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none mb-4 relative">
                            <FileText className="w-8 h-8 text-indigo-500" />
                            <div
                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 cursor-pointer hover:bg-rose-600 transition-colors shadow-md"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFile(null)
                                }}
                            >
                                <X className="w-3 h-3" />
                            </div>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg mb-1">{file.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-6 text-center pointer-events-none">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100 dark:shadow-none mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-lg mb-2">
                            Drop your PDF here
                        </p>
                        <p className="text-sm text-slate-500 max-w-xs font-medium leading-relaxed">
                            or click to browse. We support research papers, articles, and textbooks up to 10MB.
                        </p>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={!file || loading}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing Document...
                    </>
                ) : (
                    <>
                        Generate Expedition
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                )}
            </Button>
        </form>
    )
}
