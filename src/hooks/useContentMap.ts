import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

export function useContentMap() {
  const { data: contentList, isLoading: contentLoading } = trpc.content.getAll.useQuery();
  const { data: configList, isLoading: configLoading } = trpc.config.getAll.useQuery();

  const content = useMemo(() => {
    const map = new Map<string, string>();
    if (contentList) {
      for (const item of contentList) {
        map.set(item.key, item.content);
      }
    }
    return map;
  }, [contentList]);

  const config = useMemo(() => {
    const map = new Map<string, string>();
    if (configList) {
      for (const item of configList) {
        map.set(item.key, item.value);
      }
    }
    return map;
  }, [configList]);

  const getContent = (key: string, fallback = ""): string => {
    return content.get(key) ?? fallback;
  };

  const getConfig = (key: string, fallback = ""): string => {
    return config.get(key) ?? fallback;
  };

  return {
    getContent,
    getConfig,
    isLoading: contentLoading || configLoading,
  };
}
