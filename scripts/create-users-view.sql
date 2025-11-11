-- Crear una vista para acceder a los usuarios de forma segura
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  created_at
FROM auth.users;

-- Dar permisos a la vista
GRANT SELECT ON public.users TO authenticated;

-- Crear política para que los usuarios solo vean otros usuarios que están en sus equipos
CREATE POLICY "Users can view team members" ON public.users
FOR SELECT USING (
  id IN (
    SELECT user_id FROM team_members 
    WHERE team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  )
  OR id = auth.uid()
);