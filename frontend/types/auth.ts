export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}