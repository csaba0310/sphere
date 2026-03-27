import { useQuery } from '@tanstack/react-query';
import {
  fetchProjects,
  fetchFeaturedProjects,
  fetchProject,
  fetchProjectQuests,
  fetchProjectAchievements,
  fetchCategories,
} from '../services/marketplaceApi';

export function useProjects(params?: { category?: string; search?: string; sort?: string }) {
  return useQuery({
    queryKey: ['marketplace', 'projects', params],
    queryFn: () => fetchProjects(params),
    staleTime: 5 * 60_000,
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: ['marketplace', 'featured'],
    queryFn: fetchFeaturedProjects,
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
