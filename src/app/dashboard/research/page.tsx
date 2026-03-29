'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Target, AlertTriangle, ArrowRight, Sword, ShieldAlert, Zap } from "lucide-react"

interface Competitor {
  name: string
  strength: string
  weakness: string
  valueProp: string
}

interface SummaryResult {
  goal: string
  painPoints: string[]
  nextActions: string[]
  summary: string
  competitors: Competitor[]
}

export default function ResearchPage() {
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      toast.error("Please paste a transcript first")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/research/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) throw new Error('Failed to summarize')

      const data = await response.json()
      setResult(data)
      toast.success("Full research report generated!")
    } catch (error) {
      toast.error("Error generating report")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Onboarding & Research</h1>
        <p className="text-muted-foreground">
          Generate strategic summaries and competitor battle cards using local AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Transcript</CardTitle>
          <CardDescription>
            Copy and paste the text from your discovery call transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Interviewer: Hi, thanks for joining... Prospect: No problem, we are looking to automate our lead gen..."
            className="min-h-[150px] font-mono text-sm"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <Button 
            onClick={handleSummarize} 
            disabled={isLoading || !transcript.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching & Analyzing with Ollama...
              </>
            ) : (
              "Generate Full Research Report"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Executive Summary Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              Strategic Summary
            </h2>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="leading-relaxed text-muted-foreground">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Prospect Goal</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{result.goal}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Key Pain Points</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <span className="mr-2 text-amber-600">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Competitor Intelligence Section */}
          {result.competitors && result.competitors.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <Sword className="mr-2 h-6 w-6 text-red-600" />
                Competitor Battle Cards
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {result.competitors.map((comp, i) => (
                  <Card key={i} className="flex flex-col border-red-100">
                    <CardHeader className="bg-red-50/50 pb-4">
                      <CardTitle className="text-xl text-red-900">{comp.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex-grow space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs font-bold text-green-700 uppercase tracking-wider">
                          <Zap className="mr-1 h-3 w-3" />
                          Key Strength
                        </div>
                        <p className="text-sm text-muted-foreground">{comp.strength}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-xs font-bold text-red-700 uppercase tracking-wider">
                          <ShieldAlert className="mr-1 h-3 w-3" />
                          Major Weakness
                        </div>
                        <p className="text-sm text-muted-foreground">{comp.weakness}</p>
                      </div>

                      <div className="pt-4 border-t">
                        <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-900 hover:bg-blue-100">
                          Winning Angle
                        </Badge>
                        <p className="text-sm font-medium leading-snug">
                          {comp.valueProp}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Next Actions Section */}
          <div className="space-y-6">
             <h2 className="text-2xl font-semibold flex items-center">
                <ArrowRight className="mr-2 h-6 w-6 text-blue-600" />
                Action Plan
              </h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="grid md:grid-cols-2 gap-3">
                  {result.nextActions.map((action, i) => (
                    <div key={i} className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm font-medium">
                      <div className="mr-3 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        {i + 1}
                      </div>
                      {action}
                    </div>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
