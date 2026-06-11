/**
 * SecurityUtils - Utility class for security-related functions such as password validation.
 * This class can be extended in the future to include additional security features like token generation, encryption, etc.
 */

import config from "../config";
import type { PasswordValidationResult } from "../types/security";

class SecurityUtils {
  /**
   * Validates a password against the defined security requirements.
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const requirements = config.password;

    if (!password) {
      return {
        success: false,
        errors: ["Password is required"],
      };
    }

    if (password.length < requirements.minLength) {
      errors.push(
        `Password must be at least ${requirements.minLength} chars long!`,
      );
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (requirements.requireNumbers && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (requirements.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}

export default SecurityUtils;
