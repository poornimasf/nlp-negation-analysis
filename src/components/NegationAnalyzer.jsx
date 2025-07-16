import { useState, useCallback } from "react";
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
import * as XLSX from 'xlsx';

// [Previous imports and component definition remain the same]
// [All the functions and state definitions remain the same]

export default function NegationAnalyzer() {
  // [All the existing state and function definitions remain the same until the return statement]

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

      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-blue-800">Training Data Management</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Training Data (Excel)</label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full"
              />
              {uploadError && (
                <p className="text-red-500 text-sm mt-1">{uploadError}</p>
              )}
            </div>

            {trainingStats.totalExamples > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Training Data Statistics</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total examples: {trainingStats.totalExamples}</li>
                  {Object.entries(trainingStats.byLanguage).map(([lang, count]) => (
                    <li key={lang}>{lang}: {count} examples</li>
                  ))}
                  <li>Last updated: {new Date(trainingStats.lastUpdated).toLocaleString()}</li>
                </ul>
              </div>
            )}

            {Object.keys(learnedPatterns).map(lang => (
              learnedPatterns[lang].logical.length > 0 || learnedPatterns[lang].expletive.length > 0 ? (
                <div key={lang} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Learned Patterns - {lang}</h4>
                  <div className="space-y-2 text-sm">
                    <p>Logical negation patterns: {learnedPatterns[lang].logical.length}</p>
                    <p>Expletive negation patterns: {learnedPatterns[lang].expletive.length}</p>
                  </div>
                </div>
              ) : null
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
