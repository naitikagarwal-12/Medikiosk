const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8443",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
];

export const allowOrigins = (): string[] => {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    return [...ALLOWED_ORIGINS, corsOrigin];
  }
  return ALLOWED_ORIGINS;
};
