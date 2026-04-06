export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Media Watchlist API",
    version: "1.0.0",
    description: "REST API for managing a personal media watchlist.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Session token returned by sign-in endpoints.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      WatchlistItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          tmdbId: { type: "integer" },
          mediaType: { type: "string", enum: ["movie", "tv"] },
          title: { type: "string" },
          posterPath: { type: "string", nullable: true },
          overview: { type: "string", nullable: true },
          releaseDate: { type: "string", nullable: true },
          addedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "tmdbId", "mediaType", "title"],
      },
      SearchResult: {
        type: "object",
        properties: {
          tmdbId: { type: "integer" },
          mediaType: { type: "string", enum: ["movie", "tv"] },
          title: { type: "string" },
          posterPath: { type: "string", nullable: true },
          overview: { type: "string", nullable: true },
          releaseDate: { type: "string", nullable: true },
          watchlistItemId: { type: "integer", nullable: true },
        },
        required: ["tmdbId", "mediaType"],
      },
    },
  },
  tags: [
    { name: "Health", description: "Service health check" },
    { name: "Search", description: "Search for movies and TV shows via TMDB" },
    { name: "Watchlist", description: "Manage your personal media watchlist" },
  ],
  paths: {
    // ── Health ───────────────────────────────────────────────────────────────
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", description: "Process uptime in seconds" },
                  },
                  required: ["status", "timestamp", "uptime"],
                },
              },
            },
          },
        },
      },
    },

    // ── Search ───────────────────────────────────────────────────────────────
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Search for movies and TV shows",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 1 },
            description: "Search query string.",
            example: "Breaking Bad",
          },
        ],
        responses: {
          "200": {
            description: "Search results.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SearchResult" },
                },
              },
            },
          },
          "400": { description: "Missing or invalid query parameter." },
          "401": { description: "Unauthorized." },
        },
      },
    },

    // ── Watchlist ────────────────────────────────────────────────────────────
    "/api/watchlist": {
      get: {
        tags: ["Watchlist"],
        summary: "Get all watchlist items for the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of watchlist items.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/WatchlistItem" },
                },
              },
            },
          },
          "401": { description: "Unauthorized." },
        },
      },
      post: {
        tags: ["Watchlist"],
        summary: "Add an item to the watchlist",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tmdbId: { type: "integer", example: 1396 },
                  mediaType: { type: "string", enum: ["movie", "tv"], example: "tv" },
                  title: { type: "string", example: "Breaking Bad" },
                  posterPath: { type: "string", example: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
                  overview: { type: "string", example: "A high school chemistry teacher..." },
                  releaseDate: { type: "string", example: "2008-01-20" },
                },
                required: ["tmdbId", "mediaType", "title"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Item added to watchlist.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatchlistItem" },
              },
            },
          },
          "400": { description: "Invalid request body." },
          "401": { description: "Unauthorized." },
          "409": { description: "Item already exists in watchlist." },
        },
      },
    },
    "/api/watchlist/{id}": {
      delete: {
        tags: ["Watchlist"],
        summary: "Remove an item from the watchlist",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Watchlist item ID.",
            example: 42,
          },
        ],
        responses: {
          "204": { description: "Item removed." },
          "400": { description: "Invalid ID." },
          "401": { description: "Unauthorized." },
          "404": { description: "Item not found in watchlist." },
        },
      },
    },
  },
};
