"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GitHubService, GitHubPullRequest } from "../../../../../lib/github";

export default function RepositoryPRsPage() {
  const router = useRouter();
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      setIsLoading(true);
      try {
        const prs = await GitHubService.getPullRequests(owner, repo, 'open');
        setPullRequests(prs);
      } catch (error) {
        console.error('Error fetching pull requests:', error);
        // Fallback to mock data
        setPullRequests([
          {
            id: 1,
            number: 42,
            title: "Add new feature for user authentication",
            body: "This PR adds OAuth integration and improves security",
            state: 'open',
            user: { login: owner, avatar_url: "" },
            created_at: "2024-12-15T10:30:00Z",
            updated_at: "2024-12-15T14:20:00Z",
            head: { ref: "feature/auth", sha: "abc123" },
            base: { ref: "main", sha: "def456" },
            html_url: "",
            additions: 156,
            deletions: 23,
            changed_files: 8
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (owner && repo) {
      fetchPRs();
    }
  }, [owner, repo]);

  const handlePRClick = (pr: GitHubPullRequest) => {
    router.push(`/dashboard/repository/${owner}/${repo}/pr/${pr.number}`);
  };

  const handleSummarizePR = (pr: GitHubPullRequest) => {
    const prUrl = `https://github.com/${owner}/${repo}/pull/${pr.number}`;
    router.push(`/dashboard/repository/${owner}/${repo}/pr/${pr.number}/summary?url=${encodeURIComponent(prUrl)}`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#fbfbf5' }}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard?view=repositories')}
            className="text-neutral-400 hover:text-black transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">
              Open Pull Requests - {owner}/{repo}
            </h1>
            <p className="text-neutral-600">Manage and review pull requests for this repository</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pullRequests.length > 0 ? (
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <div 
                  key={pr.id} 
                  className="border border-neutral-200 rounded-lg p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          #{pr.number}
                        </span>
                        <h3 className="text-xl font-semibold text-black">{pr.title}</h3>
                      </div>
                      <p className="text-neutral-600 mb-4 leading-relaxed">{pr.body}</p>
                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <span>by {pr.user.login}</span>
                        <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                        <span>{pr.changed_files} files</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <span className="text-sm bg-neutral-100 px-3 py-1 rounded">
                        {pr.head.ref} → {pr.base.ref}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handlePRClick(pr)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View Diff
                    </button>
                    <button
                      onClick={() => handleSummarizePR(pr)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Summarize PR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-600">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No open pull requests</h3>
              <p>This repository doesn't have any open pull requests at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 