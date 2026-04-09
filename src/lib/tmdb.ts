import { env } from "../env.js";
import { logger } from "./logger.js";

const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w300";
const FETCH_TIMEOUT_MS = 3_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface TmdbSearchMultiResponse {
  results: {
    id: number;
    media_type: "movie" | "tv";
    title: string;
    name: string;
    poster_path: string | null;
    overview: string | null;
    release_date: string | null;
    first_air_date: string | null;
  }[];
}

interface SearchResults {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  overview: string | null;
  releaseDate: string | null;
}

interface CacheEntry {
  results: SearchResults[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const searchMulti = async (query: string) => {
  const key = query.trim().toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    logger.debug({ query: key }, "TMDB cache hit");
    return cached.results;
  }

  logger.debug({ query: key }, "TMDB cache miss");

  const params = new URLSearchParams({ query });
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/search/multi?${params.toString()}`, {
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

    const results = data.results.map((item) => ({
      tmdbId: item.id,
      mediaType: item.media_type,
      title: item.title || item.name,
      posterPath: item.poster_path ? `${IMAGE_URL}${item.poster_path}` : null,
      overview: item.overview,
      releaseDate: item.release_date || item.first_air_date || null,
    }));

    cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });

    return results;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.error({ query: key, timeoutMs: FETCH_TIMEOUT_MS }, "TMDB request timed out");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
};
