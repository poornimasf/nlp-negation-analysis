import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NegationAnalyzer() {
  const [inputText, setInputText] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [language, setLanguage] = useState("french");
  const [result, setResult] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [batchResults, setBatchResults] = useState([]);

  const TRIGGERS = {
    french: {
      en: ["craindre", "avoir peur que", "peur que", "redouter", "avant que", "regretter"],
      nonEn: ["commencer", "arrêter", "cesser", "décider", "oublier"],
    },
    english: {
      en: ["afraid", "fear", "regret", "prevent", "before"],
      nonEn: ["start", "stop", "decide", "quit"],
    },
    mandarin: {
      en: ["怕", "抱歉", "避免", "前"],
      nonEn: ["开始", "停止", "决定"],
    },
  };

  function hasNegation(text, lang) {
    const patterns = {
      french: /\bne\b([^a-zA-Z]|\s|$)/i,
      english: /\bnot\b|\bnever\b|\bno\b|\bnobody\b/i,
      mandarin: /不|没|别/,
    };
    return patterns[lang].test(text);
  }

  function extractComplement(text, trigger) {
    const idx = text.indexOf(trigger);
    if (idx === -1) return "";
    const after = text.slice(idx + trigger.length);
    return after.split(/[.?!]/)[0];
  }

  function highlight(text, lang) {
    let output = text;
    const triggerList = [...TRIGGERS[lang].en, ...TRIGGERS[lang].nonEn];
    for (const trig of triggerList) {
      const re = new RegExp(`(${trig})`, "gi");
      output = output.replace(re, '<mark class="bg-yellow-100 text-yellow-900">$1</mark>');
    }
    if (lang === "french") {
      output = output.replace(/\b(ne)\b/gi, '<mark class="bg-green-100 text-green-900">$1</mark>');
    }
    return output;
  }

  function classifyNegation(text, lang) {
    const lowerText = text.toLowerCase();
    const enTrigger = TRIGGERS[lang].en.find(trigger => lowerText.includes(trigger));
    const nonEnTrigger = TRIGGERS[lang].nonEn.find(trigger => lowerText.includes(trigger));
    const negation = hasNegation(lowerText, lang);
    if (!negation) return "No negation detected.";

    const matchedTrigger = enTrigger || nonEnTrigger || "";
    const relevantClause = extractComplement(lowerText, matchedTrigger);
    const clauseHasNeg = hasNegation(relevantClause, lang);

    const isFullNegation = /\bne\b[^.?!]{0,15}\b(pas|rien|jamais|plus|personne|aucun|guère)\b/i.test(relevantClause);
    if (isFullNegation) return "Logically consistent negation. Not expletive.";

    if (!clauseHasNeg) return "Negation found, but not in the complement clause. No expletive negation.";

    if (/\bpeur que\b[^.?!]*\b(il|elle|je|tu|nous|vous|ils|elles)\b[^.?!]{0,10}\b(s'agisse|soit|ait|aille|vienne|tombe|manque)\b/i.test(lowerText) && !/\bne\b/i.test(relevantClause)) {
      return "EN-trigger + logically consistent negation";
    }

    if (enTrigger) {
      if (/\b(peur|craindre|redouter|regretter) que\b[^.?!]*\bne\b(?!\s+(pas|rien|jamais|plus|aucun))/i.test(lowerText)) {
        return "EN-trigger + expletive negation";
      }
      return "EN-trigger + logically consistent negation";
    } else if (nonEnTrigger) {
      return "Non-EN-trigger + logically inconsistent negation";
    } else {
      return "Trigger not clearly identified.";
    }
  }

  const handleAnalyze = () => {
    const classification = classifyNegation(inputText, language);
    setResult(classification);
    setHighlightedText(highlight(inputText, language));
  };

  const handleBatchAnalyze = () => {
    const sentences = batchInput.split("\n").filter(Boolean);
    const results = sentences.map((sentence, index) => ({
      id: index + 1,
      text: sentence,
      label: classifyNegation(sentence, language),
    }));
    setBatchResults(results);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 space-y-10">
      <Card className="bg-card shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Multilingual Expletive Negation Analyzer</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Select Language</label>
            <Select onValueChange={(val) => setLanguage(val)} defaultValue="french">
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="french">🇫🇷 French</SelectItem>
                <SelectItem value="english">🇺🇸 English</SelectItem>
                <SelectItem value="mandarin">🇨🇳 Mandarin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Enter Sentence:</label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a sentence with a negation..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAnalyze} className="bg-blue-600 hover:bg-blue-700 text-white">
                Evaluate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-muted shadow">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="font-semibold text-lg">Classification Result:</p>
              <p>{result}</p>
            </div>
            <div>
              <p className="font-semibold text-lg">Highlighted Sentence:</p>
              <p dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-800">Batch Evaluation</h3>
          <label className="block text-sm font-medium mb-1">Enter Sentences (one per line)</label>
          <Textarea
            rows={6}
            placeholder="One sentence per line..."
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleBatchAnalyze}>Evaluate Batch</Button>
          {batchResults.length > 0 && (
            <table className="w-full mt-4 table-auto border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">#</th>
                  <th className="border px-3 py-2 text-left">Sentence</th>
                  <th className="border px-3 py-2 text-left">Classification</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map(({ id, text, label }) => (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{id}</td>
                    <td className="border px-3 py-2">{text}</td>
                    <td className="border px-3 py-2 italic text-gray-600">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
