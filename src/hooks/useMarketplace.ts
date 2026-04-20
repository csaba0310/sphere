import { useQuery } from '@tanstack/react-query';
import {
  fetchProjects,
  fetchFeaturedProjects,
  fetchProject,
  fetchProjectQuests,
  fetchProjectAchievements,
  fetchProjectMetrics,
  fetchProjectMetricsBatch,
  fetchProjectRatings,
  fetchRatingReplies,
  fetchCategories,
} from '../services/marketplaceApi';

export function useProjects(params?: { type?: 'app' | 'skill'; category?: string; search?: string; sort?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['marketplace', 'projects', params],
    queryFn: () => fetchProjects(params),
    staleTime: 5 * 60_000,
  });
}

export function useFeaturedProjects(type?: 'app' | 'skill') {
  return useQuery({
    queryKey: ['marketplace', 'featured', type],
    queryFn: () => fetchFeaturedProjects(type),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useProject(slug: string, preview?: boolean) {
  return useQuery({
    queryKey: ['marketplace', 'project', slug, { preview }],
    queryFn: () => fetchProject(slug, preview),
    enabled: !!slug,
  });
}

export function useProjectQuests(slug: string) {
  return useQuery({
    queryKey: ['marketplace', 'project-quests', slug],
    queryFn: () => fetchProjectQuests(slug),
    enabled: !!slug,
  });
}

export function useProjectAchievements(slug: string) {
  return useQuery({
    queryKey: ['marketplace', 'project-achievements', slug],
    queryFn: () => fetchProjectAchievements(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['marketplace', 'categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });
}

export function useProjectMetrics(projectId: string | undefined) {
  return useQuery({
    queryKey: ['metrics', 'project', projectId],
    queryFn: () => fetchProjectMetrics(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useProjectMetricsBatch(projectIds: string[]) {
  return useQuery({
    queryKey: ['metrics', 'projects', projectIds.slice().sort().join(',')],
    queryFn: () => fetchProjectMetricsBatch(projectIds),
    enabled: projectIds.length > 0,
    staleTime: 60_000,
  });
}

export function useProjectRatings(slug: string | undefined, page = 1, sort: 'helpful' | 'recent' = 'helpful') {
  return useQuery({
    queryKey: ['marketplace', 'ratings', slug, page, sort],
    queryFn: () => fetchProjectRatings(slug!, page, 20, sort),
    enabled: !!slug,
    staleTime: 30_000,
  });
}

export function useRatingReplies(ratingId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['marketplace', 'replies', ratingId],
    queryFn: () => fetchRatingReplies(ratingId!),
    enabled: enabled && !!ratingId,
    staleTime: 15_000,
  });
}
