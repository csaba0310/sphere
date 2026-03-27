import { useQuery } from '@tanstack/react-query';
import {
  fetchProjects,
  fetchFeaturedProjects,
  fetchProject,
  fetchProjectQuests,
  fetchProjectAchievements,
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

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['marketplace', 'project', slug],
    queryFn: () => fetchProject(slug),
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
