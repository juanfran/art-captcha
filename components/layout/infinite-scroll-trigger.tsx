import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { LoadingSpinner } from '@/components/layout/loading-spinner';

interface InfiniteScrollTriggerProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function InfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollTriggerProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) {
    return null;
  }

  return (
    <div ref={ref} className="flex justify-center py-8">
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}
