-- Evaluator seed data (idempotent). Login: test@example.com / password123
-- Applied only when RUN_SEED=1 (see scripts/entrypoint.sh).

INSERT INTO users (id, name, email, password)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  'Test User',
  'test@example.com',
  '$2b$12$m9Xd8YGHn6uqn0VwsHNT7uBOEXVKIhYl4J7Kouv.BFcj4Flw9EKpm'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (id, name, description, owner_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid,
  'Website Redesign',
  'Q2 website redesign project',
  u.id
FROM users u
WHERE u.email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (
  id,
  title,
  description,
  status,
  priority,
  project_id,
  assignee_id,
  created_by,
  due_date
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccc01'::uuid,
  'Design homepage',
  NULL,
  'todo',
  'high',
  p.id,
  u.id,
  u.id,
  NULL
FROM users u
JOIN projects p ON p.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid
WHERE u.email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (
  id,
  title,
  description,
  status,
  priority,
  project_id,
  assignee_id,
  created_by,
  due_date
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccc02'::uuid,
  'Implement auth flow',
  NULL,
  'in_progress',
  'medium',
  p.id,
  u.id,
  u.id,
  NULL
FROM users u
JOIN projects p ON p.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid
WHERE u.email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (
  id,
  title,
  description,
  status,
  priority,
  project_id,
  assignee_id,
  created_by,
  due_date
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccc03'::uuid,
  'Write API docs',
  NULL,
  'done',
  'low',
  p.id,
  NULL,
  u.id,
  NULL
FROM users u
JOIN projects p ON p.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid
WHERE u.email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;
