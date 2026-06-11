import { getPool } from "../../../shared/db/pool";
import { AuthController } from "../controllers/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../services/auth.service";

const pool = getPool();

const authRepository = new AuthRepository(pool);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export default {
  repositories: { authRepository },
  services: { authService },
  controllers: { authController },
};
