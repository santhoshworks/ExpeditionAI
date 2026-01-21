"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestPDFPage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const testPDF = async () => {
        if (!file) {
            setResult("Please select a PDF file")
            return
        }

        setIsProcessing(true)
        setResult("Processing PDF...")

        try {
            const formData = new FormData()
            formData.append("pdf", file)

            const response = await fetch("/api/test-pdf", {
                method: "POST",
                body: formData
            })

            const data = await response.json()
            setResult(JSON.stringify(data, null, 2))
        } catch (error) {
            setResult(`Error: ${error}`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">PDF Processing Test</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Select PDF File:</label>
                    <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                    />
                </div>

                <Button
                    onClick={testPDF}
                    disabled={!file || isProcessing}
                >
                    {isProcessing ? "Processing..." : "Test PDF Processing"}
                </Button>

                {file && (
                    <div className="text-sm text-gray-600">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                )}

                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h3 className="font-medium mb-2">Result:</h3>
                    <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">{result}</pre>
                </div>
            </div>
        </div>
    )
}