import { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from '@/types';

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setProjectState] = useState<Project | null>(() => {
    try {
      const stored = localStorage.getItem('selectedProject');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setSelectedProject = (project: Project | null) => {
    setProjectState(project);
    if (project) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('selectedProject');
    }
  };

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}