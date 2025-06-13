"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

interface PRSummaryData {
  summary: string;
  metadata: {
    title: string;
    body: string;
    number: number;
    user: { login: string };
    created_at: string;
    updated_at: string;
    additions: number;
    deletions: number;
    changed_files: number;
  };
}

export default function PRSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const prNumber = params.number as string;
  const prUrl = searchParams.get('url');
  
  const [summaryData, setSummaryData] = useState<PRSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!prUrl) {
        setError('PR URL is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/summarize-pr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to summarize PR');
        }

        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
        setError(error instanceof Error ? error.message : 'Failed to summarize PR');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [prUrl]);

  return (
    <div className="min-h-screen" style={{ background: '#fbfbf5' }}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/dashboard/repository/${owner}/${repo}`)}
            className="text-neutral-400 hover:text-black transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">
              PR Summary - #{prNumber}
            </h1>
            <p className="text-neutral-600">
              AI-generated summary for {owner}/{repo}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-neutral-600">Analyzing pull request with AI...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-red-600">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : summaryData ? (
            <div className="space-y-8">
              {/* PR Metadata */}
              <div className="border-b border-neutral-200 pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-2">
                      #{summaryData.metadata.number}: {summaryData.metadata.title}
                    </h2>
                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                      <span>by {summaryData.metadata.user.login}</span>
                      <span>{new Date(summaryData.metadata.created_at).toLocaleDateString()}</span>
                      <span className="text-green-600">+{summaryData.metadata.additions}</span>
                      <span className="text-red-600">-{summaryData.metadata.deletions}</span>
                      <span>{summaryData.metadata.changed_files} files</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/dashboard/repository/${owner}/${repo}/pr/${prNumber}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View Diff
                    </button>
                  </div>
                </div>
                
                {summaryData.metadata.body && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="font-medium text-neutral-800 mb-2">Description</h3>
                    <p className="text-neutral-600 leading-relaxed">{summaryData.metadata.body}</p>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black">AI Summary</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    Generated by GPT-4
                  </span>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="prose prose-neutral max-w-none">
                    <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed">
                      {summaryData.summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-neutral-200">
                <button
                  onClick={() => navigator.clipboard.writeText(summaryData.summary)}
                  className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copy Summary
                </button>
                <button
                  onClick={() => window.open(prUrl || '', '_blank')}
                  className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open on GitHub
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 