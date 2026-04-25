// Data sent TO backend
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleLoginDTO {
  token: string;
}

// Data received FROM backend
export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'guide';
  isBlocked?: boolean;
  bio?: string;
  avatarURL?: string;
  walletBalance?: number;
  guideProfile?: {
    _id: string;
    dailyRate: number;
    serviceArea?: string;
    bio?: string;
    yearsOfExperience?: number;
    specialties?: string[];
    avatarURL?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatarURL?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ConnectionRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  };
  receiverId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        avatarURL?: string;
      };
  tripId?: {
    _id: string;
    title: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
