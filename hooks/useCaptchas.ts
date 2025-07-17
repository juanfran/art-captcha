import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchCaptchas,
  createCaptcha,
  deleteCaptcha,
  type FetchCaptchasResponse,
} from '@/lib/api/captchas';

export function useCaptchas(pageSize = 10, enabled = true) {
  const queryClient = useQueryClient();

  // Infinite query for captchas
  const query = useInfiniteQuery({
    queryKey: ['captchas'],
    queryFn: ({ pageParam = 0 }) => fetchCaptchas(pageParam, pageSize),
    getNextPageParam: (lastPage: FetchCaptchasResponse) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
    enabled,
  });

  // Mutation for deleting captcha with optimistic update
  const remove = useMutation({
    mutationFn: deleteCaptcha,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['captchas'] });

      const previousData = queryClient.getQueryData(['captchas']);

      queryClient.setQueryData(['captchas'], (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: FetchCaptchasResponse) => ({
            ...page,
            captchas: page.captchas.filter((captcha) => captcha.id !== id),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['captchas'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['captchas'] });
    },
  });

  // Flatten all captchas from all pages
  const allCaptchas = query.data?.pages.flatMap((page) => page.captchas) ?? [];

  return {
    captchas: allCaptchas,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    remove,
  };
}
