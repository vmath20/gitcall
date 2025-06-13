import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface CodeComment {
  line: number;
  content: string;
  type: 'suggestion' | 'issue' | 'praise' | 'question';
}

async function fetchPRFiles(owner: string, repo: string, prNumber: string) {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json"
  };
  
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PR files: ${response.statusText}`);
  }
  
  return response.json();
}

async function generateCommentsForFile(filename: string, patch: string): Promise<CodeComment[]> {
  const prompt = `You are an expert code reviewer. Analyze the following code diff and provide constructive feedback.

File: ${filename}
Diff:
${patch}

Please provide specific, actionable code review comments. For each comment, specify:
1. The line number (relative to the diff)
2. The type of comment (suggestion, issue, praise, or question)
3. The comment content

Focus on:
- Code quality and best practices
- Potential bugs or security issues
- Performance improvements
- Code clarity and maintainability
- Positive feedback for good practices

Format your response as a JSON array of objects with this structure:
[
  {
    "line": 5,
    "type": "suggestion",
    "content": "Consider using const instead of let for variables that don't change."
  }
]

Only include comments that add real value. Don't comment on every line.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert code reviewer. Provide constructive, specific feedback in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content?.trim() || '[]';
    
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating comments:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, prNumber } = await request.json();
    
    if (!owner || !repo || !prNumber) {
      return NextResponse.json({ error: 'Owner, repo, and PR number are required' }, { status: 400 });
    }

    // Fetch PR files
    const files = await fetchPRFiles(owner, repo, prNumber);
    
    // Generate comments for each file
    const fileComments: Record<string, CodeComment[]> = {};
    
    for (const file of files) {
      if (file.patch && file.filename) {
        const comments = await generateCommentsForFile(file.filename, file.patch);
        if (comments.length > 0) {
          fileComments[file.filename] = comments;
        }
      }
    }

    return NextResponse.json({
      success: true,
      comments: fileComments,
      filesReviewed: Object.keys(fileComments).length,
      totalComments: Object.values(fileComments).reduce((sum, comments) => sum + comments.length, 0)
    });

  } catch (error) {
    console.error('Error generating comments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate comments' },
      { status: 500 }
    );
  }
} 