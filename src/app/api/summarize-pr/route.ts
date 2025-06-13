import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function parseGitHubPRUrl(url: string) {
  const match = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
  if (!match) {
    throw new Error("Invalid GitHub PR URL format.");
  }
  return {
    owner: match[1],
    repo: match[2],
    prNumber: match[3]
  };
}

async function fetchPRMetadata(owner: string, repo: string, prNumber: string) {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json"
  };
  
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PR metadata: ${response.statusText}`);
  }
  
  return response.json();
}

async function fetchPRDiff(owner: string, repo: string, prNumber: string) {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3.diff"
  };
  
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PR diff: ${response.statusText}`);
  }
  
  return response.text();
}

async function summarizeWithOpenAI(title: string, body: string, diff: string) {
  // Limit diff length to ~8000 characters to stay within GPT-4's context
  const truncatedDiff = diff.substring(0, 8000);

  const prompt = `
You are a senior software engineer. Summarize the following GitHub pull request.

### Title:
${title}

### Description:
${body}

### Code Diff:
${truncatedDiff}

### Summary:
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an expert code reviewer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  return response.choices[0].message.content?.trim() || '';
}

export async function POST(request: NextRequest) {
  try {
    const { prUrl } = await request.json();
    
    if (!prUrl) {
      return NextResponse.json({ error: 'PR URL is required' }, { status: 400 });
    }

    const { owner, repo, prNumber } = parseGitHubPRUrl(prUrl);
    const metadata = await fetchPRMetadata(owner, repo, prNumber);
    const diff = await fetchPRDiff(owner, repo, prNumber);

    const title = metadata.title;
    const body = metadata.body || '';

    const summary = await summarizeWithOpenAI(title, body, diff);

    return NextResponse.json({
      summary,
      metadata: {
        title,
        body,
        number: metadata.number,
        user: metadata.user,
        created_at: metadata.created_at,
        updated_at: metadata.updated_at,
        additions: metadata.additions,
        deletions: metadata.deletions,
        changed_files: metadata.changed_files
      }
    });

  } catch (error) {
    console.error('Error summarizing PR:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize PR' },
      { status: 500 }
    );
  }
} 