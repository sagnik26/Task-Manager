import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is required. Set it in the environment or backend/.env (see .env.example).",
  );
}

const config = {
  // Server
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10) || 4000,

  // postgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "taskflow",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
  },

  // Auth
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expiresIn: 24 * 60 * 60 * 1000,
  },

  // Password validation
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
    requireUppercase:
      (process.env.PASSWORD_REQUIRE_UPPERCASE || "true") === "true",
    requireLowercase:
      (process.env.PASSWORD_REQUIRE_LOWERCASE || "true") === "true",
    requireNumbers: (process.env.PASSWORD_REQUIRE_NUMBERS || "true") === "true",
    requireSymbols: (process.env.PASSWORD_REQUIRE_SYMBOLS || "true") === "true",
  },
};

export default config;
