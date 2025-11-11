-- Crear tipos enumerados solo si no existen
DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM ('todo', 'in_progress', 'review', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de proyectos si no existe
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de tareas (issues) si no existe
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status issue_status DEFAULT 'todo',
  priority issue_priority DEFAULT 'medium',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar duplicados)
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view all issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update issues they created or are assigned to" ON issues;
DROP POLICY IF EXISTS "Users can delete issues they created" ON issues;

-- Políticas para proyectos
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = created_by);

-- Políticas para issues
CREATE POLICY "Users can view all issues" ON issues
  FOR SELECT USING (true);

CREATE POLICY "Users can create issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update issues they created or are assigned to" ON issues
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete issues they created" ON issues
  FOR DELETE USING (auth.uid() = created_by);

-- Crear índices para mejor performance (si no existen)
DO $$ BEGIN
    CREATE INDEX idx_issues_project_id ON issues(project_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_issues_status ON issues(status);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_issues_priority ON issues(priority);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_projects_created_by ON projects(created_by);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;