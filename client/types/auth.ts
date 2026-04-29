export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
}

/** GET/PATCH `/api/me` */
export interface MyProfile {
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
}

export interface MyProfileUpdatePayload {
  name: string;
  phoneNumber: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

export interface FindIdResponse {
  email: string;
}
