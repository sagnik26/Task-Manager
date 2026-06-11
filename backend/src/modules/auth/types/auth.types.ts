export type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type UserProfile = PublicUser & {
  created_at: Date;
};

export type CreateUserInput = {
  name: string;
  email: string;
  hashedPassword: string;
};
