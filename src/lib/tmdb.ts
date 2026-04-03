import { env } from "../env.js";

const BASE_URL = "https://api.themoviedb.org/3";
const FETCH_TIMEOUT_MS = 3_000;

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

export const searchMulti = async (query: string) => {
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

    return (await response.json()) as TmdbSearchMultiResponse;
  } finally {
    clearTimeout(id);
  }
};
