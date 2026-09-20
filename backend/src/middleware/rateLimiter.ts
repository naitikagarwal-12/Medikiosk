import rateLimit from "express-rate-limit";


const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

export default rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => req.path === "/health" || req.path === "/api/health",
});
