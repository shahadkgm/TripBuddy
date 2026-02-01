export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  role?:"user"|"guide"|"admin";
isGoogleUser?: boolean;
isblocked:boolean;
}
export interface LoginDTO {
  email: string;
  password: string;
}
