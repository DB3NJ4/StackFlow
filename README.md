# 🌌 StackFlow — Gestión Ágil de Proyectos

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-9333EA?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-9333EA?style=for-the-badge)

> **StackFlow** es una aplicación moderna de gestión de tareas y proyectos inspirada en Jira, diseñada para equipos que buscan fluidez, orden y estilo.  
> Construida con **Next.js**, **Supabase**, **TypeScript** y **TailwindCSS**.

---

## ⚙️ Tecnologías

| Tecnología | Descripción |
|-------------|-------------|
| **Next.js** | Framework React para SSR y rendimiento top. |
| **Supabase** | Base de datos y autenticación en tiempo real. |
| **TypeScript** | Tipado estático y desarrollo seguro. |
| **TailwindCSS** | Estilos rápidos y diseño responsive. |

---

## 🚀 Features principales

- 🧩 **Boards personalizables**: organiza tareas como quieras (Kanban style).  
- 👥 **Colaboración en tiempo real**: trabaja con tu equipo sin refrescar la página.  
- 🔐 **Autenticación con Supabase**: registro e inicio de sesión seguros.  
- 🎯 **Gestión de tareas y prioridades**: status, etiquetas, deadlines y más.  
- 📱 **Diseño responsive**: pensado tanto para desktop como mobile.  
- 🌙 **Modo oscuro (soon)**: para una experiencia más chill.

---

## 🛠️ Instalación

```bash
# Clonar el repo
git clone https://github.com/tuusuario/stackflow.git

# Entrar al directorio
cd stackflow

# Instalar dependencias
npm install

# Crear archivo .env.local con tus variables de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# Ejecutar el proyecto en modo desarrollo
npm run dev
