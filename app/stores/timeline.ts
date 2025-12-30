import { defineStore } from 'pinia';
import { useQuery } from '@pinia/colada';

export const useTimelineStore = defineStore('timeline', () => {
  const { data: timeline, status, refresh, isLoading } = useQuery({
    key: ['timeline'],
    query: () => $fetch('/api/timeline'),
  });

  return {
    timeline,
    status,
    refresh,
    isLoading
  };
});
