w// ============================================================
// 1. HAMBURGER MENU
// ============================================================
function toggleMenu() {
    const nav = document.getElementById('nav-links');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('nav-overlay');
    nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('visible');
}

function closeMenu() {
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
    document.getElementById('nav-overlay').classList.remove('visible');
}

// Close on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
});


// ============================================================
// 2. DYNAMIC SUBJECT LOADER
// ============================================================
const curriculumData = {
    'TC': [
        'Mathématiques', 'Physique-Chimie', 'Sciences de la Vie et de la Terre (SVT)',
        'Informatique', 'Français', 'Anglais', 'Arabe', 'Histoire-Géographie', 'Education Islamique'
    ],
    '1BAC': [
        'Mathématiques', 'Physique-Chimie', 'SVT',
        'Français (Examen Régional)', 'Histoire-Géographie', 'Education Islamique', 'Anglais', 'Arabe'
    ],
    '2BAC': [
        'Mathématiques', 'Physique-Chimie', "SVT / Sciences de l'Ingénieur",
        'Philosophie (Examen National)', 'Anglais (Examen National)', 'Traduction'
    ]
};

function loadSubjects(level) {
    const container = document.getElementById('subjects-container');
    const title = document.getElementById('selected-level-title');
    const list = document.getElementById('subjects-list');

    title.innerText = `Core Subjects for ${level}`;
    list.innerHTML = '';

    curriculumData[level].forEach(subject => {
        const span = document.createElement('span');
        span.className = 'subject-tag';
        span.innerText = subject;
        list.appendChild(span);
    });

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// ============================================================
// 3. FLASHCARD SYSTEM
// ============================================================
let flashcards = JSON.parse(localStorage.getItem('lycee_flashcards') || '[]');
let filteredCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let goodCount = 0;
let badCount = 0;
let activeFilter = 'All';

function saveCards() {
    localStorage.setItem('lycee_flashcards', JSON.stringify(flashcards));
}

function addFlashcard() {
    const subject = document.getElementById('fc-subject').value.trim();
    const question = document.getElementById('fc-question').value.trim();
    const answer = document.getElementById('fc-answer').value.trim();

    if (!question || !answer) {
        showToast('Please fill in both question and answer.', 'error');
        return;
    }

    const card = {
        id: Date.now(),
        subject: subject || 'General',
        question,
        answer
    };

    flashcards.push(card);
    saveCards();

    // Clear inputs
    document.getElementById('fc-subject').value = '';
    document.getElementById('fc-question').value = '';
    document.getElementById('fc-answer').value = '';

    showToast('Card added! 🎉', 'success');
    renderAll();
}

function deleteFlashcard(id) {
    flashcards = flashcards.filter(c => c.id !== id);
    saveCards();
    renderAll();
    showToast('Card deleted.', 'info');
}

function renderAll() {
    renderDeckFilter();
    applyFilter(activeFilter);
    renderCardList();
}

function renderDeckFilter() {
    const decks = ['All', ...new Set(flashcards.map(c => c.subject))];
    const pillsContainer = document.getElementById('deck-pills');
    const filterWrapper = document.getElementById('deck-filter');

    if (flashcards.length === 0) {
        filterWrapper.style.display = 'none';
        return;
    }
    filterWrapper.style.display = 'flex';
    pillsContainer.innerHTML = '';

    decks.forEach(deck => {
        const btn = document.createElement('button');
        btn.className = 'deck-pill' + (deck === activeFilter ? ' active' : '');
        btn.textContent = deck === 'All' ? `All (${flashcards.length})` : `${deck} (${flashcards.filter(c => c.subject === deck).length})`;
        btn.onclick = () => applyFilter(deck);
        pillsContainer.appendChild(btn);
    });
}

function applyFilter(deck) {
    activeFilter = deck;
    filteredCards = deck === 'All' ? [...flashcards] : flashcards.filter(c => c.subject === deck);
    currentCardIndex = 0;
    isFlipped = false;
    goodCount = 0;
    badCount = 0;
    updateScoreDisplay();
    renderDeckFilter(); // re-render pills to update active state

    const studyArea = document.getElementById('study-area');
    const noMsg = document.getElementById('no-cards-msg');

    if (filteredCards.length === 0) {
        studyArea.classList.add('hidden');
        noMsg.style.display = 'flex';
    } else {
        noMsg.style.display = 'none';
        studyArea.classList.remove('hidden');
        showCard(0);
    }
}

function showCard(index) {
    if (filteredCards.length === 0) return;
    const card = filteredCards[index];
    document.getElementById('card-question-display').textContent = card.question;
    document.getElementById('card-answer-display').textContent = card.answer;
    document.getElementById('card-counter').textContent = `Card ${index + 1} of ${filteredCards.length}`;

    // Reset flip state
    const flipEl = document.getElementById('flip-card');
    flipEl.classList.remove('flipped');
    isFlipped = false;
    document.getElementById('review-buttons').style.display = 'none';
}

function flipCard() {
    const flipEl = document.getElementById('flip-card');
    flipEl.classList.toggle('flipped');
    isFlipped = !isFlipped;

    if (isFlipped) {
        document.getElementById('review-buttons').style.display = 'flex';
    } else {
        document.getElementById('review-buttons').style.display = 'none';
    }
}

function nextCard() {
    if (currentCardIndex < filteredCards.length - 1) {
        currentCardIndex++;
        showCard(currentCardIndex);
    } else {
        showToast('🎉 You reached the end of the deck!', 'success');
    }
}

function prevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showCard(currentCardIndex);
    }
}

function shuffleCards() {
    for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentCardIndex = 0;
    showCard(0);
    showToast('Cards shuffled! 🔀', 'info');
}

function rateCard(good) {
    if (good) {
        goodCount++;
        document.getElementById('good-count').textContent = goodCount;
    } else {
        badCount++;
        document.getElementById('bad-count').textContent = badCount;
    }
    nextCard();
}

function updateScoreDisplay() {
    document.getElementById('good-count').textContent = goodCount;
    document.getElementById('bad-count').textContent = badCount;
}

function renderCardList() {
    const list = document.getElementById('card-list');
    const cardsToShow = activeFilter === 'All' ? flashcards : flashcards.filter(c => c.subject === activeFilter);
    list.innerHTML = '';

    if (cardsToShow.length === 0) return;

    const heading = document.createElement('h4');
    heading.className = 'card-list-heading';
    heading.textContent = `All Cards ${activeFilter !== 'All' ? '— ' + activeFilter : ''}`;
    list.appendChild(heading);

    cardsToShow.forEach(card => {
        const item = document.createElement('div');
        item.className = 'card-list-item';
        item.innerHTML = `
            <div class="cli-left">
                <span class="cli-subject">${card.subject}</span>
                <p class="cli-question">${card.question}</p>
                <p class="cli-answer"><i class="fa-solid fa-turn-down-right"></i> ${card.answer}</p>
            </div>
            <button class="delete-btn" onclick="deleteFlashcard(${card.id})" title="Delete card">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}


// ============================================================
// 4. POMODORO TIMER
// ============================================================
let timerInterval;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;

const display = document.getElementById('timer-display');
const statusText = document.getElementById('timer-status');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const ringProgress = document.getElementById('ring-progress');

const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54
ringProgress.style.strokeDasharray = CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = 0;

function updateRing() {
    const progress = timeLeft / totalTime;
    const offset = CIRCUMFERENCE * (1 - progress);
    ringProgress.style.strokeDashoffset = offset;
}

function updateDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    display.innerText = `${minutes}:${seconds}`;
    updateRing();
}

function setMode(minutes, label, btn) {
    pauseTimer();
    timeLeft = minutes * 60;
    totalTime = minutes * 60;
    updateDisplay();
    statusText.innerText = `${label} — Ready?`;
    statusText.style.color = '#94a3b8';
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    statusText.innerText = 'Focusing... Keep going!';
    statusText.style.color = '#34d399';

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            statusText.innerText = "Time's up! Take a break.";
            statusText.style.color = '#f87171';
            showToast("⏰ Time's up! Take a well-earned break.", 'info');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    if (timeLeft > 0) {
        statusText.innerText = 'Timer paused.';
        statusText.style.color = '#94a3b8';
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = totalTime;
    updateDisplay();
    statusText.innerText = 'Ready to Focus?';
    statusText.style.color = '#94a3b8';
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
updateDisplay();


// ============================================================
// 5. TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}


// ============================================================
// 6. INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
});
