/**
 * OpenAPI 3 document for Swagger UI at `/api-docs`.
 * Kept in TypeScript so paths stay aligned with route modules.
 */

const uuid = {
  type: "string",
  format: "uuid",
} as const;

const successEnvelope = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    data: {},
    statusCode: { type: "integer" },
    timestamp: { type: "string", format: "date-time" },
  },
} as const;

const validationError = {
  description: "Validation failed",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: { type: "string", example: "validation failed" },
          fields: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    },
  },
} as const;

const unauthorized = {
  description: "Missing or invalid JWT",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { error: { type: "string", example: "unauthorized" } },
      },
    },
  },
} as const;

const forbidden = {
  description: "Authenticated but not allowed",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { error: { type: "string", example: "forbidden" } },
      },
    },
  },
} as const;

const notFound = {
  description: "Resource not found",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { error: { type: "string", example: "not found" } },
      },
    },
  },
} as const;

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "Task management API. Use **Authorize** with a JWT from `POST /auth/login` or `POST /auth/register` (`token` in the response body).",
  },
  servers: [{ url: "/", description: "This server" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Projects" },
    { name: "Tasks" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AuthPayload: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: uuid,
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
        },
      },
      Profile: {
        type: "object",
        properties: {
          id: uuid,
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      CreateProjectRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      UpdateProjectRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
        description: "At least one of `name` or `description` is required.",
      },
      CreateTaskRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          assignee_id: { ...uuid, nullable: true },
          due_date: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            nullable: true,
            example: "2026-04-14",
          },
        },
      },
      UpdateTaskRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          assignee_id: { ...uuid, nullable: true },
          due_date: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            nullable: true,
          },
        },
        description: "At least one field must be provided.",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            status: { type: "string", example: "healthy" },
                            timestamp: { type: "string", format: "date-time" },
                            uptime: { type: "number" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthPayload" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": validationError,
          "409": {
            description: "Conflict (e.g. email already exists)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/AuthPayload" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": validationError,
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Profile" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": unauthorized,
        },
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects the user can access",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: { data: { type: "array", items: {} } },
                    },
                  ],
                },
              },
            },
          },
          "401": unauthorized,
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProjectRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "400": validationError,
          "401": unauthorized,
        },
      },
    },
    "/projects/{id}/stats": {
      get: {
        tags: ["Projects"],
        summary: "Task stats for a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Project detail with tasks",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update project (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProjectRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete project and tasks (owner only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/projects/{id}/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks in a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["todo", "in_progress", "done"],
            },
          },
          {
            name: "assignee",
            in: "query",
            required: false,
            description: "Filter by assignee user UUID",
            schema: uuid,
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    successEnvelope,
                    {
                      type: "object",
                      properties: { data: { type: "array", items: {} } },
                    },
                  ],
                },
              },
            },
          },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task in a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTaskRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/tasks/{id}": {
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task (project owner or creator)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: uuid,
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { allOf: [successEnvelope] },
              },
            },
          },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
  },
};
