"use client"

import { useState } from "react"
import { DemoSessionManager } from "@/lib/demo-session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DemoTestPage() {
    const [sessionManager] = useState(() => new DemoSessionManager())
    const [topic, setTopic] = useState("Machine Learning")
    const [expeditionId, setExpeditionId] = useState("")
    const [result, setResult] = useState("")

    const createExpedition = () => {
        try {
            const expedition = sessionManager.createExpedition(topic)
            setExpeditionId(expedition.id)
            setResult(`Created expedition: ${expedition.id} - ${expedition.title}`)
        } catch (error) {
            setResult(`Error creating expedition: ${error}`)
        }
    }

    const loadExpedition = () => {
        try {
            const expedition = sessionManager.getExpedition(expeditionId)
            if (expedition) {
                setResult(`Loaded expedition: ${expedition.id} - ${expedition.title} with ${expedition.trails.length} trails`)
            } else {
                setResult(`Expedition ${expeditionId} not found`)
            }
        } catch (error) {
            setResult(`Error loading expedition: ${error}`)
        }
    }

    const checkSessionStorage = () => {
        try {
            const stored = sessionStorage.getItem('expeditionai_demo_sessions')
            if (stored) {
                const data = JSON.parse(stored)
                setResult(`Session storage contains: ${JSON.stringify(data, null, 2)}`)
            } else {
                setResult("No data in session storage")
            }
        } catch (error) {
            setResult(`Error checking session storage: ${error}`)
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Demo System Test</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Topic:</label>
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter topic"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Expedition ID:</label>
                    <Input
                        value={expeditionId}
                        onChange={(e) => setExpeditionId(e.target.value)}
                        placeholder="Expedition ID"
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={createExpedition}>Create Expedition</Button>
                    <Button onClick={loadExpedition} variant="outline">Load Expedition</Button>
                    <Button onClick={checkSessionStorage} variant="outline">Check Storage</Button>
                </div>

                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h3 className="font-medium mb-2">Result:</h3>
                    <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                </div>
            </div>
        </div>
    )
}