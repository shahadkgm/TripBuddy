import type {
  AuthUser,
  LoginDTO,
  RegisterDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  AuthResponse,
} from '../types/auth.dto';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants/api.constants';

export const authService = {
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    const { user, accessToken } = response.data.data;
    if (accessToken && user) {
      this.setToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data.data;
  },

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const { user, accessToken } = response.data.data;
    if (accessToken && user) {
      this.setToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  async verifyEmail(token: string) {
    return await api.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token));
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { token });
    const { user, accessToken } = response.data.data;
    if (accessToken && user) {
      this.setToken(accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    window.location.replace('/login');
  },

  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user: AuthUser = JSON.parse(userStr);
      return {
        ...user,
        isBlocked: user.isBlocked ?? false,
      };
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem('accessToken');
    return token ? token.replace(/^"|"$/g, '') : null;
  },

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
    // Manually fire 'storage' so SocketProvider (same tab) can reconnect with fresh token
    window.dispatchEvent(new Event('storage'));
  },

  async updateProfile(userId: string, updateData: UpdateProfileDTO): Promise<AuthUser> {
    const response = await api.patch(API_ENDPOINTS.USERS.PROFILE(userId), updateData);
    const updatedUser = response.data.data;

    if (updatedUser) {
      const currentUser = this.getCurrentUser();
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('storage'));
    }
    return updatedUser;
  },

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const response = await api.post(API_ENDPOINTS.USERS.PASSWORD(userId), data);
    return response.data;
  },

  async getProfile(userId: string): Promise<AuthUser> {
    const response = await api.get(API_ENDPOINTS.USERS.PROFILE(userId));
    const updatedUser = response.data.data;
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
    }
    return updatedUser;
  },
};
