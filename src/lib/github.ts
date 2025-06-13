// GitHub API service
const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  private: boolean;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  html_url: string;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export class GitHubService {
  private static async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitCall-App',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async searchRepositories(query: string, page: number = 1, perPage: number = 10): Promise<GitHubSearchResponse> {
    if (!query.trim()) {
      return { total_count: 0, incomplete_results: false, items: [] };
    }

    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search/repositories?q=${encodedQuery}&page=${page}&per_page=${perPage}&sort=stars&order=desc`;
    
    return this.makeRequest(endpoint);
  }

  static async getUserRepositories(username: string, page: number = 1, perPage: number = 10): Promise<GitHubRepo[]> {
    if (!username.trim()) {
      return [];
    }

    const endpoint = `/users/${encodeURIComponent(username)}/repos?page=${page}&per_page=${perPage}&sort=updated&type=all`;
    
    return this.makeRequest(endpoint);
  }

  static async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    
    return this.makeRequest(endpoint);
  }

  static async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${state}&per_page=50`;
    
    return this.makeRequest(endpoint);
  }

  static async getPullRequestFiles(owner: string, repo: string, pullNumber: number): Promise<GitHubFile[]> {
    const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files`;
    
    return this.makeRequest(endpoint);
  }

  static async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<GitHubPullRequest> {
    const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`;
    
    return this.makeRequest(endpoint);
  }
} 