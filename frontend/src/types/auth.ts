export type User = {
  id: string;
  name: string;
  email: string;
};

// Cookie-based JWT means the token is not accessible to the frontend.
export type AuthSession = {
  user: User | null;
};

