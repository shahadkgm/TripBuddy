export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthPageProps {
  mode: 'login' | 'register';
}