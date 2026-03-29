export interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export interface SessionUser {
  id: string;
  email?: string;
  status?: string;
  provider?: string;
}

export interface BindStatus {
  email_bound: boolean;
  password_set: boolean;
  apple_bound: boolean;
  google_bound: boolean;
}

export interface SessionResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SessionUser;
  profile?: Record<string, unknown>;
  bind_status?: BindStatus;
}
