import { getPool } from "../../../shared/db/pool";
import { UsersController } from "../controllers/users.controller";
import { UsersRepository } from "../repositories/users.repository";
import { UsersService } from "../services/users.service";

const pool = getPool();

const usersRepository = new UsersRepository(pool);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

export default {
  repositories: { usersRepository },
  services: { usersService },
  controllers: { usersController },
};
