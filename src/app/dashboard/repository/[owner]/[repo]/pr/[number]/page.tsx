"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { GitHubService, GitHubPullRequest, GitHubFile } from "../../../../../../../lib/github";

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  file?: GitHubFile;
}

interface CodeComment {
  line: number;
  content: string;
  type: 'suggestion' | 'issue' | 'praise' | 'question';
}

export default function PRDiffPage() {
  const router = useRouter();
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const prNumber = params.number as string;
  
  const [pullRequest, setPullRequest] = useState<GitHubPullRequest | null>(null);
  const [prFiles, setPrFiles] = useState<GitHubFile[]>([]);
  const [isLoadingPR, setIsLoadingPR] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, CodeComment[]>>({});
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);

  useEffect(() => {
    const fetchPRData = async () => {
      setIsLoadingPR(true);
      try {
        const pr = await GitHubService.getPullRequest(owner, repo, parseInt(prNumber));
        setPullRequest(pr);
      } catch (error) {
        console.error('Error fetching pull request:', error);
        // Fallback to mock data
        setPullRequest({
          id: 1,
          number: parseInt(prNumber),
          title: "Add new feature for user authentication",
          body: "This PR adds OAuth integration and improves security",
          state: 'open',
          user: { login: owner, avatar_url: "" },
          created_at: "2024-12-15T10:30:00Z",
          updated_at: "2024-12-15T14:20:00Z",
          head: { ref: "feature/auth", sha: "abc123" },
          base: { ref: "main", sha: "def456" },
          html_url: "",
          additions: 337,
          deletions: 55,
          changed_files: 7
        });
      } finally {
        setIsLoadingPR(false);
      }
    };

    const fetchPRFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const files = await GitHubService.getPullRequestFiles(owner, repo, parseInt(prNumber));
        setPrFiles(files);
        if (files.length > 0) {
          setSelectedFile(files[0].filename);
        }
      } catch (error) {
        console.error('Error fetching PR files:', error);
        // Fallback to mock data with hierarchical structure
        const mockFiles: GitHubFile[] = [
          {
            filename: "backend/app/routers/generate.py",
            status: "modified" as const,
            additions: 35,
            deletions: 7,
            changes: 42,
            patch: `@@ -1,5 +1,8 @@
 from fastapi import APIRouter
+from typing import Optional
+import logging
 
 router = APIRouter()
+logger = logging.getLogger(__name__)
+
 
 @router.post("/generate")
-async def generate_content():
+async def generate_content(prompt: Optional[str] = None):
+    logger.info(f"Generating content with prompt: {prompt}")
     return {"message": "Generated content"}`
          },
          {
            filename: "backend/app/services/base_service.py",
            status: "added" as const,
            additions: 52,
            deletions: 0,
            changes: 52,
            patch: `@@ -0,0 +1,52 @@
+from abc import ABC, abstractmethod
+from typing import Any, Dict, Optional
+import logging
+
+class BaseService(ABC):
+    """Base service class for all services."""
+    
+    def __init__(self):
+        self.logger = logging.getLogger(self.__class__.__name__)
+    
+    @abstractmethod
+    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Process the given data."""
+        pass
+    
+    def validate_input(self, data: Dict[str, Any]) -> bool:
+        """Validate input data."""
+        return isinstance(data, dict)`
          },
          {
            filename: "backend/app/services/github_service.py",
            status: "modified" as const,
            additions: 6,
            deletions: 47,
            changes: 53,
            patch: `@@ -1,10 +1,15 @@
 import requests
+from .base_service import BaseService
 from typing import Dict, Any
 
-class GitHubService:
+class GitHubService(BaseService):
     def __init__(self, token: str):
+        super().__init__()
         self.token = token
         self.base_url = "https://api.github.com"
+        
+    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        return await self.get_repository_info(data.get("repo_name"))
     
     async def get_repository_info(self, repo_name: str) -> Dict[str, Any]:
-        # Old implementation
-        response = requests.get(f"{self.base_url}/repos/{repo_name}")
-        return response.json()
+        headers = {"Authorization": f"token {self.token}"}
+        response = requests.get(f"{self.base_url}/repos/{repo_name}", headers=headers)
+        return response.json()`
          },
          {
            filename: "backend/app/services/local_service.py",
            status: "added" as const,
            additions: 73,
            deletions: 0,
            changes: 73,
            patch: `@@ -0,0 +1,73 @@
+from .base_service import BaseService
+from typing import Dict, Any, List
+import json
+import os
+
+class LocalService(BaseService):
+    """Service for local file operations."""
+    
+    def __init__(self, base_path: str = "./data"):
+        super().__init__()
+        self.base_path = base_path
+        os.makedirs(base_path, exist_ok=True)
+    
+    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Process local file operations."""
+        operation = data.get("operation")
+        
+        if operation == "save":
+            return await self.save_file(data)
+        elif operation == "load":
+            return await self.load_file(data)
+        else:
+            raise ValueError(f"Unknown operation: {operation}")
+    
+    async def save_file(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Save data to local file."""
+        filename = data.get("filename")
+        content = data.get("content")
+        
+        if not filename or content is None:
+            raise ValueError("filename and content are required")
+        
+        filepath = os.path.join(self.base_path, filename)
+        
+        with open(filepath, 'w') as f:
+            if isinstance(content, dict):
+                json.dump(content, f, indent=2)
+            else:
+                f.write(str(content))
+        
+        return {"status": "success", "filepath": filepath}
+    
+    async def load_file(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Load data from local file."""
+        filename = data.get("filename")
+        
+        if not filename:
+            raise ValueError("filename is required")
+        
+        filepath = os.path.join(self.base_path, filename)
+        
+        if not os.path.exists(filepath):
+            raise FileNotFoundError(f"File not found: {filepath}")
+        
+        with open(filepath, 'r') as f:
+            try:
+                content = json.load(f)
+            except json.JSONDecodeError:
+                content = f.read()
+        
+        return {"status": "success", "content": content}`
          },
          {
            filename: "backend/app/services/seed_dpsk_service.py",
            status: "added" as const,
            additions: 120,
            deletions: 0,
            changes: 120,
            patch: `@@ -0,0 +1,120 @@
+from .base_service import BaseService
+from typing import Dict, Any, List, Optional
+import random
+import string
+import hashlib
+
+class SeedDpskService(BaseService):
+    """Service for DPSK seed generation and management."""
+    
+    def __init__(self, seed_length: int = 32):
+        super().__init__()
+        self.seed_length = seed_length
+        self.generated_seeds: List[str] = []
+    
+    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Process DPSK seed operations."""
+        operation = data.get("operation", "generate")
+        
+        if operation == "generate":
+            return await self.generate_seed(data)
+        elif operation == "validate":
+            return await self.validate_seed(data)
+        elif operation == "list":
+            return await self.list_seeds()
+        else:
+            raise ValueError(f"Unknown operation: {operation}")
+    
+    async def generate_seed(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Generate a new DPSK seed."""
+        custom_length = data.get("length", self.seed_length)
+        entropy_source = data.get("entropy_source", "random")
+        
+        if entropy_source == "random":
+            seed = self._generate_random_seed(custom_length)
+        elif entropy_source == "timestamp":
+            seed = self._generate_timestamp_seed(custom_length)
+        else:
+            seed = self._generate_random_seed(custom_length)
+        
+        # Store the generated seed
+        self.generated_seeds.append(seed)
+        
+        # Generate hash for verification
+        seed_hash = hashlib.sha256(seed.encode()).hexdigest()
+        
+        self.logger.info(f"Generated DPSK seed with length {len(seed)}")
+        
+        return {
+            "status": "success",
+            "seed": seed,
+            "hash": seed_hash,
+            "length": len(seed),
+            "entropy_source": entropy_source
+        }
+    
+    def _generate_random_seed(self, length: int) -> str:
+        """Generate a random seed using secure random."""
+        characters = string.ascii_letters + string.digits + "!@#$%^&*"
+        return ''.join(random.SystemRandom().choice(characters) for _ in range(length))
+    
+    def _generate_timestamp_seed(self, length: int) -> str:
+        """Generate a seed based on timestamp."""
+        import time
+        timestamp = str(int(time.time() * 1000000))  # microsecond precision
+        
+        # Pad or truncate to desired length
+        if len(timestamp) >= length:
+            return timestamp[:length]
+        else:
+            # Pad with random characters
+            padding_length = length - len(timestamp)
+            padding = self._generate_random_seed(padding_length)
+            return timestamp + padding
+    
+    async def validate_seed(self, data: Dict[str, Any]) -> Dict[str, Any]:
+        """Validate a DPSK seed."""
+        seed = data.get("seed")
+        expected_hash = data.get("hash")
+        
+        if not seed:
+            return {"status": "error", "message": "Seed is required"}
+        
+        # Check if seed exists in our generated seeds
+        is_known = seed in self.generated_seeds
+        
+        # Validate hash if provided
+        calculated_hash = hashlib.sha256(seed.encode()).hexdigest()
+        hash_valid = expected_hash == calculated_hash if expected_hash else True
+        
+        # Basic validation checks
+        is_valid_length = len(seed) >= 8  # Minimum length requirement
+        has_complexity = any(c.isdigit() for c in seed) and any(c.isalpha() for c in seed)
+        
+        overall_valid = is_valid_length and has_complexity and hash_valid
+        
+        return {
+            "status": "success",
+            "valid": overall_valid,
+            "checks": {
+                "length": is_valid_length,
+                "complexity": has_complexity,
+                "hash": hash_valid,
+                "known": is_known
+            },
+            "calculated_hash": calculated_hash
+        }
+    
+    async def list_seeds(self) -> Dict[str, Any]:
+        """List all generated seeds."""
+        return {
+            "status": "success",
+            "seeds": [
+                {
+                    "seed": seed,
+                    "hash": hashlib.sha256(seed.encode()).hexdigest(),
+                    "length": len(seed)
+                }
+                for seed in self.generated_seeds
+            ],
+            "count": len(self.generated_seeds)
+        }`
          },
          {
            filename: ".env.example",
            status: "modified" as const,
            additions: 2,
            deletions: 1,
            changes: 3,
            patch: `@@ -1,3 +1,4 @@
 DATABASE_URL=postgresql://localhost/myapp
-API_KEY=your_api_key_here
+GITHUB_TOKEN=your_github_token_here
+OPENAI_API_KEY=your_openai_key_here
 DEBUG=true`
          },
          {
            filename: "README.md",
            status: "modified" as const,
            additions: 49,
            deletions: 0,
            changes: 49,
            patch: `@@ -1,5 +1,54 @@
 # My Project
 
 This is a sample project for demonstration.
+
+## New Features
+
+### Backend Services
+
+This project now includes a comprehensive backend service architecture:
+
+#### Base Service
+- Abstract base class for all services
+- Standardized logging and error handling
+- Common interface for all service implementations
+
+#### GitHub Service
+- Integration with GitHub API
+- Repository information retrieval
+- Secure token-based authentication
+
+#### Local Service
+- File system operations
+- JSON data persistence
+- Configurable storage paths
+
+#### DPSK Seed Service
+- Cryptographic seed generation
+- Multiple entropy sources
+- Seed validation and verification
+- Hash-based integrity checking
+
+### Installation
+
+\`\`\`bash
+pip install -r requirements.txt
+\`\`\`
+
+### Configuration
+
+Copy \`.env.example\` to \`.env\` and configure your environment variables:
+
+\`\`\`
+GITHUB_TOKEN=your_github_token_here
+OPENAI_API_KEY=your_openai_key_here
+DEBUG=true
+\`\`\`
+
+### Usage
+
+\`\`\`python
+from app.services import GitHubService, LocalService, SeedDpskService
+
+# Initialize services
+github = GitHubService(token="your_token")
+\`\`\``
          }
        ];
        setPrFiles(mockFiles);
        if (mockFiles.length > 0) {
          setSelectedFile(mockFiles[0].filename);
        }
      } finally {
        setIsLoadingFiles(false);
      }
    };

    if (owner && repo && prNumber) {
      fetchPRData();
      fetchPRFiles();
    }
  }, [owner, repo, prNumber]);

  const generateComments = async () => {
    setIsGeneratingComments(true);
    try {
      const response = await fetch('/api/generate-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          prNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate comments');
      }

      const data = await response.json();
      setComments(data.comments || {});
    } catch (error) {
      console.error('Error generating comments:', error);
      // Show some mock comments for demo purposes
      setComments({
        "backend/app/routers/generate.py": [
          {
            line: 8,
            type: "suggestion",
            content: "Consider using const instead of let for variables that don't change."
          },
          {
            line: 12,
            type: "praise",
            content: "Good addition of logging for better debugging!"
          }
        ],
        "backend/app/services/base_service.py": [
          {
            line: 15,
            type: "suggestion",
            content: "Consider adding type hints for better code documentation."
          }
        ]
      });
    } finally {
      setIsGeneratingComments(false);
    }
  };

  const buildFileTree = (files: GitHubFile[]): FileTreeNode[] => {
    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    files.forEach(file => {
      const parts = file.filename.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (isFile) {
          const fileNode: FileTreeNode = {
            name: part,
            path: currentPath,
            type: 'file',
            file: file
          };
          
          if (i === 0) {
            tree.push(fileNode);
          } else {
            const parentPath = parts.slice(0, i).join('/');
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileNode);
            }
          }
        } else {
          if (!folderMap.has(currentPath)) {
            const folderNode: FileTreeNode = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: []
            };
            
            folderMap.set(currentPath, folderNode);
            
            if (i === 0) {
              tree.push(folderNode);
            } else {
              const parentPath = parts.slice(0, i).join('/');
              const parent = folderMap.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(folderNode);
              }
            }
          }
        }
      }
    });

    return tree;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        {node.type === 'folder' ? (
          <>
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full text-left px-2 py-1 hover:bg-neutral-50 transition-colors flex items-center gap-2 text-sm"
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <svg 
                width="12" 
                height="12" 
                fill="none" 
                viewBox="0 0 24 24"
                className={`transition-transform ${expandedFolders.has(node.path) ? 'rotate-90' : ''}`}
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-blue-500">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-neutral-700 font-medium">{node.name}</span>
            </button>
            {expandedFolders.has(node.path) && node.children && (
              <div>
                {renderFileTree(node.children, depth + 1)}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setSelectedFile(node.path)}
            className={`w-full text-left px-2 py-1 transition-colors flex items-center gap-2 text-sm ${
              selectedFile === node.path
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'hover:bg-neutral-50 text-neutral-700'
            }`}
            style={{ paddingLeft: `${24 + depth * 16}px` }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-neutral-400">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono text-xs flex-1 truncate">{node.name}</span>
            {node.file && (
              <div className="flex items-center gap-1 text-xs">
                {node.file.additions > 0 && (
                  <span className="text-green-600">+{node.file.additions}</span>
                )}
                {node.file.deletions > 0 && (
                  <span className="text-red-600">-{node.file.deletions}</span>
                )}
              </div>
            )}
          </button>
        )}
      </div>
    ));
  };

  const selectedFileData = prFiles.find(file => file.filename === selectedFile);
  const fileTree = buildFileTree(prFiles);

  // Initialize expanded folders
  useEffect(() => {
    if (prFiles.length > 0) {
      const allFolders = new Set<string>();
      prFiles.forEach(file => {
        const parts = file.filename.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
          const folderPath = parts.slice(0, i + 1).join('/');
          allFolders.add(folderPath);
        }
      });
      setExpandedFolders(allFolders);
    }
  }, [prFiles]);

  const renderUnifiedDiff = (patch: string) => {
    const fileComments = selectedFile ? comments[selectedFile] || [] : [];
    
    return (
      <div className="font-mono text-sm">
        {patch.split('\n').map((line, lineIndex) => {
          const isAddition = line.startsWith('+') && !line.startsWith('+++');
          const isDeletion = line.startsWith('-') && !line.startsWith('---');
          const isHunk = line.startsWith('@@');
          const lineComments = fileComments.filter(comment => comment.line === lineIndex + 1);

          return (
            <div key={lineIndex}>
              <div 
                className={`flex ${
                  isAddition ? 'bg-green-50' :
                  isDeletion ? 'bg-red-50' :
                  isHunk ? 'bg-blue-50' :
                  ''
                }`}
              >
                <div className={`w-12 px-2 py-1 text-right text-xs select-none border-r ${
                  isAddition ? 'bg-green-100 text-green-700 border-green-200' :
                  isDeletion ? 'bg-red-100 text-red-700 border-red-200' :
                  isHunk ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-neutral-50 text-neutral-500 border-neutral-200'
                }`}>
                  {!isHunk && !line.startsWith('+++') && !line.startsWith('---') && (lineIndex + 1)}
                </div>
                <div className={`flex-1 px-4 py-1 whitespace-pre-wrap ${
                  isAddition ? 'text-green-800' :
                  isDeletion ? 'text-red-800' :
                  isHunk ? 'text-blue-800 font-medium' :
                  'text-neutral-800'
                }`}>
                  {line}
                </div>
              </div>
              
              {/* Render comments for this line */}
              {lineComments.map((comment, commentIndex) => (
                <div key={`comment-${lineIndex}-${commentIndex}`} className="bg-yellow-50 border-l-4 border-yellow-400 ml-12">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        comment.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                        comment.type === 'issue' ? 'bg-red-100 text-red-700' :
                        comment.type === 'praise' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {comment.type === 'suggestion' ? '💡' :
                         comment.type === 'issue' ? '⚠️' :
                         comment.type === 'praise' ? '👍' : '❓'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-neutral-900">AI Review</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            comment.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                            comment.type === 'issue' ? 'bg-red-100 text-red-700' :
                            comment.type === 'praise' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {comment.type}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSplitDiff = (patch: string) => {
    const fileComments = selectedFile ? comments[selectedFile] || [] : [];
    const lines = patch.split('\n');
    const leftLines: string[] = [];
    const rightLines: string[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('@@') || line.startsWith('+++') || line.startsWith('---')) {
        leftLines.push(line);
        rightLines.push(line);
      } else if (line.startsWith('-')) {
        leftLines.push(line);
        rightLines.push('');
      } else if (line.startsWith('+')) {
        leftLines.push('');
        rightLines.push(line);
      } else {
        leftLines.push(line);
        rightLines.push(line);
      }
    });

    const maxLines = Math.max(leftLines.length, rightLines.length);

    return (
      <div className="font-mono text-sm">
        <div className="flex">
          {/* Original (Left) */}
          <div className="flex-1 border-r border-neutral-200">
            <div className="bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 border-b border-neutral-200">
              Original
            </div>
          </div>
          {/* Modified (Right) */}
          <div className="flex-1">
            <div className="bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 border-b border-neutral-200">
              Modified
            </div>
          </div>
        </div>
        
        {leftLines.map((leftLine, lineIndex) => {
          const rightLine = rightLines[lineIndex] || '';
          const leftIsDeletion = leftLine.startsWith('-') && !leftLine.startsWith('---');
          const leftIsHunk = leftLine.startsWith('@@');
          const leftIsEmpty = leftLine === '';
          
          const rightIsAddition = rightLine.startsWith('+') && !rightLine.startsWith('+++');
          const rightIsHunk = rightLine.startsWith('@@');
          const rightIsEmpty = rightLine === '';
          
          const lineComments = fileComments.filter(comment => comment.line === lineIndex + 1);
          
          return (
            <div key={lineIndex}>
              <div className="flex">
                {/* Left side */}
                <div className="flex-1 border-r border-neutral-200">
                  <div 
                    className={`flex ${
                      leftIsDeletion ? 'bg-red-50' :
                      leftIsHunk ? 'bg-blue-50' :
                      leftIsEmpty ? 'bg-neutral-25' :
                      ''
                    }`}
                  >
                    <div className={`w-12 px-2 py-1 text-right text-xs select-none border-r ${
                      leftIsDeletion ? 'bg-red-100 text-red-700 border-red-200' :
                      leftIsHunk ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {!leftIsHunk && !leftLine.startsWith('---') && !leftIsEmpty && (lineIndex + 1)}
                    </div>
                    <div className={`flex-1 px-4 py-1 whitespace-pre-wrap min-h-[1.5rem] ${
                      leftIsDeletion ? 'text-red-800' :
                      leftIsHunk ? 'text-blue-800 font-medium' :
                      'text-neutral-800'
                    }`}>
                      {leftLine}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex-1">
                  <div 
                    className={`flex ${
                      rightIsAddition ? 'bg-green-50' :
                      rightIsHunk ? 'bg-blue-50' :
                      rightIsEmpty ? 'bg-neutral-25' :
                      ''
                    }`}
                  >
                    <div className={`w-12 px-2 py-1 text-right text-xs select-none border-r ${
                      rightIsAddition ? 'bg-green-100 text-green-700 border-green-200' :
                      rightIsHunk ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {!rightIsHunk && !rightLine.startsWith('+++') && !rightIsEmpty && (lineIndex + 1)}
                    </div>
                    <div className={`flex-1 px-4 py-1 whitespace-pre-wrap min-h-[1.5rem] ${
                      rightIsAddition ? 'text-green-800' :
                      rightIsHunk ? 'text-blue-800 font-medium' :
                      'text-neutral-800'
                    }`}>
                      {rightLine}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Render comments for this line - spans full width */}
              {lineComments.map((comment, commentIndex) => (
                <div key={`comment-${lineIndex}-${commentIndex}`} className="bg-yellow-50 border-l-4 border-yellow-400">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        comment.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                        comment.type === 'issue' ? 'bg-red-100 text-red-700' :
                        comment.type === 'praise' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {comment.type === 'suggestion' ? '💡' :
                         comment.type === 'issue' ? '⚠️' :
                         comment.type === 'praise' ? '👍' : '❓'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-neutral-900">AI Review</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            comment.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                            comment.type === 'issue' ? 'bg-red-100 text-red-700' :
                            comment.type === 'praise' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {comment.type}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const totalAdditions = prFiles.reduce((sum, file) => sum + file.additions, 0);
  const totalDeletions = prFiles.reduce((sum, file) => sum + file.deletions, 0);

  return (
    <div className="min-h-screen" style={{ background: '#fbfbf5' }}>
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard/repository/${owner}/${repo}`)}
            className="text-neutral-400 hover:text-black transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">GitReviewed</span>
            <span className="text-neutral-400">/</span>
            <span className="font-medium text-neutral-800">
              {isLoadingPR ? (
                <div className="h-5 bg-neutral-200 rounded w-32 animate-pulse"></div>
              ) : pullRequest && (
                `PR #${pullRequest.number} - ${owner}/${repo}`
              )}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={generateComments}
              disabled={isGeneratingComments}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isGeneratingComments ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Generate Comments
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                💬 {Object.values(comments).reduce((sum, fileComments) => sum + fileComments.length, 0)}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                +{totalAdditions}
              </span>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                -{totalDeletions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* File Tree Sidebar */}
        {showFileTree && (
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowFileTree(false)}
                  className="text-neutral-400 hover:text-black transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-sm text-neutral-600">Hide file tree</span>
              </div>
              <div className="relative">
                <svg width="16" height="16" className="absolute left-3 top-2.5 text-neutral-400" fill="none" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Go to file"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <div className="text-sm font-medium text-neutral-700 mb-3 px-2">
                  {prFiles.length} changed files
                </div>
                {isLoadingFiles ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 bg-neutral-100 rounded animate-pulse mx-2"></div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {renderFileTree(fileTree)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Diff View */}
        <div className="flex-1 flex flex-col bg-white">
          {/* File Header */}
          {!showFileTree && (
            <div className="p-4 border-b border-neutral-200">
              <button
                onClick={() => setShowFileTree(true)}
                className="text-neutral-400 hover:text-black transition-colors text-sm flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go to file
              </button>
            </div>
          )}

          {selectedFileData ? (
            <div className="flex-1 flex flex-col">
              {/* File Info Header */}
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-neutral-400">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-mono text-sm font-medium">{selectedFileData.filename}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedFileData.status === 'added' ? 'bg-green-100 text-green-800' :
                      selectedFileData.status === 'removed' ? 'bg-red-100 text-red-800' :
                      selectedFileData.status === 'modified' ? 'bg-blue-100 text-blue-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      +{selectedFileData.additions}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                        💬 0
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        +{selectedFileData.additions}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        -{selectedFileData.deletions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setViewMode('unified')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          viewMode === 'unified' 
                            ? 'bg-green-600 text-white' 
                            : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        Unified
                      </button>
                      <button 
                        onClick={() => setViewMode('split')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          viewMode === 'split' 
                            ? 'bg-green-600 text-white' 
                            : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        Split
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diff Content */}
              <div className="flex-1 overflow-auto">
                {selectedFileData.patch ? (
                  viewMode === 'unified' ? 
                    renderUnifiedDiff(selectedFileData.patch) : 
                    renderSplitDiff(selectedFileData.patch)
                ) : (
                  <div className="flex items-center justify-center h-64 text-neutral-500">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p>No preview available for this file</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {isLoadingFiles ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-neutral-600">Loading files...</p>
                </div>
              ) : (
                <div className="text-center text-neutral-500">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p>Select a file to view changes</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 