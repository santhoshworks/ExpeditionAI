"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Layers,
  AlertCircle,
  FileUp,
  HardDrive,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// Check feature flag
const IS_SPACED_REPETITION_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === "true";

interface ImportResult {
  success: boolean;
  deckId: string;
  deckTitle: string;
  cardsImported: number;
  message: string;
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deckTitle, setDeckTitle] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Redirect if feature is disabled
  if (!IS_SPACED_REPETITION_ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Feature Not Available</h2>
        <p className="text-slate-500 mb-4">
          Spaced repetition features are not enabled.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".apkg")) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload an Anki .apkg file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".apkg")) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload an Anki .apkg file");
        e.target.value = "";
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (deckTitle.trim()) {
        formData.append("deckTitle", deckTitle.trim());
      }

      const response = await fetch("/api/import/anki", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      toast.success(data.message);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import deck"
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Success view
  if (result) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Import Successful!
              </h1>
              <p className="text-slate-500">
                {result.cardsImported} cards imported
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {result.deckTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">
              {result.message}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/review" className="flex-1">
            <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
              <Sparkles className="h-4 w-4" />
              Start Reviewing
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setSelectedFile(null);
              setDeckTitle("");
            }}
            className="flex-1"
          >
            Import Another Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <HardDrive className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Import from Anki
            </h1>
            <p className="text-slate-500">
              Upload your .apkg file to import flashcards
            </p>
          </div>
        </div>
      </div>

      {/* File upload area */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                : selectedFile
                ? "border-green-300 bg-green-50 dark:bg-green-950/30"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <FileUp className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    Drag and drop your .apkg file here
                  </p>
                  <p className="text-sm text-slate-500">or click to browse</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".apkg"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="deckTitle" className="mb-2 block">
              Deck Title (optional)
            </Label>
            <Input
              id="deckTitle"
              placeholder="Uses original Anki deck name if left empty"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import button */}
      <Button
        onClick={handleImport}
        disabled={isImporting || !selectedFile}
        className="w-full h-12 gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        {isImporting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Import Deck
          </>
        )}
      </Button>

      {/* Help text */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
        <h3 className="font-medium text-slate-900 dark:text-white mb-2">
          How to export from Anki
        </h3>
        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
          <li>Open Anki on your computer</li>
          <li>Click File → Export</li>
          <li>Select the deck you want to export</li>
          <li>Choose &quot;Anki Deck Package (*.apkg)&quot; format</li>
          <li>Check &quot;Include scheduling information&quot;</li>
          <li>Click Export and save the file</li>
        </ol>
      </div>
    </div>
  );
}
