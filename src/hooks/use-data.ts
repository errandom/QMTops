import { useKV } from '@github/spark/hooks';
import { Team, Site, Field, ScheduleEvent, Request, User } from '@/lib/types';

export function useTeams() {
  return useKV<Team[]>('teams', []);
}

export function useSites() {
  return useKV<Site[]>('sites', []);
}

export function useFields() {
  return useKV<Field[]>('fields', []);
}

export function useSchedule() {
  return useKV<ScheduleEvent[]>('schedule', []);
}

export function useRequests() {
  return useKV<Request[]>('requests', []);
}

export function useUsers() {
  return useKV<User[]>('users', []);
}
