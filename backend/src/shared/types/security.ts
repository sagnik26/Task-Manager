export type PasswordRequirements = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
};

export type PasswordValidationResult = {
  success: boolean;
  errors: string[];
};
