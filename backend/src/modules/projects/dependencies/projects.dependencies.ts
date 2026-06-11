import { getPool } from "../../../shared/db/pool";
import { ProjectsController } from "../controllers/projects.controller";
import { ProjectsRepository } from "../repositories/projects.repository";
import { ProjectsService } from "../services/projects.service";

const pool = getPool();

const projectsRepository = new ProjectsRepository(pool);
const projectsService = new ProjectsService(projectsRepository);
const projectsController = new ProjectsController(projectsService);

export default {
  repositories: { projectsRepository },
  services: { projectsService },
  controllers: { projectsController },
};

