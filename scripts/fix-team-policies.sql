-- Eliminar políticas problemáticas de team_members
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Eliminar políticas problemáticas de teams
DROP POLICY IF EXISTS "Team owners can update teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;

-- Eliminar políticas problemáticas de project_teams
DROP POLICY IF EXISTS "Project owners can manage project teams" ON project_teams;


-- Políticas simplificadas para teams
CREATE POLICY "Users can view all teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own teams" ON teams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own teams" ON teams FOR DELETE USING (auth.uid() = created_by);

-- Políticas simplificadas para team_members
CREATE POLICY "Users can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Team creators can manage members" ON team_members FOR ALL USING (
  auth.uid() IN (SELECT created_by FROM teams WHERE id = team_id)
);

-- Políticas simplificadas para project_teams
CREATE POLICY "Users can view project teams" ON project_teams FOR SELECT USING (true);
CREATE POLICY "Project creators can manage project teams" ON project_teams FOR ALL USING (
  auth.uid() IN (SELECT created_by FROM projects WHERE id = project_id)
);