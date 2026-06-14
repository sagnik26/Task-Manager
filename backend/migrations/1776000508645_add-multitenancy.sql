-- Up Migration

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tenants (id, name, slug)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'TaskFlow',
  'taskflow'
);

ALTER TABLE users
  ADD COLUMN tenant_id UUID REFERENCES tenants (id),
  ADD COLUMN role VARCHAR(20) CHECK (role IN ('admin', 'developer')),
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE users
SET tenant_id = 'dddddddd-dddd-dddd-dddd-dddddddddd01',
    role = CASE
      WHEN email = 'test@example.com' THEN 'admin'
      ELSE 'developer'
    END;

ALTER TABLE users
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN role SET DEFAULT 'developer';

ALTER TABLE users DROP CONSTRAINT users_email_key;
ALTER TABLE users ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);

ALTER TABLE users RENAME COLUMN password TO password_hash;

ALTER TABLE projects
  ADD COLUMN tenant_id UUID REFERENCES tenants (id),
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'));

UPDATE projects p
SET tenant_id = u.tenant_id
FROM users u
WHERE p.owner_id = u.id;

ALTER TABLE projects ALTER COLUMN tenant_id SET NOT NULL;

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

INSERT INTO project_members (project_id, user_id)
SELECT id, owner_id
FROM projects;

DROP INDEX IF EXISTS idx_projects_owner;
ALTER TABLE projects DROP COLUMN owner_id;

CREATE INDEX idx_projects_tenant ON projects (tenant_id);

-- Down Migration

ALTER TABLE projects
  ADD COLUMN owner_id UUID REFERENCES users (id) ON DELETE CASCADE;

UPDATE projects p
SET owner_id = sub.user_id
FROM (
  SELECT DISTINCT ON (project_id) project_id, user_id
  FROM project_members
  ORDER BY project_id, joined_at ASC
) AS sub
WHERE p.id = sub.project_id;

ALTER TABLE projects ALTER COLUMN owner_id SET NOT NULL;

DROP TABLE IF EXISTS project_members;

DROP INDEX IF EXISTS idx_projects_tenant;
ALTER TABLE projects DROP COLUMN IF EXISTS status;
ALTER TABLE projects DROP COLUMN IF EXISTS tenant_id;

CREATE INDEX idx_projects_owner ON projects (owner_id);

ALTER TABLE users RENAME COLUMN password_hash TO password;

ALTER TABLE users DROP CONSTRAINT users_tenant_id_email_key;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE users
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS tenant_id;

DROP TABLE IF EXISTS tenants;
