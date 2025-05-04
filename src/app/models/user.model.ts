export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
} 