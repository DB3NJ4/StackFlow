import './globals.css'
import { ReactNode } from 'react'

interface RootLayoutProps {
  children: ReactNode
}

export const metadata = {
  title: 'StackFlow - Gestión de Proyectos',
  description: 'Sistema de gestión de proyectos tipo Jira',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-purple-50 to-white min-h-screen">
        {children}
      </body>
    </html>
  )
}