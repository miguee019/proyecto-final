/* ==========================================
   EDUPLANNER - MAIN APPLICATION LOGIC (Vanilla JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management & LocalStorage Initialization ---
    const STATE_KEY = 'eduplanner_app_state_v1';
    
    let appState = loadState() || {
        activeProfile: 'student', // 'student' | 'professor'
        gpaItems: [
            { id: 1, subject: 'Matemáticas', grade: 4.8, credits: 4 },
            { id: 2, subject: 'Física', grade: 4.5, credits: 3 }
        ],
        tasks: [
            { id: 1, title: 'Examen Parcial de Matemáticas', type: 'exam', date: '2026-11-20T10:00:00', completed: false },
            { id: 2, title: 'Proyecto Final JavaScript', type: 'assignment', date: '2026-11-25T23:59:00', completed: false }
        ]
    };

    function saveState() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(appState));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    function loadState() {
        try {
            const data = localStorage.getItem(STATE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return null;
        }
    }

    // --- DOM Elements ---
    const profileBtns = document.querySelectorAll('.profile-btn');
    const studentView = document.getElementById('student-view');
    const professorView = document.getElementById('professor-view');
    
    // GPA Calculator Elements
    const gpaForm = document.getElementById('gpa-form');
    const gpaTbody = document.getElementById('gpa-tbody');
    const gpaScoreElem = document.getElementById('gpa-score');

    // Quiz Creator Elements
    const quizForm = document.getElementById('quiz-form');
    const quizOutput = document.getElementById('quiz-output');
    const generatedQuizCode = document.getElementById('generated-quiz-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');

    // --- Profile Switching Logic ---
    function switchProfile(profile) {
        appState.activeProfile = profile;
        saveState();

        profileBtns.forEach(btn => {
            if (btn.dataset.profile === profile) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (profile === 'student') {
            studentView.classList.add('active');
            professorView.classList.remove('active');
        } else {
            professorView.classList.add('active');
            studentView.classList.remove('active');
        }
    }

    profileBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const profile = btn.dataset.profile;
            switchProfile(profile);
        });
    });

    // Initialize with saved profile state
    switchProfile(appState.activeProfile);

    // --- GPA Calculator Logic ---
    function renderGPA() {
        gpaTbody.innerHTML = '';
        let totalPoints = 0;
        let totalCredits = 0;

        if (appState.gpaItems.length === 0) {
            gpaTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay calificaciones registradas.</td></tr>`;
            gpaScoreElem.textContent = '0.00';
            return;
        }

        appState.gpaItems.forEach(item => {
            totalPoints += item.grade * item.credits;
            totalCredits += item.credits;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHTML(item.subject)}</td>
                <td>${item.grade.toFixed(1)}</td>
                <td>${item.credits}</td>
                <td><button class="btn-icon-danger delete-gpa" data-id="${item.id}" title="Eliminar">✕</button></td>
            `;
            gpaTbody.appendChild(tr);
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        gpaScoreElem.textContent = gpa.toFixed(2);
    }

    if (gpaForm) {
        gpaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subject = document.getElementById('gpa-subject').value.trim();
            const grade = parseFloat(document.getElementById('gpa-grade').value);
            const credits = parseInt(document.getElementById('gpa-credits').value);

            if (!subject || isNaN(grade) || isNaN(credits)) return;

            const newItem = {
                id: Date.now(),
                subject,
                grade,
                credits
            };

            appState.gpaItems.push(newItem);
            saveState();
            renderGPA();
            gpaForm.reset();
        });
    }

    if (gpaTbody) {
        gpaTbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-gpa')) {
                const id = Number(e.target.dataset.id);
                appState.gpaItems = appState.gpaItems.filter(item => item.id !== id);
                saveState();
                renderGPA();
            }
        });
    }

    // --- Quick Quiz Generator Logic ---
    if (quizForm) {
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('quiz-title').value.trim();
            const question = document.getElementById('quiz-question').value.trim();
            
            if (!title || !question) return;

            const randomCode = 'EDU-' + Math.floor(1000 + Math.random() * 9000);
            generatedQuizCode.textContent = randomCode;
            quizOutput.classList.remove('hidden');
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const code = generatedQuizCode.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyCodeBtn.textContent = '¡Copiado!';
                setTimeout(() => { copyCodeBtn.textContent = 'Copiar'; }, 2000);
            });
        });
    }

    // --- Utility Functions ---
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Initial renders
    renderGPA();
});
