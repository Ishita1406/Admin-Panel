import React, { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip"
import { Card, CardHeader, CardContent } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

const STORE_POLICIES = {
  refund:
    "Refunds are available within 14 days of purchase, provided the item is unused and in original packaging.",
  return:
    "Returns are accepted within 30 days. Items must be in good condition and accompanied by a receipt.",
  exchange:
    "Exchanges can be made within 15 days for items of equal or lesser value.",
  shipping:
    "Shipping charges are non-refundable. Return shipping must be covered by the customer unless the item is defective.",
}

/* ---------- dotted tool-tip for matched policies ---------- */
function TooltipDot({ policies }) {
  if (!policies?.length) return null

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 select-none cursor-help text-xs text-muted-foreground align-super">
            ●
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {policies.map(({ topic, text }) => (
            <p key={topic} className="mb-1">
              <strong>{topic.toUpperCase()}:</strong> {text}
            </p>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/* -------------------- main component -------------------- */
export default function AICopilot({ conversation, setComposerText }) {
  const [question, setQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")

  const API_URL = import.meta.env.VITE_API_URL

  /* fetch summary whenever conversation changes */
  useEffect(() => {
    const fullText = conversation.messages
      .map((m) => `${m.from}: ${m.text}`)
      .join("\n")
    fetchSummary(fullText)
  }, [conversation])

  const fetchSummary = async (text) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Summarize this customer support conversation in 2-3 sentences for the agent's reference:\n${text}`,
                },
              ],
            },
          ],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      setSummary(
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
          "No summary available",
      )
    } catch (err) {
      console.error("Summary error:", err)
      setSummary("Could not generate summary")
    }
  }

  /* tiny helper */
  const getMatchedPolicies = (txt) => {
    if (!txt) return []
    const lowered = txt.toLowerCase()
    return Object.entries(STORE_POLICIES)
      .filter(([k]) => lowered.includes(k))
      .map(([topic, text]) => ({ topic, text }))
  }

  /* ask copilot */
  const handleAsk = async () => {
    if (!question.trim()) return

    const fullText = conversation.messages
      .map((m) => `${m.from}: ${m.text}`)
      .join("\n")
    setChatHistory((h) => [...h, { role: "user", text: question }])
    setLoading(true)

    try {
      const prompt = `As an AI assistant helping a support agent, answer this question based on the conversation history and store policies:

CONVERSATION HISTORY:
${fullText}

STORE POLICIES:
${JSON.stringify(STORE_POLICIES, null, 2)}

AGENT'S QUESTION: ${question}

Provide a concise answer focusing on the most relevant policy information. Format your response in clear markdown. If unsure, say "I'm not sure - please check with a supervisor."`

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I couldn't generate a response. Please try again."

      setChatHistory((h) => [...h, { role: "bot", text: reply }])
      // setComposerText((prev) => `${prev}\n${reply}`) // opt-in auto-insert
    } catch (err) {
      console.error("API error:", err)
      setChatHistory((h) => [
        ...h,
        { role: "bot", text: "Error connecting to AI service. Please try again later." },
      ])
    } finally {
      setLoading(false)
      setQuestion("")
    }
  }

  /* -------------------- JSX -------------------- */
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-muted/50">
      <header className="p-4">
        <h3 className="text-base font-semibold">🤖 AI Support Copilot</h3>
        <p className="text-sm text-muted-foreground">
          Ask me about policies or conversation details
        </p>
      </header>

      {/* summary card */}
      <Card className="mx-4 mb-4">
        <CardHeader className="pb-2 text-sm font-semibold">
          📌 Conversation Summary
        </CardHeader>
        <CardContent className="text-sm">{summary}</CardContent>
      </Card>

      {/* scrollable chat history */}
      <ScrollArea className="flex-1 px-4">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 rounded-md border p-2 text-sm ${
              msg.role === "user"
                ? "bg-background"
                : "bg-primary/5 border-primary/20"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Copilot"}:</strong>{" "}
            {msg.role === "bot" ? (
              <>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                <TooltipDot policies={getMatchedPolicies(msg.text)} />
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && (
          <p className="mb-2 rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Thinking&hellip;
          </p>
        )}
      </ScrollArea>

      <Separator />

      {/* question input */}
      <div className="flex items-center gap-2 p-4">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about policies or conversation..."
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          disabled={loading}
        />
        <Button size="sm" onClick={handleAsk} disabled={loading}>
          {loading ? "…" : "Ask"}
        </Button>
      </div>
    </aside>
  )
}
