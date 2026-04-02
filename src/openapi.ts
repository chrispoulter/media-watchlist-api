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
          posterPath: { type: "string" },
          overview: { type: "string" },
          releaseDate: { type: "string" },
        },
        required: ["tmdbId", "mediaType"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          emailVerified: { type: "boolean" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt"],
      },
      Session: {
        type: "object",
        properties: {
          id: { type: "string" },
          token: { type: "string" },
          userId: { type: "string" },
          expiresAt: { type: "string", format: "date-time" },
          ipAddress: { type: "string", nullable: true },
          userAgent: { type: "string", nullable: true },
        },
        required: ["id", "token", "userId", "expiresAt"],
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication and session management" },
    { name: "Health", description: "Service health check" },
    { name: "Search", description: "Search for movies and TV shows via TMDB" },
    { name: "Watchlist", description: "Manage your personal media watchlist" },
    { name: "Events", description: "Real-time server-sent events" },
  ],
  paths: {
    // ── Auth ────────────────────────────────────────────────────────────────
    "/api/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign up with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  password: { type: "string", minLength: 8, example: "supersecret" },
                },
                required: ["name", "email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Account created. Verification email sent.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    session: { $ref: "#/components/schemas/Session" },
                  },
                },
              },
            },
          },
          "422": { description: "Email already in use or validation error." },
        },
      },
    },
    "/api/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  password: { type: "string", example: "supersecret" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in. Returns session token.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    session: { $ref: "#/components/schemas/Session" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials." },
        },
      },
    },
    "/api/auth/sign-out": {
      post: {
        tags: ["Auth"],
        summary: "Sign out (invalidate session)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Signed out successfully." },
          "401": { description: "Unauthorized." },
        },
      },
    },
    "/api/auth/get-session": {
      get: {
        tags: ["Auth"],
        summary: "Get current session",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current session and user.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    session: { $ref: "#/components/schemas/Session" },
                  },
                },
              },
            },
          },
          "401": { description: "No active session." },
        },
      },
    },
    "/api/auth/forget-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  redirectTo: { type: "string", example: "https://myapp.com/reset-password" },
                },
                required: ["email", "redirectTo"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Reset email sent if account exists." },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using token from email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string", example: "abc123..." },
                  newPassword: { type: "string", minLength: 8, example: "newpassword123" },
                },
                required: ["token", "newPassword"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Password reset successfully." },
          "400": { description: "Invalid or expired token." },
        },
      },
    },
    "/api/auth/sign-in/social": {
      get: {
        tags: ["Auth"],
        summary: "Sign in with a social provider (Google)",
        parameters: [
          {
            name: "provider",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["google"] },
            example: "google",
          },
          {
            name: "callbackURL",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "URL to redirect to after sign-in.",
            example: "https://myapp.com/",
          },
        ],
        responses: {
          "302": { description: "Redirect to provider OAuth page." },
        },
      },
    },
    "/api/auth/two-factor/enable": {
      post: {
        tags: ["Auth"],
        summary: "Enable two-factor authentication (TOTP)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", example: "currentpassword" },
                },
                required: ["password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "2FA enabled. Returns TOTP secret and QR code.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    secret: { type: "string" },
                    totpURI: { type: "string" },
                    backupCodes: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized or wrong password." },
        },
      },
    },
    "/api/auth/two-factor/disable": {
      post: {
        tags: ["Auth"],
        summary: "Disable two-factor authentication",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", example: "currentpassword" },
                },
                required: ["password"],
              },
            },
          },
        },
        responses: {
          "200": { description: "2FA disabled." },
          "401": { description: "Unauthorized or wrong password." },
        },
      },
    },
    "/api/auth/two-factor/verify-totp": {
      post: {
        tags: ["Auth"],
        summary: "Verify a TOTP code during sign-in",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string", example: "123456" },
                },
                required: ["code"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Code verified. Session fully authenticated." },
          "400": { description: "Invalid TOTP code." },
          "401": { description: "Unauthorized." },
        },
      },
    },
    "/api/auth/delete-user": {
      post: {
        tags: ["Auth"],
        summary: "Delete the authenticated user's account",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: {
                    type: "string",
                    example: "currentpassword",
                    description: "Current password for confirmation.",
                  },
                  callbackURL: {
                    type: "string",
                    example: "https://myapp.com/goodbye",
                    description: "URL to redirect to after deletion.",
                  },
                  token: {
                    type: "string",
                    description: "Deletion token (if using token-based deletion flow).",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Account deleted successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized." },
        },
      },
    },
    "/api/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change the authenticated user's password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  currentPassword: { type: "string", example: "oldpassword" },
                  newPassword: { type: "string", minLength: 8, example: "newpassword123" },
                  revokeOtherSessions: {
                    type: "boolean",
                    description: "Invalidate all other active sessions.",
                    example: true,
                  },
                },
                required: ["currentPassword", "newPassword"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", nullable: true },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { description: "Current password is incorrect." },
          "401": { description: "Unauthorized." },
        },
      },
    },
    "/api/auth/change-email": {
      post: {
        tags: ["Auth"],
        summary: "Change the authenticated user's email address",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  newEmail: { type: "string", format: "email", example: "newemail@example.com" },
                  callbackURL: {
                    type: "string",
                    example: "https://myapp.com/",
                    description: "URL to redirect to after verification (if required).",
                  },
                },
                required: ["newEmail"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Email updated successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    status: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid email address." },
          "401": { description: "Unauthorized." },
        },
      },
    },
    "/api/auth/update-user": {
      post: {
        tags: ["Auth"],
        summary: "Update the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Jane Smith" },
                  image: {
                    type: "string",
                    nullable: true,
                    example: "https://example.com/avatar.png",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User profile updated.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized." },
        },
      },
    },

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
        summary: "Search TMDB for movies and TV shows",
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
                  type: "object",
                  properties: {
                    results: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SearchResult" },
                    },
                  },
                  required: ["results"],
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

    // ── Events ───────────────────────────────────────────────────────────────
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Subscribe to real-time server-sent events",
        description:
          "Opens a persistent SSE connection. Events are scoped to the authenticated user.\n\n**Event types:**\n- `item-added` — a new item was added to the watchlist\n- `item-removed` — an item was removed from the watchlist",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "SSE stream.",
            content: {
              "text/event-stream": {
                schema: { type: "string" },
              },
            },
          },
          "401": { description: "Unauthorized." },
        },
      },
    },
  },
};
