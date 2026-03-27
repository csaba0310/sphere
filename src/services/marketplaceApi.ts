const API_BASE = import.meta.env.VITE_MARKETPLACE_API_URL ?? 'http://localhost:3001';

// ── Types ─────────────────────────────────────────────────────────────
export interface ProjectSummary {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl?: string | null;
  category: string;
  tags: string[];
  accentColor: string;
  featured: boolean;
  stats: { totalUsers: number; totalCompletions: number; activeQuests: number };
  appUrl?: string | null;
  websiteUrl?: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  bannerUrl: string | null;
  media: { type: string; url: string; caption?: string | null }[];
  websiteUrl: string | null;
  appUrl: string | null;
  socialLinks: { twitter: string | null; discord: string | null; telegram: string | null };
  pointsConfig: { name: string; icon: string | null; symbol: string };
}

export interface ProjectQuest {
  _id: string;
  title: string;
  description: string;
  points: number;
  platform: string | null;
  imageUrl: string | null;
  tags: string[];
  questType: string;
}

export interface ProjectAchievement {
  _id: string;
  title: string;
  description: string;
  points: number;
  source: string;
  target: number;
  imageUrl: string | null;
}

export interface CategoryCount {
  category: string;
  count: number;
}

// ── Fetch helpers ─────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/marketplace${path}`);
  if (!res.ok) throw new Error(`Marketplace API error: ${res.status}`);
  return res.json();
}

// ── API functions ─────────────────────────────────────────────────────
export function fetchProjects(params?: {
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}): Promise<ProjectSummary[]> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  if (params?.search) sp.set('search', params.search);
  if (params?.sort) sp.set('sort', params.sort);
  if (params?.featured) sp.set('featured', 'true');
  const qs = sp.toString();
  return get(`${qs ? `?${qs}` : ''}`);
}

export function fetchFeaturedProjects(): Promise<ProjectSummary[]> {
  return get('/featured');
}

export function fetchProject(slug: string): Promise<ProjectDetail> {
  return get(`/${slug}`);
}

export function fetchProjectQuests(slug: string): Promise<ProjectQuest[]> {
  return get(`/${slug}/quests`);
}

export function fetchProjectAchievements(slug: string): Promise<ProjectAchievement[]> {
  return get(`/${slug}/achievements`);
}

export function fetchCategories(): Promise<CategoryCount[]> {
  return get('/categories');
}
