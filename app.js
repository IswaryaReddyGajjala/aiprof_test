// State variables
let state = {
  questions: [], // Combined 60 questions array
  activeQuestionIndex: 0,
  userAnswers: Array(60).fill(null), // Array of size 60
  markedForReview: Array(60).fill(false), // Array of size 60
  testStatus: 'not-started', // 'not-started', 'in-progress', 'completed'
  timeRemaining: 60 * 60, // 60 minutes in seconds
  timeSpent: 0
};

const TEST_DURATION = 60 * 60; // 60 minutes
let timerInterval = null;

// DOM Elements
const sections = {
  dashboard: document.getElementById('section-dashboard'),
  exam: document.getElementById('section-exam'),
  results: document.getElementById('section-results')
};

const navLinks = {
  dashboard: document.getElementById('link-dashboard'),
  results: document.getElementById('link-results')
};

const tabButtons = {
  aptitude: document.getElementById('tab-aptitude'),
  reasoning: document.getElementById('tab-reasoning'),
  english: document.getElementById('tab-english')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromLocalStorage();
  setupEventListeners();
  updateDashboardUI();
});

// Helper: Determine section based on question index (0-59)
function getSectionOfIndex(idx) {
  if (idx >= 0 && idx < 20) return 'aptitude';
  if (idx >= 20 && idx < 40) return 'reasoning';
  if (idx >= 40 && idx < 60) return 'english';
  return 'aptitude';
}

// Setup Event Handlers
function setupEventListeners() {
  // Navigation Links
  navLinks.dashboard.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.testStatus === 'in-progress') {
      if (confirm('A test is in progress. Leaving this page will NOT pause the timer. Do you want to go to the Dashboard?')) {
        showSection('dashboard');
      }
    } else {
      showSection('dashboard');
    }
  });

  navLinks.results.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.testStatus === 'in-progress') {
      if (confirm('A test is in progress. Leaving this page will NOT pause the timer. Do you want to view Analytics?')) {
        showSection('results');
        renderResults();
      }
    } else {
      showSection('results');
      renderResults();
    }
  });

  document.getElementById('nav-logo').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dashboard');
  });

  document.getElementById('footer-logo').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dashboard');
  });

  // Start Assessment button
  document.getElementById('btn-start-assessment').addEventListener('click', startAssessment);

  // Section Tabs Navigation
  tabButtons.aptitude.addEventListener('click', () => jumpToSection(0));
  tabButtons.reasoning.addEventListener('click', () => jumpToSection(20));
  tabButtons.english.addEventListener('click', () => jumpToSection(40));

  // Exam controls
  document.getElementById('btn-exit-exam').addEventListener('click', () => {
    showSection('dashboard');
  });
  document.getElementById('btn-prev-question').addEventListener('click', prevQuestion);
  document.getElementById('btn-next-question').addEventListener('click', nextQuestion);
  document.getElementById('btn-clear-response').addEventListener('click', clearResponse);
  document.getElementById('btn-mark-review').addEventListener('click', toggleMarkForReview);
  document.getElementById('btn-submit-exam').addEventListener('click', openSubmitModal);

  // Modal actions
  document.getElementById('btn-modal-cancel').addEventListener('click', closeSubmitModal);
  document.getElementById('btn-modal-confirm').addEventListener('click', submitAssessment);

  // Reset Progress button
  document.getElementById('btn-header-action').addEventListener('click', resetAllProgress);

  // Results back buttons
  document.getElementById('btn-back-dashboard').addEventListener('click', () => showSection('dashboard'));
  document.getElementById('btn-exit-results').addEventListener('click', () => showSection('dashboard'));

  // Filters for review questions
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterReviewQuestions(e.target.dataset.filter);
    });
  });
}

// Show a particular section and update nav highlight
function showSection(sectionId) {
  Object.keys(sections).forEach(key => {
    if (key === sectionId) {
      sections[key].classList.add('active-section');
    } else {
      sections[key].classList.remove('active-section');
    }
  });

  // Update Nav Link styling
  Object.keys(navLinks).forEach(key => {
    if (key === sectionId) {
      navLinks[key].classList.add('active');
    } else {
      navLinks[key].classList.remove('active');
    }
  });

  // Hide reset progress button during exam
  const resetBtn = document.getElementById('btn-header-action');
  if (state.testStatus === 'in-progress') {
    resetBtn.style.display = 'none';
  } else {
    resetBtn.style.display = 'inline-flex';
  }

  // Hide header completely on non-dashboard screens (exam and results)
  const header = document.querySelector('header');
  if (header) {
    if (sectionId === 'dashboard') {
      header.style.display = 'block';
    } else {
      header.style.display = 'none';
    }
  }
}

// Start Assessment logic
async function startAssessment() {
  if (state.testStatus === 'completed') {
    showSection('results');
    renderResults();
    return;
  }

  // Load questions if not loaded yet
  if (state.questions.length === 0) {
    try {
      // Concurrently fetch all three sections
      const [aptRes, reaRes, engRes] = await Promise.all([
        fetch('data/aptitude.json'),
        fetch('data/reasoning.json'),
        fetch('data/english.json')
      ]);

      if (!aptRes.ok || !reaRes.ok || !engRes.ok) {
        throw new Error("Could not load data JSON files.");
      }

      const apt = await aptRes.json();
      const rea = await reaRes.json();
      const eng = await engRes.json();

      // Combine into a single questions array
      state.questions = [...apt, ...rea, ...eng];
    } catch (error) {
      console.error(error);
      alert('Error loading assessment questions. Please run on a local HTTP server.');
      return;
    }
  }

  // Set exam state
  if (state.testStatus === 'not-started') {
    state.testStatus = 'in-progress';
    state.timeRemaining = TEST_DURATION;
    state.activeQuestionIndex = 0;
  }

  saveStateToLocalStorage();
  showSection('exam');
  
  // Start the timer
  startTimer();
  
  // Render exam
  renderExamUI();
}

// Section tab jump logic
function jumpToSection(firstIndex) {
  if (state.testStatus !== 'in-progress') return;
  state.activeQuestionIndex = firstIndex;
  saveStateToLocalStorage();
  renderExamUI();
}

// Timer Controller
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  updateTimerUI();

  timerInterval = setInterval(() => {
    if (state.testStatus !== 'in-progress') {
      clearInterval(timerInterval);
      return;
    }

    state.timeRemaining--;
    state.timeSpent = TEST_DURATION - state.timeRemaining;
    saveStateToLocalStorage();
    updateTimerUI();

    if (state.timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert('Time limit reached! Your assessment is being submitted.');
      submitAssessment(true); // Forced submission
    }
  }, 1000);
}

function updateTimerUI() {
  const time = state.timeRemaining;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  const timerDisplay = document.getElementById('exam-timer');
  const timerBar = document.getElementById('exam-timer-bar');
  
  timerDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> ${formattedMinutes}:${formattedSeconds}`;
  
  const percentage = (time / TEST_DURATION) * 100;
  timerBar.style.width = `${percentage}%`;

  if (time <= 300) { // Warning: Less than 5 minutes for the combined test
    timerDisplay.classList.add('warning');
    timerBar.classList.add('warning');
  } else {
    timerDisplay.classList.remove('warning');
    timerBar.classList.remove('warning');
  }
}

// Render Question Area
function renderExamUI() {
  const qIndex = state.activeQuestionIndex;
  const question = state.questions[qIndex];
  const sec = getSectionOfIndex(qIndex);
  
  // Section text names
  const sectionNames = {
    aptitude: 'Quantitative Aptitude',
    reasoning: 'Logical Reasoning',
    english: 'Verbal Ability'
  };

  // Section badge styles
  document.getElementById('exam-section-badge').textContent = sectionNames[sec];
  document.getElementById('exam-section-badge').className = `section-badge ${sec}-badge`;
  document.getElementById('exam-question-number').textContent = `Question ${qIndex + 1} of 60`;
  
  // Highlighting correct section navigation tab button
  Object.keys(tabButtons).forEach(key => {
    if (key === sec) {
      tabButtons[key].classList.add('active-tab-btn');
    } else {
      tabButtons[key].classList.remove('active-tab-btn');
    }
  });

  // Question Text
  document.getElementById('question-text-display').textContent = `${qIndex + 1}. ${question.question}`;
  
  // Options
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  
  const optionPrefixes = ['A', 'B', 'C', 'D'];
  question.options.forEach((optionText, index) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    if (state.userAnswers[qIndex] === index) {
      card.classList.add('selected');
    }
    
    card.innerHTML = `
      <div class="option-prefix">${optionPrefixes[index]}</div>
      <div class="option-text">${optionText}</div>
    `;
    
    card.addEventListener('click', () => selectOption(index));
    container.appendChild(card);
  });

  // Mark for review toggle UI
  const markBtn = document.getElementById('btn-mark-review');
  if (state.markedForReview[qIndex]) {
    markBtn.innerHTML = `<i class="fa-solid fa-bookmark" style="color: var(--status-marked);"></i> Marked`;
    markBtn.style.background = '#FEF3C7';
    markBtn.style.borderColor = 'var(--status-marked)';
  } else {
    markBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Mark for Review`;
    markBtn.style.background = 'white';
    markBtn.style.borderColor = 'var(--border)';
  }

  // Prev & Next navigation button states
  document.getElementById('btn-prev-question').disabled = qIndex === 0;
  
  const nextBtn = document.getElementById('btn-next-question');
  if (qIndex === 59) {
    nextBtn.innerHTML = `Finish Test <i class="fa-solid fa-flag-checkered"></i>`;
    nextBtn.className = 'btn-accent';
  } else {
    nextBtn.innerHTML = `Next <i class="fa-solid fa-arrow-right"></i>`;
    nextBtn.className = 'btn-primary';
    
    // Dynamically match colors of Next button with active section theme
    if (sec === 'english') {
      nextBtn.style.background = '#A855F7';
    } else if (sec === 'reasoning') {
      nextBtn.style.background = 'var(--accent)';
    } else {
      nextBtn.style.background = 'var(--primary)';
    }
  }

  renderQuestionPalette();
}

// Palette numbers renderer
function renderQuestionPalette() {
  const gridContainer = document.getElementById('question-palette-grid');
  gridContainer.innerHTML = '';
  let answeredCount = 0;

  for (let i = 0; i < 60; i++) {
    const btn = document.createElement('div');
    btn.className = 'grid-item';
    
    // Add section classification border styling
    const sec = getSectionOfIndex(i);
    btn.classList.add(`${sec}-item`);
    btn.textContent = i + 1;

    // Determine states
    const isAnswered = state.userAnswers[i] !== null;
    const isMarked = state.markedForReview[i];
    const isActive = state.activeQuestionIndex === i;

    if (isAnswered) answeredCount++;
    if (isActive) btn.classList.add('active');
    
    if (isAnswered && isMarked) {
      btn.classList.add('marked-answered');
    } else if (isAnswered) {
      btn.classList.add('answered');
    } else if (isMarked) {
      btn.classList.add('marked');
    }

    btn.addEventListener('click', () => {
      state.activeQuestionIndex = i;
      saveStateToLocalStorage();
      renderExamUI();
    });

    gridContainer.appendChild(btn);
  }

  document.getElementById('palette-summary-text').textContent = `${answeredCount}/60 Answered`;
}

// Action operations
function selectOption(index) {
  state.userAnswers[state.activeQuestionIndex] = index;
  saveStateToLocalStorage();
  renderExamUI();
}

function clearResponse() {
  state.userAnswers[state.activeQuestionIndex] = null;
  saveStateToLocalStorage();
  renderExamUI();
}

function toggleMarkForReview() {
  const qIndex = state.activeQuestionIndex;
  state.markedForReview[qIndex] = !state.markedForReview[qIndex];
  saveStateToLocalStorage();
  renderExamUI();
}

function prevQuestion() {
  if (state.activeQuestionIndex > 0) {
    state.activeQuestionIndex--;
    saveStateToLocalStorage();
    renderExamUI();
  }
}

function nextQuestion() {
  if (state.activeQuestionIndex < 59) {
    state.activeQuestionIndex++;
    saveStateToLocalStorage();
    renderExamUI();
  } else {
    openSubmitModal();
  }
}

// Submit Modal controller
function openSubmitModal() {
  let answeredCount = 0;
  let markedCount = 0;

  for (let i = 0; i < 60; i++) {
    if (state.userAnswers[i] !== null) answeredCount++;
    if (state.markedForReview[i]) markedCount++;
  }

  document.getElementById('modal-stat-answered').textContent = answeredCount;
  document.getElementById('modal-stat-marked').textContent = markedCount;
  document.getElementById('submit-modal').style.display = 'flex';
}

function closeSubmitModal() {
  document.getElementById('submit-modal').style.display = 'none';
}

// Submission finalizer
function submitAssessment(forced = false) {
  closeSubmitModal();
  
  if (timerInterval) clearInterval(timerInterval);
  
  state.testStatus = 'completed';
  saveStateToLocalStorage();
  
  updateDashboardUI();
  showSection('results');
  renderResults();
  
  if (!forced) {
    alert('Assessment submitted successfully! Check your detailed diagnostic results.');
  }
}

// Render Diagnostics
function renderResults() {
  const isCompleted = state.testStatus === 'completed';
  
  let overallScore = 0;
  let overallCorrect = 0;
  let overallIncorrect = 0;
  let overallUnanswered = 0;

  // Track section scores
  let scores = {
    aptitude: { correct: 0, incorrect: 0, unanswered: 0 },
    reasoning: { correct: 0, incorrect: 0, unanswered: 0 },
    english: { correct: 0, incorrect: 0, unanswered: 0 }
  };

  if (isCompleted && state.questions.length > 0) {
    state.questions.forEach((q, idx) => {
      const sec = getSectionOfIndex(idx);
      const userAns = state.userAnswers[idx];

      if (userAns === null) {
        scores[sec].unanswered++;
        overallUnanswered++;
      } else if (userAns === q.answer) {
        scores[sec].correct++;
        overallCorrect++;
        overallScore++;
      } else {
        scores[sec].incorrect++;
        overallIncorrect++;
      }
    });
  } else {
    overallUnanswered = 60;
    scores.aptitude.unanswered = 20;
    scores.reasoning.unanswered = 20;
    scores.english.unanswered = 20;
  }

  // Update Section UIs
  const sectionsList = ['aptitude', 'reasoning', 'english'];
  sectionsList.forEach(sec => {
    const s = scores[sec];
    const progressFill = document.getElementById(`results-progress-${sec}`);
    const scoreText = document.getElementById(`results-score-${sec}`);
    const accuracyText = document.getElementById(`results-accuracy-${sec}`);

    const pct = Math.round((s.correct / 20) * 100);
    const accuracy = s.correct + s.incorrect > 0 ? Math.round((s.correct / (s.correct + s.incorrect)) * 100) : 0;

    progressFill.style.width = isCompleted ? `${pct}%` : '0%';
    scoreText.textContent = isCompleted ? `${s.correct} / 20` : '0 / 20';
    accuracyText.textContent = isCompleted ? `Accuracy: ${accuracy}%` : 'Accuracy: 0%';
  });

  // Calculate overall percentages
  const overallPct = isCompleted ? Math.round((overallScore / 60) * 100) : 0;
  const accuracyPct = overallCorrect + overallIncorrect > 0 
    ? Math.round((overallCorrect / (overallCorrect + overallIncorrect)) * 100) 
    : 0;

  document.getElementById('results-overall-score').textContent = `${overallScore} / 60`;
  document.getElementById('results-overall-percentage').textContent = `${overallPct}%`;
  document.getElementById('results-overall-accuracy').textContent = `${accuracyPct}%`;

  // Set stats boxes
  document.getElementById('stat-total-correct').textContent = overallCorrect;
  document.getElementById('stat-total-incorrect').textContent = overallIncorrect;
  document.getElementById('stat-total-unanswered').textContent = overallUnanswered;

  // Format Time Spent
  const timeMin = Math.floor(state.timeSpent / 60);
  const timeSec = state.timeSpent % 60;
  document.getElementById('stat-time-taken').textContent = 
    `${String(timeMin).padStart(2, '0')}:${String(timeSec).padStart(2, '0')}`;

  // Summary descriptions
  let headline = "Assessment Analysis";
  let feedback = "Complete the comprehensive mock assessment to generate report insights.";
  
  if (isCompleted) {
    if (overallPct >= 80) {
      headline = "Placement-Ready Performance! 🎓🚀";
      feedback = "Outstanding results! You possess advanced mastery across Quantitative math, Logical deductions, and English grammar. Ready for placement drives!";
    } else if (overallPct >= 50) {
      headline = "Good Effort, Keep Practicing! 💡";
      feedback = "You have standard competence. Clear up minor conceptual gaps by reviewing the question solutions and explanations below to score above 80%.";
    } else {
      headline = "Focused Practice Required! 📚";
      feedback = "A stronger foundation is needed. Go through the explanations, study formulas, and reset progress to attempt the assessment again.";
    }
  }

  document.getElementById('results-headline').textContent = headline;
  document.getElementById('results-feedback').textContent = feedback;

  // Solutions lists
  const reviewArea = document.getElementById('results-review-area');
  if (isCompleted && state.questions.length > 0) {
    reviewArea.style.display = 'block';
    renderReviewQuestions('all');
  } else {
    reviewArea.style.display = 'none';
  }
}

// Render solution scroll list
function renderReviewQuestions(filter = 'all') {
  const container = document.getElementById('review-questions-list');
  container.innerHTML = '';
  
  const sectionLabels = {
    aptitude: 'Aptitude',
    reasoning: 'Reasoning',
    english: 'English'
  };

  let renderedCount = 0;

  state.questions.forEach((q, idx) => {
    const sec = getSectionOfIndex(idx);
    const userAns = state.userAnswers[idx];
    const isCorrect = userAns === q.answer;

    // Filter evaluations
    if (filter === 'correct' && (!isCorrect || userAns === null)) return;
    if (filter === 'incorrect' && (isCorrect || userAns === null)) return;
    if (filter === 'unanswered' && userAns !== null) return;

    renderedCount++;

    const item = document.createElement('div');
    let itemClass = 'review-item glass ';
    let statusText = '';
    
    if (userAns === null) {
      itemClass += 'unanswered';
      statusText = 'Unanswered';
    } else if (isCorrect) {
      itemClass += 'correct';
      statusText = 'Correct';
    } else {
      itemClass += 'incorrect';
      statusText = 'Incorrect';
    }

    item.className = itemClass;

    let optionsHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, oIdx) => {
      let optClass = 'review-option';
      if (oIdx === q.answer) {
        optClass += ' correct-option';
      } else if (oIdx === userAns) {
        optClass += ' incorrect-option';
      }

      optionsHTML += `
        <div class="${optClass}">
          <span class="option-prefix">${letters[oIdx]}</span>
          <span>${opt}</span>
        </div>
      `;
    });

    item.innerHTML = `
      <div class="review-meta">
        <span>${sectionLabels[sec]} - Q${idx + 1}</span>
        <span class="review-status-badge">${statusText}</span>
      </div>
      <h4 class="review-question-text">${q.question}</h4>
      <div class="review-options">
        ${optionsHTML}
      </div>
      <div class="explanation-box">
        <div class="explanation-title">
          <i class="fa-solid fa-circle-info"></i> Explanation
        </div>
        <p>${q.explanation.replace(/\n/g, '<br>')}</p>
      </div>
    `;

    container.appendChild(item);
  });

  if (renderedCount === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-light); padding: 40px;">
        <i class="fa-regular fa-folder-open" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>No questions matched the filter criteria.</p>
      </div>
    `;
  }
}

// Filter button controller
function filterReviewQuestions(filter) {
  renderReviewQuestions(filter);
}

// Dashboard rendering controller
function updateDashboardUI() {
  const status = state.testStatus;
  const badge = document.getElementById('assessment-status-badge');
  const startBtn = document.getElementById('btn-start-assessment');
  const progressContainer = document.getElementById('assessment-progress-container');
  const progressFill = document.getElementById('assessment-progress-fill');
  const progressText = document.getElementById('assessment-progress-text');

  badge.className = 'subject-status';

  if (status === 'completed') {
    badge.textContent = 'Assessment Completed';
    badge.classList.add('status-completed');
    startBtn.innerHTML = `View Analysis <i class="fa-solid fa-chart-pie"></i>`;
    startBtn.className = 'btn-secondary';
    
    progressContainer.style.display = 'block';
    
    // Count score for progress bar percentage
    let correct = 0;
    if (state.questions.length > 0) {
      state.questions.forEach((q, idx) => {
        if (state.userAnswers[idx] === q.answer) correct++;
      });
      const pct = Math.round((correct / 60) * 100);
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `Overall Score: ${correct} / 60 (${pct}%)`;
    } else {
      progressFill.style.width = '0%';
      progressText.textContent = '';
    }

  } else if (status === 'in-progress') {
    badge.textContent = 'In Progress';
    badge.classList.add('status-in-progress');
    startBtn.innerHTML = `Resume Assessment <i class="fa-solid fa-play"></i>`;
    startBtn.className = 'btn-accent';
    
    progressContainer.style.display = 'block';
    
    // Track answered progress bar
    let answered = 0;
    state.userAnswers.forEach(ans => {
      if (ans !== null) answered++;
    });
    const pct = Math.round((answered / 60) * 100);
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${answered} / 60 Questions Answered (${pct}%)`;

  } else {
    badge.textContent = 'Ready to Attempt';
    badge.classList.add('status-not-started');
    startBtn.innerHTML = `Start Assessment <i class="fa-solid fa-arrow-right"></i>`;
    startBtn.className = 'btn-primary';
    progressContainer.style.display = 'none';
    progressText.textContent = '';
  }

  // Pre-load all JSONs in background if in progress or completed
  if (status !== 'not-started' && state.questions.length === 0) {
    loadQuestionsSilently();
  }
}

// Background questions preloader
async function loadQuestionsSilently() {
  try {
    const [aptRes, reaRes, engRes] = await Promise.all([
      fetch('data/aptitude.json'),
      fetch('data/reasoning.json'),
      fetch('data/english.json')
    ]);

    if (aptRes.ok && reaRes.ok && engRes.ok) {
      const apt = await aptRes.json();
      const rea = await reaRes.json();
      const eng = await engRes.json();
      state.questions = [...apt, ...rea, ...eng];
      
      // Re-trigger dashboard progress labels since questions are loaded now
      if (state.testStatus === 'completed') {
        let correct = 0;
        state.questions.forEach((q, idx) => {
          if (state.userAnswers[idx] === q.answer) correct++;
        });
        const pct = Math.round((correct / 60) * 100);
        document.getElementById('assessment-progress-fill').style.width = `${pct}%`;
        document.getElementById('assessment-progress-text').textContent = `Overall Score: ${correct} / 60 (${pct}%)`;
      }
    }
  } catch (err) {
    console.error("Background loading failed:", err);
  }
}

// Reset System progress
function resetAllProgress() {
  if (confirm('Are you sure you want to reset your assessment progress? This will delete all saved answers and scores.')) {
    if (timerInterval) clearInterval(timerInterval);
    
    state = {
      questions: [],
      activeQuestionIndex: 0,
      userAnswers: Array(60).fill(null),
      markedForReview: Array(60).fill(false),
      testStatus: 'not-started',
      timeRemaining: 60 * 60,
      timeSpent: 0
    };
    
    localStorage.removeItem('aiprof_unified_state');
    updateDashboardUI();
    showSection('dashboard');
    alert('Progress reset successfully!');
  }
}

// Local Storage operations
function saveStateToLocalStorage() {
  try {
    const saved = {
      activeQuestionIndex: state.activeQuestionIndex,
      userAnswers: state.userAnswers,
      markedForReview: state.markedForReview,
      testStatus: state.testStatus,
      timeRemaining: state.timeRemaining,
      timeSpent: state.timeSpent
    };
    localStorage.setItem('aiprof_unified_state', JSON.stringify(saved));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem('aiprof_unified_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.activeQuestionIndex = parsed.activeQuestionIndex;
      state.userAnswers = parsed.userAnswers;
      state.markedForReview = parsed.markedForReview;
      state.testStatus = parsed.testStatus;
      state.timeRemaining = parsed.timeRemaining;
      state.timeSpent = parsed.timeSpent || 0;

      // Resume test if one is active
      if (state.testStatus === 'in-progress') {
        startAssessment();
      }
    }
  } catch (error) {
    console.error("Failed to load state:", error);
  }
}
