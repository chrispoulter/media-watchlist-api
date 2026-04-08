import { env } from "../env.js";
import { logger } from "./logger.js";

const BASE_URL = "https://api.themoviedb.org/3";
const FETCH_TIMEOUT_MS = 3_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface TmdbSearchMultiResponse {
  results: {
    id: number;
    media_type: "movie" | "tv";
    title: string;
    name: string;
    poster_path: string | null;
    overview: string;
    release_date: string | null;
    first_air_date: string | null;
  }[];
}

interface CacheEntry {
  data: TmdbSearchMultiResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const searchMulti = async (query: string) => {
  const key = query.trim().toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    logger.debug({ query: key }, "TMDB cache hit");
    return cached.data;
  }

  logger.debug({ query: key }, "TMDB cache miss");

  const params = new URLSearchParams({ query });
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/search/multi?${params.toString()}`, {
      headers: { Authorization: `Bearer ${env.TMDB_API_READ_TOKEN}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error(
        { query: key, status: response.status, statusText: response.statusText },
        "TMDB API error"
      );
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TmdbSearchMultiResponse;
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.error({ query: key, timeoutMs: FETCH_TIMEOUT_MS }, "TMDB request timed out");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
};
