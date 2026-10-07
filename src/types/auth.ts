import { UserRole } from "@/constants/roles";

/**
 * Auth-related type definitions.
 */

/** JWT token payload (decoded) */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/** Auth tokens returned from the backend */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request payload */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Auth session (used in middleware and auth store) */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  isAuthenticated: boolean;
}
