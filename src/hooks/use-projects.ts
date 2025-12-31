
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project } from '@/types';

export function useProjects() {
    const queryClient = useQueryClient();

    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            // API returns array on success, handle potential errors in api.get
            const data = await api.get('/api/projects');
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        refetchOnWindowFocus: false,
    });

    const createProjectMutation = useMutation({
        mutationFn: async (newProject: { name: string; description: string }) => {
            const res = await api.post('/api/projects', newProject);
            return res;
        },
        onSuccess: (newProject) => {
            // Optimistic update or Cache invalidation
            queryClient.setQueryData(['projects'], (old: Project[] = []) => {
                return [...old, newProject];
            });
        },
    });

    return {
        projects,
        isLoading,
        error,
        createProject: createProjectMutation.mutateAsync,
        isCreating: createProjectMutation.isPending
    };
}
