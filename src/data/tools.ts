import { ToolDefinition } from '../types';

export const TOOLS: ToolDefinition[] = [
  // Math
  { id: 'calculator', name: 'Calculator', description: 'Scientific calculator with history', category: 'Math', icon: 'Calculator', path: '/calculator', keywords: ['math', 'calc', 'compute', 'scientific'] },
  { id: 'fraction', name: 'Fraction Calculator', description: 'Add, subtract, multiply, divide fractions', category: 'Math', icon: 'Divide', path: '/fractions', keywords: ['fraction', 'numerator', 'denominator', 'simplify'] },
  { id: 'percentage', name: 'Percentage Tools', description: 'Percentage calculations, discounts, tax', category: 'Math', icon: 'Percent', path: '/percentage', keywords: ['percent', 'discount', 'tax', 'markup', 'score'] },
  { id: 'geometry', name: 'Geometry Calculator', description: 'Area, perimeter, volume of shapes', category: 'Math', icon: 'Triangle', path: '/geometry', keywords: ['area', 'volume', 'perimeter', 'shape', 'circle', 'triangle'] },
  { id: 'graph', name: 'Function Grapher', description: 'Plot mathematical functions', category: 'Math', icon: 'TrendingUp', path: '/graph', keywords: ['graph', 'plot', 'function', 'chart', 'equation'] },
  { id: 'science', name: 'Science Tools', description: 'Physics and chemistry calculators', category: 'Math', icon: 'Atom', path: '/science', keywords: ['physics', 'chemistry', 'force', 'velocity', 'moles', 'density'] },
  
  // Converters
  { id: 'units', name: 'Unit Converter', description: 'Convert between units of measurement', category: 'Converters', icon: 'ArrowLeftRight', path: '/units', keywords: ['convert', 'units', 'length', 'weight', 'temperature', 'volume', 'mass'] },
  { id: 'dates', name: 'Date & Time Tools', description: 'Date differences, countdowns, school days', category: 'Converters', icon: 'Calendar', path: '/dates', keywords: ['date', 'time', 'countdown', 'days', 'deadline', 'calendar', 'age'] },
  
  // Study
  { id: 'flashcards', name: 'Flashcards', description: 'Create and study flashcard decks', category: 'Study', icon: 'Layers', path: '/flashcards', keywords: ['flashcard', 'study', 'memorize', 'review', 'deck'] },
  { id: 'quiz', name: 'Quiz Builder', description: 'Create custom quizzes and tests', category: 'Study', icon: 'HelpCircle', path: '/quiz', keywords: ['quiz', 'test', 'exam', 'practice', 'mcq'] },
  { id: 'grades', name: 'Grade Calculator', description: 'Calculate grades, weighted averages, GPA', category: 'Study', icon: 'Award', path: '/grades', keywords: ['grade', 'gpa', 'average', 'score', 'marks', 'weighted'] },
  
  // Writing
  { id: 'wordcount', name: 'Word Counter', description: 'Count words, characters, reading time', category: 'Writing', icon: 'FileText', path: '/wordcount', keywords: ['word', 'count', 'character', 'reading', 'essay', 'paragraph'] },
  { id: 'textanalyzer', name: 'Text Analyzer', description: 'Analyze writing for readability and patterns', category: 'Writing', icon: 'Search', path: '/textanalyzer', keywords: ['text', 'analyze', 'readability', 'sentence', 'vocabulary'] },
  { id: 'citation', name: 'Citation Generator', description: 'Generate APA, MLA, Chicago citations', category: 'Writing', icon: 'BookOpen', path: '/citation', keywords: ['citation', 'reference', 'bibliography', 'apa', 'mla', 'chicago', 'source'] },
  { id: 'essay', name: 'Essay Planner', description: 'Structure essays with intro, body, conclusion', category: 'Writing', icon: 'Edit3', path: '/essay', keywords: ['essay', 'writing', 'outline', 'thesis', 'paragraph', 'structure'] },
  
  // Planning
  { id: 'tasks', name: 'Task Manager', description: 'Organize tasks with priorities and deadlines', category: 'Planning', icon: 'CheckSquare', path: '/tasks', keywords: ['task', 'todo', 'assignment', 'homework', 'deadline'] },
  { id: 'planner', name: 'School Planner', description: 'Weekly timetable and schedule', category: 'Planning', icon: 'CalendarDays', path: '/planner', keywords: ['planner', 'schedule', 'timetable', 'class', 'school'] },
  { id: 'projects', name: 'Project Planner', description: 'Plan projects with milestones', category: 'Planning', icon: 'FolderKanban', path: '/projects', keywords: ['project', 'milestone', 'plan', 'organize'] },
  { id: 'presentation', name: 'Presentation Planner', description: 'Plan presentations slide by slide', category: 'Planning', icon: 'Presentation', path: '/presentation', keywords: ['presentation', 'slides', 'powerpoint', 'speech'] },
  
  // Productivity
  { id: 'timer', name: 'Study Timer', description: 'Pomodoro timer with focus modes', category: 'Productivity', icon: 'Timer', path: '/timer', keywords: ['timer', 'pomodoro', 'focus', 'study', 'break', 'concentration'] },
  { id: 'notes', name: 'Notes', description: 'Take and organize notes', category: 'Productivity', icon: 'StickyNote', path: '/notes', keywords: ['note', 'write', 'markdown', 'document'] },
  { id: 'references', name: 'Reference Organizer', description: 'Save and organize research sources', category: 'Productivity', icon: 'Library', path: '/references', keywords: ['reference', 'source', 'research', 'bookmark'] },
  
  // Utilities
  { id: 'password', name: 'Password Generator', description: 'Generate secure passwords locally', category: 'Utilities', icon: 'Key', path: '/password', keywords: ['password', 'secure', 'random', 'generate'] },
  { id: 'random', name: 'Random Tools', description: 'Random numbers, dice, teams, coin flip', category: 'Utilities', icon: 'Shuffle', path: '/random', keywords: ['random', 'dice', 'coin', 'team', 'group', 'number'] },
  { id: 'color', name: 'Color Tools', description: 'Color picker, contrast checker', category: 'Utilities', icon: 'Palette', path: '/color', keywords: ['color', 'hex', 'rgb', 'hsl', 'contrast', 'palette'] },
  { id: 'qrcode', name: 'QR Code Generator', description: 'Generate QR codes locally', category: 'Utilities', icon: 'QrCode', path: '/qrcode', keywords: ['qr', 'code', 'scan', 'barcode'] },
  { id: 'datatable', name: 'Data Table', description: 'Lightweight spreadsheet-like table', category: 'Utilities', icon: 'Table', path: '/datatable', keywords: ['table', 'spreadsheet', 'data', 'csv', 'grid'] },
  { id: 'charts', name: 'Chart Builder', description: 'Create bar, line, pie charts', category: 'Utilities', icon: 'BarChart3', path: '/charts', keywords: ['chart', 'graph', 'bar', 'pie', 'line', 'visualize', 'data'] },
  { id: 'filetools', name: 'File Tools', description: 'JSON formatter, CSV viewer, text tools', category: 'Utilities', icon: 'FileUp', path: '/filetools', keywords: ['file', 'json', 'csv', 'format', 'viewer'] },
];

export const CATEGORIES = [...new Set(TOOLS.map(t => t.category))];

export function searchTools(query: string): ToolDefinition[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.keywords.some(k => k.includes(q)) ||
    tool.category.toLowerCase().includes(q)
  );
}
