import { env } from "../env.js";
import { logger } from "./logger.js";

const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w300";
const FETCH_TIMEOUT_MS = 3_000;

interface TmdbSearchResponse {
  results: {
    id: number;
    media_type: "movie" | "tv" | "person";
    title: string;
    name: string;
    poster_path: string | null;
    overview: string | null;
    release_date: string | null;
    first_air_date: string | null;
  }[];
}

interface SearchResult {
  providerId: string;
  mediaType: "movie" | "tv-show";
  title: string;
  posterUrl: string | null;
  overview: string | null;
  releaseDate: string | null;
}

export const search = async (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  const params = new URLSearchParams({ query: normalizedQuery });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/search/multi?${params}`, {
      headers: { Authorization: `Bearer ${env.TMDB_API_READ_TOKEN}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error(
        { query: normalizedQuery, status: response.status, statusText: response.statusText },
        "TMDB API error"
      );
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as TmdbSearchResponse;

    const results = data.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) => ({
        providerId: `tmdb:${item.id}`,
        mediaType: (item.media_type == "movie" ? "movie" : "tv-show") as SearchResult["mediaType"],
        title: item.title || item.name,
        posterUrl: item.poster_path ? `${IMAGE_URL}${item.poster_path}` : null,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date || null,
      }));

    return results;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logger.error(
        { query: normalizedQuery, timeoutMs: FETCH_TIMEOUT_MS },
        "TMDB request timed out"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
