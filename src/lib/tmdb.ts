import { env } from "../env.js";

const BASE_URL = "https://api.themoviedb.org/3";
const FETCH_TIMEOUT_MS = 3_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type TmdbSearchMultiResponse = {
  results: {
    id: number;
    media_type: "movie" | "tv";
    title: string;
    name: string;
    poster_path: string | null;
    overview: string;
    release_date: string | null;
  }[];
};

interface CacheEntry {
  data: TmdbSearchMultiResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const searchMulti = async (query: string) => {
  const key = query.trim().toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const params = new URLSearchParams({ query });
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/search/multi?${params.toString()}`, {
      headers: { Authorization: `Bearer ${env.TMDB_API_READ_TOKEN}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TmdbSearchMultiResponse;
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } finally {
    clearTimeout(id);
  }
};
