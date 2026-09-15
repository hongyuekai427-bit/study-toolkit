import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, FolderKanban } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Project, Milestone, ProjectTask } from '../types';
import { v4 as uuid } from 'uuid';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', subject: '', deadline: '' });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    const data = await dbGetAll<Project>('projects');
    setProjects(data);
  };

  const createProject = async () => {
    if (!form.name.trim()) return;
    const project: Project = {
      id: uuid(), name: form.name.trim(), description: form.description.trim(),
      subject: form.subject.trim(), deadline: form.deadline,
      milestones: [{ id: uuid(), name: 'Research', completed: false, tasks: [] }, { id: uuid(), name: 'Draft', completed: false, tasks: [] }, { id: uuid(), name: 'Build', completed: false, tasks: [] }, { id: uuid(), name: 'Review', completed: false, tasks: [] }, { id: uuid(), name: 'Final', completed: false, tasks: [] }],
      createdAt: new Date().toISOString(),
    };
    await dbPut('projects', project);
    setForm({ name: '', description: '', subject: '', deadline: '' });
    setShowCreate(false);
    loadProjects();
  };

  const deleteProject = async (id: string) => {
    await dbDelete('projects', id);
    if (activeProject?.id === id) setActiveProject(null);
    loadProjects();
  };

  const addMilestone = async () => {
    if (!activeProject) return;
    const milestone: Milestone = { id: uuid(), name: 'New Milestone', completed: false, tasks: [] };
    const updated = { ...activeProject, milestones: [...activeProject.milestones, milestone] };
    await dbPut('projects', updated);
    setActiveProject(updated);
    loadProjects();
  };

  const addTask = async (milestoneId: string) => {
    if (!activeProject) return;
    const task: ProjectTask = { id: uuid(), title: 'New Task', completed: false };
    const updated = { ...activeProject, milestones: activeProject.milestones.map(m => m.id === milestoneId ? { ...m, tasks: [...m.tasks, task] } : m) };
    await dbPut('projects', updated);
    setActiveProject(updated);
    loadProjects();
  };

  const toggleTask = async (milestoneId: string, taskId: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, milestones: activeProject.milestones.map(m => m.id === milestoneId ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) } : m) };
    await dbPut('projects', updated);
    setActiveProject(updated);
    loadProjects();
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!activeProject) return;
    const updated = { ...activeProject, milestones: activeProject.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m) };
    await dbPut('projects', updated);
    setActiveProject(updated);
    loadProjects();
  };

  const getProgress = (project: Project) => {
    const totalTasks = project.milestones.reduce((sum, m) => sum + m.tasks.length, 0);
    const completedTasks = project.milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.completed).length, 0);
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  if (activeProject) {
    const progress = getProgress(activeProject);
    return (
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        <button onClick={() => setActiveProject(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to projects</button>
        <h1 className="text-2xl font-bold mb-1">{activeProject.name}</h1>
        {activeProject.subject && <p className="text-gray-500 text-sm">{activeProject.subject}</p>}
        {activeProject.deadline && <p className="text-sm text-orange-500 mt-1">Deadline: {new Date(activeProject.deadline).toLocaleDateString()}</p>}
        
        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-4">
          {activeProject.milestones.map(milestone => {
            const mProgress = milestone.tasks.length === 0 ? 0 : Math.round(milestone.tasks.filter(t => t.completed).length / milestone.tasks.length * 100);
            return (
              <div key={milestone.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => toggleMilestone(milestone.id)} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {milestone.completed && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : ''}`}>{milestone.name}</span>
                  </button>
                  <span className="text-xs text-gray-500">{mProgress}%</span>
                </div>
                <div className="ml-7 space-y-1">
                  {milestone.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                      <button onClick={() => toggleTask(milestone.id, task.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {task.completed && <Check size={10} className="text-white" />}
                      </button>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
                    </div>
                  ))}
                  <button onClick={() => addTask(milestone.id)} className="text-xs text-indigo-500 hover:underline mt-1">+ Add task</button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={addMilestone} className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:underline"><Plus size={14} /> Add milestone</button>
        <button onClick={() => deleteProject(activeProject.id)} className="mt-4 ml-4 text-sm text-red-500 hover:underline">Delete project</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> New Project</button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={createProject} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Project</button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FolderKanban size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Create a project to plan your work</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <button key={project.id} onClick={() => setActiveProject(project)} className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{project.name}</h3>
                <span className="text-sm text-gray-500">{getProgress(project)}%</span>
              </div>
              {project.subject && <p className="text-sm text-gray-500">{project.subject}</p>}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getProgress(project)}%` }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
