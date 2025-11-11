'use client'
import { Team } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Settings, UserCheck, Folder, Trash2, Mail } from 'lucide-react'

interface TeamsListProps {
  teams: Team[]
  onTeamCreate: () => void
  onTeamEdit: (team: Team) => void
  onTeamManage: (team: Team) => void
  onTeamDelete: (teamId: string) => void
  onTeamInvite?: (team: Team) => void
  onTeamViewProjects?: (team: Team) => void
}

export function TeamsList({ 
  teams, 
  onTeamCreate, 
  onTeamEdit, 
  onTeamManage, 
  onTeamDelete, 
  onTeamInvite,
  onTeamViewProjects 
}: TeamsListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipos</h2>
          <p className="text-gray-600">Gestiona los equipos y sus miembros</p>
        </div>
        <Button onClick={onTeamCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card className="text-center py-12 border-purple-100">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              No hay equipos creados
            </CardTitle>
            <CardDescription className="mb-6">
              Crea tu primer equipo para comenzar a colaborar en proyectos
            </CardDescription>
            <Button onClick={onTeamCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer equipo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-all border-purple-100 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      {team.name}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {team.description || 'Sin descripción'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-purple-50"
                      onClick={() => onTeamEdit(team)}
                      title="Configurar equipo"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
                          onTeamDelete(team.id)
                        }
                      }}
                      title="Eliminar equipo"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <UserCheck className="h-4 w-4" />
                      <span>{team.members?.length || 0} miembros</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Folder className="h-4 w-4" />
                      <span>{team.projects_count || 0} proyectos</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                    onClick={() => onTeamManage(team)}
                  >
                    Gestionar
                  </Button>
                  {onTeamViewProjects && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                      onClick={() => onTeamViewProjects(team)}
                      title="Ver proyectos del equipo"
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  )}
                  {onTeamInvite && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                      onClick={() => onTeamInvite(team)}
                      title="Invitar miembros"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Members Preview */}
                {team.members && team.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Miembros:</span>
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        {team.members.length}
                      </Badge>
                    </div>
                    <div className="flex -space-x-2 mt-2">
                      {team.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white"
                          title={member.user?.email}
                        >
                          <span className="text-xs font-medium text-purple-600">
                            {member.user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-medium text-gray-600">
                            +{team.members.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}