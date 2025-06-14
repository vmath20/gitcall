"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cal, { getCalApi } from "@calcom/embed-react";
import { GitHubService, GitHubRepo, GitHubPullRequest, GitHubFile } from "../../lib/github";

// Repository interface
interface Repository {
  id: number;
  name: string;
  status: string;
  lastActivity: string;
  pullRequests: number;
  owner: string;
}

// Dashboard Components
function DashboardView() {
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Seeded random function for deterministic data generation
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate activity data for the past year (52 weeks) - deterministic
  const generateActivityData = () => {
    const data: any[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // 52 weeks * 7 days - 1

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      // Use date as seed for deterministic random generation
      const seed = date.getTime() / 86400000; // Convert to days since epoch
      const calls = Math.floor(seededRandom(seed) * 15); // 0-14 calls per day
      data.push({
        date: date.toISOString().split('T')[0],
        calls,
        level: calls === 0 ? 0 : calls <= 3 ? 1 : calls <= 7 ? 2 : calls <= 10 ? 3 : 4
      });
    }
    return data;
  };

  const activityData = generateActivityData();

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-neutral-100';
      case 1: return 'bg-red-200';
      case 2: return 'bg-red-400';
      case 3: return 'bg-red-600';
      case 4: return 'bg-red-800';
      default: return 'bg-neutral-100';
    }
  };

  const handleDayClick = (day: any, event: any) => {
    setSelectedDay(day);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleDayLeave = () => {
    setSelectedDay(null);
  };

  return (
    <div>
      {/* Header with greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Good Morning, Developer</h1>
        <p className="text-neutral-600">Here's what's happening with your repositories today</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Highlight Card - Updated to match the image */}
        <div className="lg:col-span-1 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-10">
            <Image 
              src="/logo/trophy.png" 
              alt="Trophy" 
              width={80} 
              height={80} 
              className="opacity-30"
              onError={(e) => {
                // Fallback to SVG if image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="absolute top-0 right-0">
              <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M6 9V6a6 6 0 1112 0v3M6 9h12M8 21h8a2 2 0 002-2v-1a2 2 0 00-2-2H8a2 2 0 00-2 2v1a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              HIGHLIGHT OF THE WEEK
            </div>
            <h3 className="text-2xl font-bold mb-3 leading-tight">
              Your team averaged more<br/>
              than <span className="text-green-400">50 PRs</span> <span className="text-neutral-400 text-lg">/dev</span>
            </h3>
            <div className="text-neutral-400 text-sm">
              <span className="text-xs">AVG TIME TO MERGE</span> <span className="font-bold text-white">14H 50MINS</span>
            </div>
          </div>
        </div>

        {/* Comments Chart - Proper Line Graph with Yearly Growth */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-neutral-800 text-lg">Addressed Comments Per PR</h3>
            <div className="flex items-center gap-2 text-neutral-500">
              <span className="text-sm bg-neutral-100 px-2 py-1 rounded">2024</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="h-64 relative mb-4">
            {/* Proper Line Graph with Axes */}
            <svg className="w-full h-full" viewBox="0 0 500 280">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Chart area background */}
              <rect x="60" y="20" width="420" height="200" fill="#fafafa" stroke="#e5e7eb" strokeWidth="1"/>
              
              {/* Grid lines - Horizontal */}
              <g stroke="#f3f4f6" strokeWidth="1">
                <line x1="60" y1="220" x2="480" y2="220"/>
                <line x1="60" y1="180" x2="480" y2="180"/>
                <line x1="60" y1="140" x2="480" y2="140"/>
                <line x1="60" y1="100" x2="480" y2="100"/>
                <line x1="60" y1="60" x2="480" y2="60"/>
                <line x1="60" y1="20" x2="480" y2="20"/>
              </g>
              
              {/* Grid lines - Vertical */}
              <g stroke="#f3f4f6" strokeWidth="1">
                <line x1="95" y1="20" x2="95" y2="220"/>
                <line x1="130" y1="20" x2="130" y2="220"/>
                <line x1="165" y1="20" x2="165" y2="220"/>
                <line x1="200" y1="20" x2="200" y2="220"/>
                <line x1="235" y1="20" x2="235" y2="220"/>
                <line x1="270" y1="20" x2="270" y2="220"/>
                <line x1="305" y1="20" x2="305" y2="220"/>
                <line x1="340" y1="20" x2="340" y2="220"/>
                <line x1="375" y1="20" x2="375" y2="220"/>
                <line x1="410" y1="20" x2="410" y2="220"/>
                <line x1="445" y1="20" x2="445" y2="220"/>
                <line x1="480" y1="20" x2="480" y2="220"/>
              </g>
              
              {/* Y-axis labels */}
              <g fill="#6b7280" fontSize="11" textAnchor="end">
                <text x="55" y="225">0</text>
                <text x="55" y="185">2</text>
                <text x="55" y="145">4</text>
                <text x="55" y="105">6</text>
                <text x="55" y="65">8</text>
                <text x="55" y="25">10</text>
              </g>
              
              {/* X-axis labels */}
              <g fill="#6b7280" fontSize="11" textAnchor="middle">
                <text x="95" y="240">Jan</text>
                <text x="130" y="240">Feb</text>
                <text x="165" y="240">Mar</text>
                <text x="200" y="240">Apr</text>
                <text x="235" y="240">May</text>
                <text x="270" y="240">Jun</text>
                <text x="305" y="240">Jul</text>
                <text x="340" y="240">Aug</text>
                <text x="375" y="240">Sep</text>
                <text x="410" y="240">Oct</text>
                <text x="445" y="240">Nov</text>
                <text x="480" y="240">Dec</text>
              </g>
              
              {/* Axis labels */}
              <text x="270" y="265" fill="#6b7280" fontSize="12" textAnchor="middle" fontWeight="500">Month (2024)</text>
              <text x="25" y="120" fill="#6b7280" fontSize="12" textAnchor="middle" fontWeight="500" transform="rotate(-90 25 120)">Comments per PR</text>
              
              {/* Data line with yearly growth trend */}
              <path
                d="M 95 200 L 130 190 L 165 175 L 200 160 L 235 145 L 270 125 L 305 110 L 340 95 L 375 80 L 410 65 L 445 50 L 480 40"
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                filter="url(#glow)"
              />
              
              {/* Area fill */}
              <path
                d="M 95 200 L 130 190 L 165 175 L 200 160 L 235 145 L 270 125 L 305 110 L 340 95 L 375 80 L 410 65 L 445 50 L 480 40 L 480 220 L 95 220 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Data points */}
              <g fill="#10b981" stroke="#ffffff" strokeWidth="2">
                <circle cx="95" cy="200" r="4"/>
                <circle cx="130" cy="190" r="4"/>
                <circle cx="165" cy="175" r="4"/>
                <circle cx="200" cy="160" r="4"/>
                <circle cx="235" cy="145" r="4"/>
                <circle cx="270" cy="125" r="4"/>
                <circle cx="305" cy="110" r="4"/>
                <circle cx="340" cy="95" r="4"/>
                <circle cx="375" cy="80" r="4"/>
                <circle cx="410" cy="65" r="4"/>
                <circle cx="445" cy="50" r="4"/>
                <circle cx="480" cy="40" r="4"/>
              </g>
              
              {/* Trend indicator */}
              <g fill="#10b981" fontSize="10">
                <text x="400" y="35" textAnchor="start">↗ +85% growth</text>
              </g>
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-1">6.2</p>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Average</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-1">8.5</p>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Peak (Dec)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-1">1.2</p>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Starting (Jan)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-1">+85%</p>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">YoY Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitCall Activity Tracker - Moved to Middle */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-black">GitCall Activity</h3>
            <p className="text-sm text-neutral-600">Your daily voice call activity over the past year</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-neutral-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-800 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-2 min-w-max">
            <div className="w-8 text-xs text-neutral-500"></div>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <div key={month} className="flex-1 text-xs text-neutral-500 text-center" style={{minWidth: '44px'}}>
                {month}
              </div>
            ))}
          </div>
          
          {/* Activity grid with day labels */}
          <div className="flex min-w-max">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-3 text-xs text-neutral-500 flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 text-xs text-neutral-500 flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 text-xs text-neutral-500 flex items-center">Fri</div>
              <div className="h-3"></div>
              <div className="h-3 text-xs text-neutral-500 flex items-center">Sun</div>
            </div>
            
            {/* Activity squares arranged by weeks */}
            <div className="grid grid-cols-53 gap-1 min-w-max">
              {activityData.map((day, index) => {
                const dayOfWeek = new Date(day.date).getDay();
                const weekIndex = Math.floor(index / 7);
                const adjustedIndex = weekIndex * 7 + dayOfWeek;
                
                return (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-300 ${getColorClass(day.level)}`}
                    onClick={(e) => handleDayClick(day, e)}
                    onMouseLeave={handleDayLeave}
                    title={`${day.calls} calls on ${new Date(day.date).toLocaleDateString()}`}
                    style={{
                      gridColumn: Math.floor(index / 7) + 1,
                      gridRow: dayOfWeek + 1
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-neutral-600">
          <p>Click on any square to see the number of calls received that day</p>
        </div>
      </div>

      {/* Bottom Row - Three Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Feedback Reactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 text-sm mb-4">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            FEEDBACK REACTIONS
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-black">Positive Feedback</span>
                <span className="text-sm font-medium text-black">65%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-black">Negative Feedback</span>
                <span className="text-sm font-medium text-black">35%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '35%'}}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-neutral-600">Positive Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-neutral-600">Negative Feedback</span>
            </div>
          </div>
        </div>

        {/* Credit Summary - Improved */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 text-sm mb-6">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            CREDIT SUMMARY
          </div>
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 35 * 0.75} ${2 * Math.PI * 35}`}
                strokeLinecap="round"
                className="drop-shadow-sm"
              />
              {/* Inner glow effect */}
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 35 * 0.75} ${2 * Math.PI * 35}`}
                strokeLinecap="round"
                className="opacity-50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-black">20,830</p>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Credits Left</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-1">4.2K avg spend per day</p>
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>75% remaining</span>
            </div>
          </div>
        </div>

        {/* Key Metrics - Replacing Month Wise Usage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-600 text-sm mb-6">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            KEY METRICS
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 mb-1">3</p>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Connected Repos</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600 mb-1">127</p>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Total Calls</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 mb-1">4</p>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Active PRs</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 mb-1">2.5m</p>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Avg Call Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {selectedDay && (
        <div 
          className="fixed bg-black text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          <div className="font-medium">{selectedDay.calls} calls</div>
          <div className="text-xs opacity-75">{new Date(selectedDay.date).toLocaleDateString()}</div>
        </div>
      )}
         </div>
   );
}

function RepositoriesView() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GitHubRepo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<'public' | 'user'>('public');
  const [userQuery, setUserQuery] = useState("");

  const handleRemoveRepo = (repo: Repository) => {
    setSelectedRepo(repo);
    setShowRemoveModal(true);
    setActiveDropdown(null);
  };

  const handleRepoClick = (repo: Repository) => {
    router.push(`/dashboard/repository/${repo.owner}/${repo.name}`);
  };



  const confirmRemoveRepo = () => {
    if (selectedRepo) {
      setRepositories(repositories.filter(repo => repo.id !== selectedRepo.id));
      setShowRemoveModal(false);
      setSelectedRepo(null);
    }
  };

  const searchGitHubRepos = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await GitHubService.searchRepositories(query, 1, 10);
      setSearchResults(response.items);
    } catch (error) {
      console.error('Error searching repositories:', error);
      // Fallback to mock data if API fails
      const mockResults = [
        { id: 101, name: "awesome-react-app", owner: { login: "github-user", avatar_url: "" }, description: "A React application", stargazers_count: 45, language: "JavaScript", full_name: "github-user/awesome-react-app", html_url: "", private: false },
        { id: 102, name: "node-api-server", owner: { login: "another-user", avatar_url: "" }, description: "Node.js API server", stargazers_count: 23, language: "TypeScript", full_name: "another-user/node-api-server", html_url: "", private: false },
        { id: 103, name: "python-ml-project", owner: { login: "ml-expert", avatar_url: "" }, description: "Machine learning project", stargazers_count: 78, language: "Python", full_name: "ml-expert/python-ml-project", html_url: "", private: false },
      ].filter(repo => 
        repo.name.toLowerCase().includes(query.toLowerCase()) ||
        repo.owner.login.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const searchUserRepos = async (username: string) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const repos = await GitHubService.getUserRepositories(username, 1, 10);
      setSearchResults(repos);
    } catch (error) {
      console.error('Error searching user repositories:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchPRCount = async (owner: string, name: string) => {
    try {
      const prs = await GitHubService.getPullRequests(owner, name, 'open');
      return prs.length;
    } catch (error) {
      console.error('Error fetching PR count:', error);
      return Math.floor(Math.random() * 5); // Fallback to random number
    }
  };

  const connectRepository = async (repo: GitHubRepo) => {
    const prCount = await fetchPRCount(repo.owner.login, repo.name);
    const newRepo: Repository = {
      id: Date.now(),
      name: repo.name,
      status: "Connected",
      lastActivity: "Just now",
      pullRequests: prCount,
      owner: repo.owner.login
    };
    setRepositories([...repositories, newRepo]);
    setShowConnectModal(false);
    setSearchQuery("");
    setUserQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchType === 'public') {
        searchGitHubRepos(searchQuery);
      } else {
        searchUserRepos(userQuery);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, userQuery, searchType]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  // Fetch PR counts for existing repositories
  useEffect(() => {
    const updatePRCounts = async () => {
      const updatedRepos = await Promise.all(
        repositories.map(async (repo) => {
          if (repo.status === "Connected") {
            const prCount = await fetchPRCount(repo.owner, repo.name);
            return { ...repo, pullRequests: prCount };
          }
          return repo;
        })
      );
      setRepositories(updatedRepos);
    };

    updatePRCounts();
  }, []); // Run once on mount

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Connected Repositories</h2>
        <button 
          onClick={() => setShowConnectModal(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Connect New Repo
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        {repositories.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-blue-500">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No repositories selected yet!</h3>
            <p className="text-neutral-600 mb-6 max-w-md">
              Connect your first GitHub repository to start receiving voice calls for pull requests and code reviews.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connect Repository
            </button>
          </div>
        ) : (
          // Existing repositories list
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => handleRepoClick(repo)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{repo.owner}/{repo.name}</h3>
                    <p className="text-sm text-neutral-600">{repo.status} • {repo.lastActivity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">{repo.pullRequests} open PRs</p>
                    <p className="text-xs text-neutral-500">Pull Requests</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === repo.id ? null : repo.id);
                      }}
                      className="text-neutral-400 hover:text-black transition-colors p-1"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d="M12 13a1 1 0 100-2 1 1 0 000 2zM12 6a1 1 0 100-2 1 1 0 000 2zM12 20a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
                      </svg>
                    </button>
                    
                    {activeDropdown === repo.id && (
                      <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const prUrl = prompt(`Enter the GitHub PR URL for ${repo.owner}/${repo.name}:`);
                            if (prUrl) {
                              router.push(`/dashboard/repository/${repo.owner}/${repo.name}/pr/summary?url=${encodeURIComponent(prUrl)}`);
                            }
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-2"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Summarize PR
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRepo(repo);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {repositories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full border-2 border-dashed border-neutral-300 text-neutral-600 py-4 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connect Another Repository
            </button>
          </div>
        )}
      </div>

      {/* Connect Repository Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Connect New Repository</h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-neutral-400 hover:text-black"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex border-b border-neutral-200 mb-4">
                <button
                  onClick={() => {
                    setSearchType('public');
                    setSearchResults([]);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'public'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  Search Public Repos
                </button>
                <button
                  onClick={() => {
                    setSearchType('user');
                    setSearchResults([]);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'user'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  Search User Repos
                </button>
              </div>
              
              {searchType === 'public' ? (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Search Public Repositories
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by repository name, description, or topic..."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Enter GitHub username..."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-black">Search Results</h4>
                {searchResults.map((repo) => (
                  <div key={repo.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-black">{repo.owner.login}/{repo.name}</h5>
                        <p className="text-sm text-neutral-600">{repo.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-neutral-500">{repo.language}</span>
                          <span className="text-xs text-neutral-500">⭐ {repo.stargazers_count}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => connectRepository(repo)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}

            {((searchType === 'public' && searchQuery) || (searchType === 'user' && userQuery)) && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-neutral-600">
                No repositories found matching "{searchType === 'public' ? searchQuery : userQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove Repository Modal */}
      {showRemoveModal && selectedRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-black mb-2">Remove Repository</h3>
              <p className="text-neutral-600">
                Are you sure you want to remove <strong>{selectedRepo.owner}/{selectedRepo.name}</strong> from GitCall? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmRemoveRepo}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Repository
              </button>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

function CallsView() {
  const recentCalls = [
    { repo: "my-awesome-project", type: "PR Review", duration: "3:45", time: "2 hours ago", status: "Completed" },
    { repo: "react-dashboard", type: "Code Summary", duration: "2:12", time: "1 day ago", status: "Completed" },
    { repo: "my-awesome-project", type: "Merge Conflict", duration: "5:23", time: "2 days ago", status: "Completed" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Recent Voice Calls</h2>
        <div></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="space-y-4">
          {recentCalls.map((call, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-black">{call.repo}</h3>
                  <p className="text-sm text-neutral-600">{call.type} • {call.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-black">{call.duration}</p>
                  <p className="text-xs text-green-600">{call.status}</p>
                </div>
                <button className="text-neutral-400 hover:text-black transition-colors">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-black">Profile Picture</h3>
            <p className="text-sm text-neutral-600">Upload a new profile picture</p>
            <button className="mt-2 text-blue-600 text-sm hover:text-blue-700">Change Photo</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="John Developer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Phone</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">GitHub Username</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="johndev"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-2">Bio</label>
          <textarea 
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            defaultValue="Full-stack developer passionate about voice-enabled development tools."
          />
        </div>
        
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
          <button className="border border-neutral-300 text-neutral-700 px-6 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingView() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Current Plan</h2>
        
        <div className="flex items-center justify-between p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <h3 className="text-lg font-medium text-black">Pro Plan</h3>
            <p className="text-sm text-neutral-600">Unlimited repositories and voice calls</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-black">$29</p>
            <p className="text-sm text-neutral-600">per month</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-neutral-200 rounded-lg">
            <p className="text-2xl font-bold text-black">∞</p>
            <p className="text-sm text-neutral-600">Repositories</p>
          </div>
          <div className="text-center p-4 border border-neutral-200 rounded-lg">
            <p className="text-2xl font-bold text-black">∞</p>
            <p className="text-sm text-neutral-600">Voice Calls</p>
          </div>
          <div className="text-center p-4 border border-neutral-200 rounded-lg">
            <p className="text-2xl font-bold text-black">24/7</p>
            <p className="text-sm text-neutral-600">Support</p>
          </div>
        </div>
      </div>
      
      {/* Usage This Month */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-black mb-4">Usage This Month</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Voice Calls</span>
              <span className="text-sm text-neutral-600">127 / ∞</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">API Requests</span>
              <span className="text-sm text-neutral-600">2.3K / ∞</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-black mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: "Dec 1, 2024", amount: "$29.00", status: "Paid" },
            { date: "Nov 1, 2024", amount: "$29.00", status: "Paid" },
            { date: "Oct 1, 2024", amount: "$29.00", status: "Paid" },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
              <div>
                <p className="font-medium text-black">{invoice.date}</p>
                <p className="text-sm text-neutral-600">Monthly subscription</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-black">{invoice.amount}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{invoice.status}</span>
                <button className="text-blue-600 text-sm hover:text-blue-700">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactView() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"gitcall"});
      cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Contact Us</h2>
        <p className="text-neutral-600">Schedule a call with our team to discuss your GitCall needs</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden" style={{height: "calc(100vh - 200px)"}}>
        <Cal 
          namespace="gitcall"
          calLink="vaibhav-mishra-iaudjt/gitcall"
          style={{width:"100%",height:"100%",overflow:"scroll"}}
          config={{"layout":"month_view"}}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const router = useRouter();

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" },
    { id: "repositories", label: "Repositories", icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" },
    { id: "calls", label: "Calls", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { id: "profile", label: "Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
    { id: "billing", label: "Billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "contact", label: "Contact", icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "repositories":
        return <RepositoriesView />;
      case "calls":
        return <CallsView />;
      case "profile":
        return <ProfileView />;
      case "billing":
        return <BillingView />;
      case "contact":
        return <ContactView />;
      default:
        return <DashboardView />;
    }
  };

    return (
    <div className="min-h-screen" style={{backgroundColor: '#fbfbf5'}}>
      {/* Logo positioned above sidebar */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => router.push('/')}
          className="hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/logo/TransparentLogo.png" 
            alt="GitCall" 
            width={100} 
            height={100} 
            unoptimized 
          />
        </button>
      </div>

      {/* Header - Profile icon only */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-end">
          <button 
            onClick={() => setActiveView('profile')}
            className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Made wider */}
        <aside className="w-80 bg-white border-r border-neutral-200 min-h-[calc(100vh-80px)] pt-20">
          <nav className="p-6">
            <ul className="space-y-3">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors text-base ${
                      activeView === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                      <path d={item.icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
  } 