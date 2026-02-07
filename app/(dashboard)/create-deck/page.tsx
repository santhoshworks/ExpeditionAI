"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Link as LinkIcon,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Layers,
  AlertCircle,
  ExternalLink,
  FileUp,
  Upload,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

// Check feature flag
const IS_SPACED_REPETITION_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === "true";

interface GeneratedCard {
  id: string;
  front: string;
  back: string;
  sourceType: string;
  importance: number;
  tags: string[];
}

interface GenerationResult {
  cards: GeneratedCard[];
  suggestedTitle: string;
  summary: string;
  savedToDeck: boolean;
  deckId: string | null;
}

type EnhanceMode =
  | "improve_clarity"
  | "add_context"
  | "make_harder"
  | "make_easier"
  | "add_mnemonics"
  | "split_card";

const ENHANCE_OPTIONS: { mode: EnhanceMode; label: string; description: string }[] = [
  { mode: "improve_clarity", label: "Improve Clarity", description: "Make question & answer more precise" },
  { mode: "add_context", label: "Add Context", description: "Add examples and analogies" },
  { mode: "make_harder", label: "Make Harder", description: "Increase difficulty level" },
  { mode: "make_easier", label: "Make Easier", description: "Simplify for better understanding" },
  { mode: "add_mnemonics", label: "Add Mnemonics", description: "Add memory aids and tricks" },
  { mode: "split_card", label: "Split Card", description: "Break into focused sub-cards" },
];

export default function CreateDeckPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"text" | "url" | "pdf">("text");
  const [textContent, setTextContent] = useState("");
  const [url, setUrl] = useState("");
  const [deckTitle, setDeckTitle] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  // PDF state
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [pdfContent, setPdfContent] = useState<{
    title: string;
    content: string;
    pageCount: number;
  } | null>(null);
  const [pdfDragActive, setPdfDragActive] = useState(false);

  // Enhancement state
  const [enhancingCardId, setEnhancingCardId] = useState<string | null>(null);
  const [enhanceMenuCardId, setEnhanceMenuCardId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsFetchingUrl(true);
    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch URL");
      }

      const data = await response.json();
      setFetchedContent(data);
      toast.success("Content fetched successfully!");
    } catch (error) {
      console.error("URL fetch error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch URL"
      );
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // PDF handlers
  const handlePdfDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPdfDragActive(true);
    } else if (e.type === "dragleave") {
      setPdfDragActive(false);
    }
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPdfDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".pdf")) {
        setSelectedPdf(file);
        parsePdf(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".pdf")) {
        setSelectedPdf(file);
        parsePdf(file);
      } else {
        toast.error("Please upload a PDF file");
        e.target.value = "";
      }
    }
  };

  const parsePdf = async (file: File) => {
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to parse PDF");
      }

      const data = await response.json();
      setPdfContent(data);
      toast.success(`Extracted text from ${data.pageCount} pages`);
    } catch (error) {
      console.error("PDF parse error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse PDF"
      );
      setSelectedPdf(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = async () => {
    let content: string | undefined;
    let sourceTitle: string | undefined;
    let sourceUrl: string | undefined;

    if (activeTab === "text") {
      content = textContent;
      sourceTitle = deckTitle || undefined;
    } else if (activeTab === "url") {
      content = fetchedContent?.content;
      sourceTitle = fetchedContent?.title;
      sourceUrl = url;
    } else if (activeTab === "pdf") {
      content = pdfContent?.content;
      sourceTitle = pdfContent?.title;
    }

    if (!content || content.trim().length < 10) {
      toast.error("Please provide content to generate flashcards from");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/flashcards/generate-from-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sourceUrl,
          sourceTitle,
          cardCount,
          deckTitle: deckTitle || undefined,
          autoSave: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate flashcards");
      }

      const data = await response.json();
      setResult(data);
      toast.success(`Generated ${data.cards.length} flashcards!`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate flashcards"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Card enhancement handler
  const handleEnhanceCard = async (card: GeneratedCard, mode: EnhanceMode) => {
    setEnhancingCardId(card.id);
    setEnhanceMenuCardId(null);

    try {
      const response = await fetch("/api/flashcards/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: card.front,
          back: card.back,
          enhanceMode: mode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enhance card");
      }

      const data = await response.json();

      if (mode === "split_card" && data.enhanced.cards) {
        // Replace the card with multiple new cards
        setResult((prev) => {
          if (!prev) return prev;
          const cardIndex = prev.cards.findIndex((c) => c.id === card.id);
          if (cardIndex === -1) return prev;

          const newCards = data.enhanced.cards.map(
            (c: { front: string; back: string }, i: number) => ({
              ...card,
              id: `${card.id}-split-${i}`,
              front: c.front,
              back: c.back,
            })
          );

          const updatedCards = [...prev.cards];
          updatedCards.splice(cardIndex, 1, ...newCards);
          return { ...prev, cards: updatedCards };
        });
        toast.success(`Card split into ${data.enhanced.cards.length} cards`);
      } else {
        // Update the existing card
        setResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map((c) =>
              c.id === card.id
                ? { ...c, front: data.enhanced.front, back: data.enhanced.back }
                : c
            ),
          };
        });
        toast.success("Card enhanced!");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to enhance card"
      );
    } finally {
      setEnhancingCardId(null);
    }
  };

  const toggleCardExpanded = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const isGenerateDisabled =
    isLoading ||
    (activeTab === "text" && textContent.trim().length < 10) ||
    (activeTab === "url" && !fetchedContent) ||
    (activeTab === "pdf" && !pdfContent);

  // Success view
  if (result) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
            <div className={`p-3 rounded-xl ${result.savedToDeck ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
              {result.savedToDeck ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {result.savedToDeck ? "Deck Created Successfully!" : "Cards Generated"}
              </h1>
              <p className="text-slate-500">
                {result.cards.length} cards generated{result.savedToDeck ? " and saved" : " — failed to save to database"}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {result.suggestedTitle || deckTitle || "New Deck"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {result.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.cards
                .flatMap((c) => c.tags)
                .filter((tag, i, arr) => arr.indexOf(tag) === i)
                .slice(0, 10)
                .map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview cards with enhancement */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cards</h3>
            <p className="text-sm text-slate-500">
              Click <Wand2 className="inline h-3.5 w-3.5" /> to enhance any card with AI
            </p>
          </div>
          <div className="space-y-3">
            {result.cards.map((card, index) => {
              const isExpanded = expandedCards.has(card.id);
              const isEnhancing = enhancingCardId === card.id;
              const showEnhanceMenu = enhanceMenuCardId === card.id;

              return (
                <Card key={card.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white mb-2">
                          {card.front}
                        </p>
                        {isExpanded && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {card.back}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            card.importance >= 4
                              ? "border-red-200 text-red-600"
                              : card.importance >= 3
                              ? "border-amber-200 text-amber-600"
                              : "border-slate-200 text-slate-600"
                          }
                        >
                          {card.importance >= 4
                            ? "Important"
                            : card.importance >= 3
                            ? "Standard"
                            : "Optional"}
                        </Badge>

                        {/* Expand/collapse */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleCardExpanded(card.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Enhance button */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                            disabled={isEnhancing}
                            onClick={() =>
                              setEnhanceMenuCardId(
                                showEnhanceMenu ? null : card.id
                              )
                            }
                          >
                            {isEnhancing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Enhancement dropdown */}
                          {showEnhanceMenu && (
                            <div className="absolute right-0 top-full mt-1 z-10 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1">
                              {ENHANCE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.mode}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                  onClick={() =>
                                    handleEnhanceCard(card, opt.mode)
                                  }
                                >
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {opt.label}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {opt.description}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

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
              setTextContent("");
              setUrl("");
              setFetchedContent(null);
              setDeckTitle("");
              setSelectedPdf(null);
              setPdfContent(null);
              setExpandedCards(new Set());
            }}
            className="flex-1"
          >
            Create Another Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
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
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Flashcards with AI
            </h1>
            <p className="text-slate-500">
              Generate flashcards from text, URL, or PDF
            </p>
          </div>
        </div>
      </div>

      {/* Source tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "text" | "url" | "pdf")}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            Paste Text
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FileUp className="h-4 w-4" />
            Upload PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Label htmlFor="content" className="mb-2 block">
                Paste your study material
              </Label>
              <Textarea
                id="content"
                placeholder="Paste any text content here - lecture notes, article text, book excerpts, Wikipedia content, etc..."
                className="min-h-[200px] resize-y"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">
                {textContent.length} characters
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="url" className="mb-2 block">
                  Enter URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl || !url.trim()}
                    variant="outline"
                  >
                    {isFetchingUrl ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Fetch
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {fetchedContent && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Content fetched: {fetchedContent.title}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        {fetchedContent.content.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        {fetchedContent.content.length} characters extracted
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  pdfDragActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : pdfContent
                    ? "border-green-300 bg-green-50 dark:bg-green-950/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
                onDragEnter={handlePdfDrag}
                onDragLeave={handlePdfDrag}
                onDragOver={handlePdfDrag}
                onDrop={handlePdfDrop}
              >
                {isParsing ? (
                  <div className="space-y-3">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="font-medium text-slate-900 dark:text-white">
                      Extracting text from PDF...
                    </p>
                  </div>
                ) : pdfContent ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="font-medium text-green-800 dark:text-green-300">
                      {pdfContent.title}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {pdfContent.pageCount} pages &middot; {pdfContent.content.length} characters extracted
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {pdfContent.content.substring(0, 150)}...
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPdf(null);
                        setPdfContent(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
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
                        Drag and drop your PDF here
                      </p>
                      <p className="text-sm text-slate-500">
                        Textbooks, papers, lecture slides (max 10MB)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select PDF
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handlePdfSelect}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="deckTitle" className="mb-2 block">
              Deck Title (optional)
            </Label>
            <Input
              id="deckTitle"
              placeholder="AI will suggest a title if left empty"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2 block">
              Number of cards: <strong>{cardCount}</strong>
            </Label>
            <Slider
              value={[cardCount]}
              onValueChange={(v) => setCardCount(v[0])}
              min={5}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 cards</span>
              <span>30 cards</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerateDisabled}
        className="w-full h-12 gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating flashcards...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate {cardCount} Flashcards
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-500 mt-4">
        Cards are automatically saved for spaced repetition
      </p>
    </div>
  );
}
