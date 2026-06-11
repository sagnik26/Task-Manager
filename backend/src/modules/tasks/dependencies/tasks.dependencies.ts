import { getPool } from "../../../shared/db/pool";
import projectsDeps from "../../projects/dependencies/projects.dependencies";
import { TasksController } from "../controllers/tasks.controller";
import { TasksRepository } from "../repositories/tasks.repository";
import { TasksService } from "../services/tasks.service";

const pool = getPool();

const tasksRepository = new TasksRepository(pool);
const tasksService = new TasksService(
  tasksRepository,
  projectsDeps.services.projectsService,
);
const tasksController = new TasksController(tasksService);

export default {
  repositories: { tasksRepository },
  services: { tasksService },
  controllers: { tasksController },
};

