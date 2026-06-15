-- Admin:   test@example.com / password123
-- Developer: nikg26@gmail.com / password123
-- Applied only when RUN_SEED=1 (see scripts/entrypoint.sh).

INSERT INTO tenants (id, name, slug)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'TaskFlow',
  'taskflow'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, tenant_id, name, email, password_hash, role, is_active)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'Test User',
  'test@example.com',
  '$2b$12$m9Xd8YGHn6uqn0VwsHNT7uBOEXVKIhYl4J7Kouv.BFcj4Flw9EKpm',
  'admin',
  true
)
ON CONFLICT (tenant_id, email) DO NOTHING;

INSERT INTO users (id, tenant_id, name, email, password_hash, role, is_active)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'Nik Developer',
  'nikg26@gmail.com',
  '$2b$12$m9Xd8YGHn6uqn0VwsHNT7uBOEXVKIhYl4J7Kouv.BFcj4Flw9EKpm',
  'developer',
  true
)
ON CONFLICT (tenant_id, email) DO NOTHING;

INSERT INTO projects (id, tenant_id, name, description, status)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'Website Redesign',
  'Q2 website redesign project',
  'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_members (project_id, user_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid,
  u.id
FROM users u
WHERE u.email IN ('test@example.com', 'nikg26@gmail.com')
  AND u.tenant_id = 'dddddddd-dddd-dddd-dddd-dddddddddd01'
ON CONFLICT (project_id, user_id) DO NOTHING;

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
