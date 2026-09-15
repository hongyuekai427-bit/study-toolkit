# StudyScope

**Your everyday toolkit for school.**

A comprehensive, privacy-first student productivity platform built with React, TypeScript, and Vite. All data stays on your device.

## ✨ Features

### 📚 Academic Tools
- **Scientific Calculator** - Full-featured with history, DEG/RAD modes, and safe expression parsing
- **Fraction Calculator** - Add, subtract, multiply, divide fractions with step-by-step solutions
- **Percentage Tools** - Calculate percentages, discounts, tax, and more
- **Unit Converter** - Convert between 50+ units across 7 categories (length, mass, area, volume, temperature, time, data)
- **Date & Time Tools** - Calculate date differences, countdowns, school days, and age
- **Grade Calculator** - Simple average, weighted grades, target grade, and GPA calculator
- **Function Grapher** - Plot mathematical functions with interactive controls
- **Science Tools** - Physics and chemistry calculators with formulas
- **Geometry Calculator** - Calculate area, perimeter, volume for various shapes

### 📝 Writing & Research
- **Word Counter** - Count words, characters, sentences, paragraphs, and reading time
- **Text Analyzer** - Analyze readability, word frequency, and writing patterns
- **Citation Generator** - Generate APA, MLA, and Chicago citations
- **Essay Planner** - Structure essays with introduction, body, and conclusion
- **Reference Organizer** - Save and organize research sources

### 📅 Planning & Organization
- **Task Manager** - Organize tasks with priorities, due dates, and tags
- **School Planner** - Create weekly timetables with customizable time slots (Mon-Sun)
- **Project Planner** - Plan projects with milestones and tasks
- **Presentation Planner** - Plan presentations slide by slide

### 🎯 Study Tools
- **Study Timer** - Pomodoro timer with focus modes and statistics
- **Flashcards** - Create and study flashcard decks with spaced repetition
- **Quiz Builder** - Create custom quizzes with multiple choice, true/false, and short answer questions
- **Notes** - Take notes with markdown support and local storage

### 🛠️ Utilities
- **Password Generator** - Generate secure passwords locally
- **Random Tools** - Random numbers, dice, coin flip, team generator
- **Color Tools** - Color picker and WCAG contrast checker
- **QR Code Generator** - Generate QR codes locally
- **Data Table** - Lightweight spreadsheet with CSV import/export
- **Chart Builder** - Create bar, line, and pie charts
- **File Tools** - JSON formatter, CSV parser, Base64 encoder

## 🔒 Privacy First

- ✅ **No tracking or analytics**
- ✅ **No advertising**
- ✅ **No account required**
- ✅ **No data sent to servers**
- ✅ **All data stored locally** in your browser
- ✅ **Works offline** after initial load
- ✅ **Open source** - inspect the code yourself

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studyscope.git
cd studyscope

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### GitHub Pages (Recommended)

The project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "GitHub Actions"

3. **Automatic Deployment**
   - The workflow will automatically build and deploy on every push to `main`
   - You can also manually trigger deployments from the Actions tab

Your site will be available at: `https://yourusername.github.io/studyscope/`

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains the production build
# Upload to any static hosting service
```

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **IndexedDB** - Local data storage
- **Lucide React** - Icon library

## 📁 Project Structure

```
studyscope/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components (one per tool)
│   ├── lib/             # Core utilities (math parser, storage)
│   ├── hooks/           # Custom React hooks
│   ├── data/            # Static data and tool definitions
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions workflow
└── package.json
```

## 🎨 Features in Detail

### Customizable Timetable
- 7-day week (Monday to Sunday)
- Add, remove, and edit time slots
- Persistent storage in localStorage
- Click any class to edit subject and end time
- Mobile-friendly with scrollable day tabs

### Safe Math Parser
- No `eval()` - uses custom recursive descent parser
- Supports implicit multiplication (2x, 2(x+1))
- Domain error checking for sqrt, log, trig functions
- Handles infinity and NaN gracefully

### Local Data Storage
- All data stored in IndexedDB
- Export/import functionality for backups
- No data ever leaves your device
- Automatic saves with debouncing

### Responsive Design
- Mobile-first approach
- Bottom navigation on mobile
- Sidebar navigation on desktop
- Touch-friendly controls
- Accessible keyboard navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with the goal of providing students with a comprehensive, privacy-respecting toolkit for academic success.

## 🐛 Known Limitations

- Data is stored locally - clearing browser data will delete all information
- Use the export feature regularly to backup your data
- Some features require modern browser APIs (IndexedDB, Web Crypto)

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Made with ❤️ for students everywhere**
