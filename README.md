# ai.prof Unified Placement Mock Assessment Portal

A premium, responsive, single-page Mock Assessment Portal designed to prepare candidates for placements and assessments. The visual theme, colors, and layout are modeled directly after the **[ai.prof](https://aiprof.com)** branding and design system.

---

## 🌟 Key Features

- 📑 **Unified Test Structure**: Combines Quantitative Aptitude (Q1-20), Logical Reasoning (Q21-40), and Verbal Ability/English (Q41-60) into a single, comprehensive 60-question mock exam.
- ⏱️ **Unified Timer**: Features a 60-minute countdown timer with color-changing warnings when time runs low.
- 🗂️ **Interactive Section Tabs**: Includes section navigation tabs at the top of the test window to allow quick jumps between sections.
- 🎛️ **Interactive Question Palette**: Side grid containing 60 color-coded status buttons to jump directly to any question:
  - ⚪ **Gray**: Unvisited
  - 🔵 **Blue outline**: Current active question
  - 🟢 **Emerald Green**: Answered
  - 🟡 **Amber Yellow**: Marked for Review
- 💾 **State Persistence**: Uses browser `localStorage` to save all progress, responses, and remaining time automatically. Progress survives page refreshes and browser crashes.
- 📊 **Detailed Diagnostics**: Section-wise performance progress bars, score metrics, accuracy percentages, and time spent are computed instantly upon submission.
- 📖 **Comprehensive Solutions Review**: Allows users to review all questions with correct/incorrect markers and detailed step-by-step explanations.
- 📱 **Fully Responsive Layout**: Built with a mobile-friendly grid and glassmorphism styling.

---

## 📁 File Structure

```text
aiprof_test/
├── data/
│   ├── aptitude.json    # 20 Quantitative Aptitude questions
│   ├── reasoning.json   # 20 Logical Reasoning questions
│   └── english.json     # 20 Verbal Ability (English) questions
├── index.html           # Main markup & inline brand logo SVG
├── style.css            # Custom CSS variables, responsive design, and animations
├── app.js               # Main JavaScript controller & local storage state machine
└── README.md            # Setup instructions and documentation
```

---

## 🚀 How to Run Locally

Because the application fetches question data dynamically from local JSON files, modern browser security policies (CORS) block it from running directly by double-clicking the `index.html` file (using the `file://` protocol). 

You **must** serve it using a local HTTP web server. Here are the 3 easiest ways:

### Option 1: Using VS Code "Live Server" (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **Open with Live Server** (or click the **Go Live** button in the status bar).

### Option 2: Using Python
If you have Python installed:
1. Open your terminal or Command Prompt.
2. Navigate (`cd`) into the project folder.
3. Start the server:
   ```bash
   python -m http.server 8000
   ```
   *(Note: Use `python3` instead of `python` on macOS/Linux).*
4. Open your web browser and go to: **[http://localhost:8000](http://localhost:8000)**

### Option 3: Using Node.js (npx)
If you have Node.js installed:
1. Open terminal and navigate (`cd`) into the project folder.
2. Run:
   ```bash
   npx http-server
   ```
3. Open: **[http://localhost:8080](http://localhost:8080)**

---

## ☁️ Deploying to GitHub Pages (Best for sharing a live link)

You can host this project completely for free on **GitHub Pages** so others can run it directly in their browser without downloading any files:

1. Create a new public repository on GitHub (e.g., `aiprof_test`).
2. Run these commands in your project folder to push the code:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. Go to your repository settings on GitHub: **Settings** > **Pages**.
4. Under **Build and deployment** > **Branch**, select **`main`** and click **Save**.
5. After 1-2 minutes, GitHub will publish your site and provide a live URL (e.g., `https://<your-username>.github.io/<your-repo-name>/`).
