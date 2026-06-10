# ai.prof Unified Placement Mock Assessment Portal

A premium, responsive, single-page Mock Assessment Portal designed to prepare candidates for placements and assessments. The visual theme, colors, and layout are modeled directly after the **[ai.prof](https://aiprof.com)** branding and design system.

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
