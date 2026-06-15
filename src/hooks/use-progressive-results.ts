"use client";

import { useState, useTransition } from "react";

export function useProgressiveResults<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, startTransition] = useTransition();
  const visibleItems = items.slice(0, visibleCount);

  function loadMore() {
    startTransition(() => {
      setVisibleCount((current) =>
        Math.min(current + pageSize, items.length),
      );
    });
  }

  function reset() {
    setVisibleCount(pageSize);
  }

  return {
    hasMore: visibleItems.length < items.length,
    isLoading,
    loadMore,
    reset,
    visibleItems,
  };
}
