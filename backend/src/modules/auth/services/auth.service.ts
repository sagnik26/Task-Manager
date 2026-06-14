import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import config from "../../../shared/config";
import logger from "../../../shared/config/logger";
import { DEFAULT_TENANT_SLUG } from "../../../shared/constants/tenants";
import type { UserRole } from "../../../shared/constants/users";
import {
  permissionFlags,
  type PermissionFlags,
} from "../../../shared/permissions/permissions";
import { AppError } from "../../../shared/utils/AppError";
import SecurityUtils from "../../../shared/utils/SecurityUtils";
import { AuthRepository } from "../repositories/auth.repository";
import type { PublicUser, UserProfile, UserRow } from "../types/auth.types";

const BCRYPT_COST = 12;

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {
    if (!authRepository) {
      throw new Error("AuthRepository is required");
    }
  }

  private toPublicUser(row: UserRow): PublicUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      tenantId: row.tenant_id,
      role: row.role,
      isActive: row.is_active,
    };
  }

  private signToken(user: PublicUser): string {
    const secret = config.jwt.secret as Secret;
    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
    };
    return jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        tenant_id: user.tenantId,
        role: user.role,
      },
      secret,
      options,
    );
  }

  private async resolveDefaultTenantId(): Promise<string> {
    const tenantId = await this.authRepository.findTenantIdBySlug(
      DEFAULT_TENANT_SLUG,
    );
    if (!tenantId) {
      throw new AppError("default tenant not configured", 500);
    }
    return tenantId;
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: PublicUser }> {
    const passwordCheck = SecurityUtils.validatePassword(input.password);
    if (!passwordCheck.success) {
      throw new AppError("validation failed", 400, {
        password: passwordCheck.errors.join("; "),
      });
    }

    const email = input.email.trim().toLowerCase();
    const tenantId = await this.resolveDefaultTenantId();
    const existing = await this.authRepository.findByEmail(email, tenantId);
    if (existing) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await this.authRepository.create({
      name: input.name.trim(),
      email,
      hashedPassword,
      tenantId,
    });

    const token = this.signToken(user);
    logger.info("User registered", {
      userId: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { token, user };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: PublicUser }> {
    const normalizedEmail = email.trim().toLowerCase();
    const tenantId = await this.resolveDefaultTenantId();
    const row = await this.authRepository.findByEmail(normalizedEmail, tenantId);
    if (!row) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!row.is_active) {
      throw new AppError("account is inactive", 403);
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const user = this.toPublicUser(row);
    const token = this.signToken(user);
    logger.info("User logged in", {
      userId: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { token, user };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.authRepository.findById(userId);
    if (!profile) {
      throw new AppError("not found", 404);
    }
    return profile;
  }

  getPermissions(role: UserRole): PermissionFlags {
    return permissionFlags(role);
  }
}
