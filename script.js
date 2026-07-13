// ============================================
// GROUP G-343 - STUDENT PORTAL
// Core JavaScript Logic (with Quiz Challenge)
// ============================================

const DB = {
    users: JSON.parse(localStorage.getItem('g343_users')) || [],
    messages: JSON.parse(localStorage.getItem('g343_messages')) || [],
    tutorFiles: JSON.parse(localStorage.getItem('g343_tutorFiles')) || [
        { name: 'Course Syllabus.pdf', type: 'pdf', size: '2.4 MB', date: '2026-07-10', uploader: 'Alaa Ayman' },
        { name: 'Lecture 1 Notes.docx', type: 'doc', size: '1.1 MB', date: '2026-07-11', uploader: 'Alaa Ayman' },
        { name: 'Group Photo.jpg', type: 'img', size: '3.2 MB', date: '2026-07-12', uploader: 'Alaa Ayman' }
    ],
    studentWorks: JSON.parse(localStorage.getItem('g343_studentWorks')) || [],
    ratings: JSON.parse(localStorage.getItem('g343_ratings')) || {},
    comments: JSON.parse(localStorage.getItem('g343_comments')) || {},
    quizzes: JSON.parse(localStorage.getItem('g343_quizzes')) || [],
    quizResults: JSON.parse(localStorage.getItem('g343_quizResults')) || [],

    currentUser: JSON.parse(localStorage.getItem('g343_currentUser')) || null
};

const TUTOR_NAME = 'Alaa Ayman';
const ADMIN_NAME = 'Emad Mohamed';

function saveDB() {
    localStorage.setItem('g343_users', JSON.stringify(DB.users));
    localStorage.setItem('g343_messages', JSON.stringify(DB.messages));
    localStorage.setItem('g343_tutorFiles', JSON.stringify(DB.tutorFiles));
    localStorage.setItem('g343_studentWorks', JSON.stringify(DB.studentWorks));
    localStorage.setItem('g343_ratings', JSON.stringify(DB.ratings));
    localStorage.setItem('g343_comments', JSON.stringify(DB.comments));
    localStorage.setItem('g343_quizzes', JSON.stringify(DB.quizzes));
    localStorage.setItem('g343_quizResults', JSON.stringify(DB.quizResults));
    if (DB.currentUser) {
        localStorage.setItem('g343_currentUser', JSON.stringify(DB.currentUser));
    } else {
        localStorage.removeItem('g343_currentUser');
    }
}

// ================== PASSWORD VALIDATION ==================
function validatePassword(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)
    };
}

function updatePasswordUI(password) {
    const checks = validatePassword(password);
    const ids = ['req-length', 'req-upper', 'req-lower', 'req-number', 'req-special'];
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('valid', Object.values(checks)[i]);
    });
    return checks.length && checks.upper && checks.lower && checks.number && checks.special;
}

// ================== USER ROLES ==================
function isTutor(name) { return name === TUTOR_NAME; }
function isAdmin(name) { return name === ADMIN_NAME; }
function getRole(name) {
    if (name === ADMIN_NAME) return 'Admin';
    if (name === TUTOR_NAME) return 'Tutor';
    return 'Student';
}

function getRoleClass(name) {
    const role = getRole(name);
    if (role === 'Admin') return 'role-admin';
    if (role === 'Tutor') return 'role-tutor';
    return 'role-student';
}

// ================== POINTS SYSTEM ==================
function getUserPoints(name) {
    let points = 0;
    DB.studentWorks.forEach(work => {
        if (work.student === name) {
            const rating = DB.ratings[work.id];
            if (rating) points += rating.points || 0;
        }
    });
    DB.quizResults.forEach(result => {
        if (result.user === name) {
            points += result.earnedPoints || 0;
        }
    });
    return points;
}

function getLeaderboard() {
    return DB.users
        .filter(u => u.name !== TUTOR_NAME)
        .map(u => ({
            name: u.name,
            points: getUserPoints(u.name),
            role: u.role
        }))
        .sort((a, b) => b.points - a.points);
}

// ================== MEMBERS ==================
function renderMemberItem(user) {
    const date = new Date(user.joinedAt);
    const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const roleClass = getRoleClass(user.name);
    const roleText = getRole(user.name);
    const isTutorUser = user.name === TUTOR_NAME;
    const isAdminUser = user.name === ADMIN_NAME;

    return `
        <div class="member-item" style="${isTutorUser || isAdminUser ? 'border-left: 3px solid ' + (isTutorUser ? 'var(--tutor)' : '#9b59b6') + ';' : ''}">
            <div class="member-info">
                <div class="member-avatar" style="${isTutorUser ? 'background: linear-gradient(135deg, var(--tutor), #d68910);' : isAdminUser ? 'background: linear-gradient(135deg, #9b59b6, #8e44ad);' : ''}">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="member-name">${user.name}</div>
                    <div class="member-time">Joined ${timeStr}</div>
                </div>
            </div>
            <span class="member-role ${roleClass}">${roleText}</span>
        </div>
    `;
}

function renderRecentMembers() {
    const container = document.getElementById('recentMembers');
    if (!container) return;
    const sorted = [...DB.users].sort((a, b) => {
        if (a.name === TUTOR_NAME) return -1;
        if (b.name === TUTOR_NAME) return 1;
        if (a.name === ADMIN_NAME) return -1;
        if (b.name === ADMIN_NAME) return 1;
        return new Date(b.joinedAt) - new Date(a.joinedAt);
    }).slice(0, 5);
    container.innerHTML = sorted.map(u => renderMemberItem(u)).join('');
}

function renderMembers() {
    const container = document.getElementById('allMembers');
    if (!container) return;
    const sorted = [...DB.users].sort((a, b) => {
        if (a.name === TUTOR_NAME) return -1;
        if (b.name === TUTOR_NAME) return 1;
        if (a.name === ADMIN_NAME) return -1;
        if (b.name === ADMIN_NAME) return 1;
        return new Date(a.joinedAt) - new Date(b.joinedAt);
    });
    const countEl = document.getElementById('membersCount');
    if (countEl) countEl.textContent = sorted.length + ' member' + (sorted.length !== 1 ? 's' : '');
    container.innerHTML = sorted.map(u => renderMemberItem(u)).join('');
}

// ================== LEADERBOARD ==================
function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    const board = getLeaderboard().slice(0, 5);
    if (board.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No submissions yet. Be the first!</div>';
        return;
    }
    container.innerHTML = board.map((entry, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#';
        return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${medal}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.name}</div>
                    <div class="leaderboard-points">${entry.points} points</div>
                </div>
            </div>
        `;
    }).join('');
}

// ================== CHAT ==================
function renderChat() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const user = DB.currentUser;
    if (!user) return;

    if (DB.messages.length === 0) {
        container.innerHTML = '<div class="chat-empty">No messages yet. Start the conversation!</div>';
        return;
    }
    container.innerHTML = DB.messages.map(msg => {
        const isOwn = msg.sender === user.name;
        const time = new Date(msg.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isTutorMsg = msg.sender === TUTOR_NAME;
        const isAdminMsg = msg.sender === ADMIN_NAME;
        const nameStyle = isTutorMsg ? 'color: var(--tutor);' : isAdminMsg ? 'color: #9b59b6;' : '';
        return `
            <div class="chat-message ${isOwn ? 'own' : ''}">
                <div class="chat-message-header">
                    <span class="chat-message-name" style="${nameStyle}">${msg.sender}</span>
                    <span class="chat-message-time">${time}</span>
                </div>
                <div class="chat-message-body">${escapeHtml(msg.text)}</div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !DB.currentUser) return;
    const msg = { sender: DB.currentUser.name, text: text, time: new Date().toISOString() };
    DB.messages.push(msg);
    saveDB();
    input.value = '';
    renderChat();
}

// ================== TUTOR FILES ==================
function getFileIcon(type) {
    const icons = { pdf: '📄', doc: '📝', img: '🖼️', video: '🎬', zip: '📦', other: '📎' };
    return icons[type] || icons.other;
}

function renderTutorFiles() {
    const container = document.getElementById('tutorFilesGrid');
    if (!container) return;
    const currentUser = DB.currentUser;
    container.innerHTML = DB.tutorFiles.map((file, index) => {
        const canDelete = currentUser && (file.uploader === currentUser.name || currentUser.name === ADMIN_NAME);
        const deleteBtn = canDelete ? `<button class="file-delete-btn" onclick="deleteTutorFile(${index}, event)" title="Delete">✕</button>` : '';
        return `
            <div class="file-card">
                ${deleteBtn}
                <div class="file-icon ${file.type}">${getFileIcon(file.type)}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    <span>${file.size}</span>
                    <span>•</span>
                    <span>${file.uploader}</span>
                </div>
            </div>
        `;
    }).join('');
}

function deleteTutorFile(index, event) {
    event.stopPropagation();
    if (!confirm('Delete this file?')) return;
    DB.tutorFiles.splice(index, 1);
    saveDB();
    renderTutorFiles();
    renderRecentTutorFiles();
    showToast('File deleted.', 'info');
}

function handleTutorFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const typeMap = {
        'application/pdf': 'pdf', 'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
        'image/': 'img', 'video/': 'video', 'application/zip': 'zip', 'application/x-zip-compressed': 'zip'
    };
    let type = 'other';
    for (const [key, val] of Object.entries(typeMap)) {
        if (file.type.startsWith(key) || file.type === key) { type = val; break; }
    }
    const size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const newFile = { name: file.name, type: type, size: size, date: new Date().toISOString().split('T')[0], uploader: DB.currentUser.name };
    DB.tutorFiles.unshift(newFile);
    saveDB();
    renderTutorFiles();
    renderRecentTutorFiles();
    showToast('File uploaded to Tutor Files!', 'success');
}

function renderRecentTutorFiles() {
    const container = document.getElementById('recentTutorFiles');
    if (!container) return;
    if (DB.tutorFiles.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No tutor files yet.</div>';
        return;
    }
    container.innerHTML = DB.tutorFiles.slice(0, 4).map(file => `
        <div class="file-card" onclick="downloadFile('${file.name}')">
            <div class="file-icon ${file.type}">${getFileIcon(file.type)}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-meta">
                <span>${file.size}</span>
                <span>•</span>
                <span>${file.uploader}</span>
            </div>
        </div>
    `).join('');
}

// ================== REAL DOWNLOAD FUNCTION ==================
function downloadFile(name) {
    let fileData = null;
    let fileType = '';
    let found = false;

    const studentWork = DB.studentWorks.find(w => w.fileName === name);
    if (studentWork) {
        fileData = studentWork.data;
        fileType = studentWork.type;
        found = true;
    }

    if (fileData && fileData.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloading ' + name + '...', 'success');
        return;
    }

    const mimeTypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        img: 'image/jpeg',
        video: 'video/mp4',
        zip: 'application/zip',
        other: 'text/plain'
    };

    const mime = mimeTypes[fileType] || 'text/plain';

    let content;
    if (fileType === 'img') {
        const canvas = document.createElement('canvas');
        canvas.width = 400; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#e94560';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Demo Image: ' + name, 200, 150);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = name.replace(/\.[^.]+$/, '') + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloaded: ' + name, 'success');
        return;
    } else {
        content = 'This is the file: ' + name + '\n\nUploaded via Group G-343 Portal\nDate: ' + new Date().toLocaleString();
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Downloaded: ' + name, 'success');
}

// ================== STUDENT WORKS ==================
function renderStudentWorks() {
    const container = document.getElementById('studentWorksGrid');
    if (!container) return;
    const user = DB.currentUser;
    if (!user) return;

    const works = DB.studentWorks.filter(w => w.student === user.name);
    if (works.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">You haven\'t submitted any work yet. Upload your first project!</div>';
        return;
    }
    container.innerHTML = works.map(work => renderWorkCard(work, true)).join('');
}

function renderAllStudentWorks() {
    const container = document.getElementById('allStudentWorksGrid');
    if (!container) return;
    if (DB.studentWorks.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">No student submissions yet.</div>';
        return;
    }
    container.innerHTML = DB.studentWorks.map(work => renderWorkCard(work, false)).join('');
}

function renderWorkCard(work, isOwn) {
    const rating = DB.ratings[work.id];
    const stars = rating ? rating.stars : 0;
    const points = rating ? rating.points : 0;

    const currentUser = DB.currentUser;
    const isTutor = currentUser && currentUser.name === TUTOR_NAME;
    const starHtml = [1, 2, 3, 4, 5].map(s => {
        const filled = s <= stars ? 'filled' : '';
        const clickable = isTutor ? `onclick="rateWork('${work.id}', ${s}, event)"` : '';
        const cursor = isTutor ? 'cursor:pointer;' : 'cursor:default;';
        return `<span class="star ${filled}" ${clickable} style="${cursor}">★</span>`;
    }).join('');

    const isImage = work.type === 'img';
    const preview = isImage
        ? `<div class="work-preview"><img src="${work.data}" alt="${work.title}"></div>`
        : `<div class="work-preview"><div class="file-icon ${work.type}">${getFileIcon(work.type)}</div></div>`;

    const deleteBtn = isOwn ? `<button class="btn-danger" onclick="deleteWork('${work.id}')">Delete</button>` : '';

    const comments = DB.comments[work.id] || [];
    const commentsHtml = comments.length > 0 
        ? `<div class="work-comments"><div class="comments-title">💬 Comments (${comments.length})</div>` + 
          comments.map(c => `
            <div class="comment-item">
                <span class="comment-name">${c.sender}:</span>
                <span class="comment-text">${escapeHtml(c.text)}</span>
                <span class="comment-time">${new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          `).join('') + '</div>'
        : '';

    const commentInput = `
        <div class="comment-input-area">
            <input type="text" class="comment-input" id="comment-${work.id}" placeholder="Write a comment..." maxlength="200">
            <button class="comment-send-btn" onclick="addComment('${work.id}')">💬</button>
        </div>
    `;

    return `
        <div class="work-card" id="work-${work.id}">
            ${preview}
            <div class="work-title">${work.title}</div>
            <div class="work-desc">${work.description}</div>
            <div class="work-student">By: ${work.student}</div>
            <div class="work-rating">${starHtml}</div>
            <div class="work-points">${points} points</div>
            <div class="work-actions">
                ${deleteBtn}
                <button class="btn-secondary" onclick="downloadFile('${work.fileName}')">Download</button>
            </div>
            ${commentsHtml}
            ${commentInput}
        </div>
    `;
}

function addComment(workId) {
    const input = document.getElementById('comment-' + workId);
    if (!input) return;
    const text = input.value.trim();
    if (!text || !DB.currentUser) return;

    if (!DB.comments[workId]) DB.comments[workId] = [];
    DB.comments[workId].push({
        sender: DB.currentUser.name,
        text: text,
        time: new Date().toISOString()
    });
    saveDB();
    renderAllStudentWorks();
    showToast('Comment added!', 'success');
}

function handleStudentWorkUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const title = document.getElementById('workTitle').value.trim();
    const desc = document.getElementById('workDesc').value.trim();
    if (!title) { showToast('Please enter a title for your work.', 'error'); return; }

    const typeMap = {
        'application/pdf': 'pdf', 'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
        'image/': 'img', 'video/': 'video', 'application/zip': 'zip', 'application/x-zip-compressed': 'zip'
    };
    let type = 'other';
    for (const [key, val] of Object.entries(typeMap)) {
        if (file.type.startsWith(key) || file.type === key) { type = val; break; }
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const work = {
            id: Date.now().toString(),
            title: title,
            description: desc || 'No description',
            fileName: file.name,
            type: type,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            student: DB.currentUser.name,
            date: new Date().toISOString().split('T')[0],
            data: type === 'img' ? evt.target.result : null
        };
        DB.studentWorks.unshift(work);
        saveDB();
        renderStudentWorks();
        renderAllStudentWorks();
        renderLeaderboard();
        document.getElementById('workTitle').value = '';
        document.getElementById('workDesc').value = '';
        showToast('Work submitted successfully!', 'success');
    };
    if (type === 'img') reader.readAsDataURL(file);
    else reader.readAsText(file);
}

function rateWork(workId, stars, event) {
    event.stopPropagation();
    if (!DB.currentUser || DB.currentUser.name !== TUTOR_NAME) return;
    const points = stars * 10;
    DB.ratings[workId] = { stars: stars, points: points, ratedBy: TUTOR_NAME, ratedAt: new Date().toISOString() };
    saveDB();
    renderAllStudentWorks();
    renderLeaderboard();
    showToast('Rated ' + stars + ' stars (' + points + ' points)!', 'success');
}

function deleteWork(workId) {
    if (!confirm('Are you sure you want to delete this work?')) return;
    DB.studentWorks = DB.studentWorks.filter(w => w.id !== workId);
    delete DB.ratings[workId];
    delete DB.comments[workId];
    saveDB();
    renderStudentWorks();
    renderAllStudentWorks();
    renderLeaderboard();
    showToast('Work deleted successfully.', 'info');
}

// ================== QUIZ CHALLENGE SYSTEM ==================

// Tutor: Build quiz creation form dynamically
function buildQuizForm() {
    const container = document.getElementById('quizBuilder');
    if (!container) return;

    const qCount = parseInt(document.getElementById('quizQCount').value) || 3;
    const optCount = parseInt(document.getElementById('quizOptCount').value) || 4;

    // Show the publish button
    const btn = document.getElementById('quizCreateBtn');
    if (btn) btn.style.display = 'block';

    let html = '<div class="quiz-questions-list">';
    for (let i = 0; i < qCount; i++) {
        html += `
            <div class="quiz-question-block">
                <div class="quiz-question-label">Question ${i + 1}</div>
                <input type="text" class="quiz-q-text" id="qText-${i}" placeholder="Enter question ${i + 1} text..." required>
                <div class="quiz-options-grid">`;
        for (let j = 0; j < optCount; j++) {
            const optLetter = String.fromCharCode(65 + j);
            html += `
                    <label class="quiz-option-label">
                        <input type="radio" name="qCorrect-${i}" value="${j}" ${j === 0 ? 'checked' : ''}>
                        <span>${optLetter}.</span>
                        <input type="text" class="quiz-opt-text" id="q${i}-opt${j}" placeholder="Option ${optLetter}" required>
                    </label>`;
        }
        html += `</div></div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function createQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const desc = document.getElementById('quizDesc').value.trim();
    const pointsPerQ = parseInt(document.getElementById('quizPoints').value) || 10;
    const qCount = parseInt(document.getElementById('quizQCount').value) || 3;
    const optCount = parseInt(document.getElementById('quizOptCount').value) || 4;

    if (!title) { showToast('Please enter a quiz title.', 'error'); return; }

    const questions = [];
    for (let i = 0; i < qCount; i++) {
        const qText = document.getElementById('qText-' + i).value.trim();
        if (!qText) { showToast('Please fill in question ' + (i + 1), 'error'); return; }

        const options = [];
        let correctIndex = 0;
        const radios = document.getElementsByName('qCorrect-' + i);
        for (let r = 0; r < radios.length; r++) {
            if (radios[r].checked) correctIndex = parseInt(radios[r].value);
        }

        for (let j = 0; j < optCount; j++) {
            const optText = document.getElementById('q' + i + '-opt' + j).value.trim();
            if (!optText) { showToast('Please fill all options for question ' + (i + 1), 'error'); return; }
            options.push(optText);
        }

        questions.push({ text: qText, options: options, correct: correctIndex });
    }

    const quiz = {
        id: 'quiz_' + Date.now(),
        title: title,
        description: desc || 'No description',
        createdBy: DB.currentUser.name,
        createdAt: new Date().toISOString(),
        questions: questions,
        pointsPerQuestion: pointsPerQ,
        active: true
    };

    DB.quizzes.push(quiz);
    saveDB();

    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDesc').value = '';
    document.getElementById('quizBuilder').innerHTML = '';

    renderQuizManager();
    renderAvailableQuizzes();
    showToast('Quiz created successfully!', 'success');
}

function deleteQuiz(quizId) {
    if (!confirm('Delete this quiz? All results will be lost.')) return;
    DB.quizzes = DB.quizzes.filter(q => q.id !== quizId);
    DB.quizResults = DB.quizResults.filter(r => r.quizId !== quizId);
    saveDB();
    renderQuizManager();
    renderAvailableQuizzes();
    showToast('Quiz deleted.', 'info');
}

function renderQuizManager() {
    const container = document.getElementById('quizManagerList');
    if (!container) return;

    if (DB.quizzes.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">No quizzes created yet.</div>';
        return;
    }

    container.innerHTML = DB.quizzes.map(quiz => {
        const resultCount = DB.quizResults.filter(r => r.quizId === quiz.id).length;
        const date = new Date(quiz.createdAt).toLocaleDateString();
        return `
            <div class="quiz-list-item">
                <div class="quiz-list-info">
                    <div class="quiz-list-title">${quiz.title}</div>
                    <div class="quiz-list-meta">${quiz.questions.length} questions • ${quiz.pointsPerQuestion} pts each • ${resultCount} attempts • Created ${date}</div>
                </div>
                <div class="quiz-list-actions">
                    <button class="btn-secondary" onclick="viewQuizStats('${quiz.id}')">📊 Stats</button>
                    <button class="btn-danger" onclick="deleteQuiz('${quiz.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewQuizStats(quizId) {
    const quiz = DB.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const results = DB.quizResults.filter(r => r.quizId === quizId);

    let html = `<div style="margin-bottom:16px;"><strong>${quiz.title}</strong> - ${results.length} attempts</div>`;
    if (results.length === 0) {
        html += '<div style="color:var(--text-muted);font-size:13px;">No attempts yet.</div>';
    } else {
        html += '<table class="admin-table"><thead><tr><th>Student</th><th>Score</th><th>Points</th><th>Date</th></tr></thead><tbody>';
        results.sort((a, b) => b.score - a.score);
        results.forEach(r => {
            html += `<tr><td>${r.user}</td><td>${r.score}/${r.totalQuestions}</td><td>+${r.earnedPoints}</td><td>${new Date(r.completedAt).toLocaleDateString()}</td></tr>`;
        });
        html += '</tbody></table>';
    }

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `<div class="quiz-modal-content"><button class="quiz-modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>${html}</div>`;
    document.body.appendChild(modal);
}

// Student: Available Quizzes
function renderAvailableQuizzes() {
    const container = document.getElementById('availableQuizzes');
    if (!container) return;
    const user = DB.currentUser;
    if (!user) return;

    const activeQuizzes = DB.quizzes.filter(q => q.active);
    if (activeQuizzes.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">No quizzes available yet. Check back later!</div>';
        return;
    }

    container.innerHTML = activeQuizzes.map(quiz => {
        const myResult = DB.quizResults.find(r => r.quizId === quiz.id && r.user === user.name);
        const status = myResult 
            ? `<span class="quiz-status done">✓ Completed (${myResult.score}/${myResult.totalQuestions})</span>`
            : `<span class="quiz-status pending">⏳ Not taken</span>`;
        const btn = myResult 
            ? `<button class="btn-secondary" disabled style="opacity:0.5;">Already Taken</button>`
            : `<button class="btn-primary" onclick="startQuiz('${quiz.id}')">Start Quiz</button>`;

        return `
            <div class="quiz-card">
                <div class="quiz-card-header">
                    <div class="quiz-card-title">${quiz.title}</div>
                    ${status}
                </div>
                <div class="quiz-card-desc">${quiz.description}</div>
                <div class="quiz-card-meta">
                    <span>📝 ${quiz.questions.length} questions</span>
                    <span>⭐ ${quiz.pointsPerQuestion} pts each</span>
                    <span>🏆 ${quiz.questions.length * quiz.pointsPerQuestion} total</span>
                </div>
                <div style="margin-top:12px;">${btn}</div>
            </div>
        `;
    }).join('');
}

// Quiz Taking
function startQuiz(quizId) {
    const quiz = DB.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const user = DB.currentUser;
    if (!user) return;

    // Check if already taken
    const existing = DB.quizResults.find(r => r.quizId === quizId && r.user === user.name);
    if (existing) {
        showToast('You already completed this quiz!', 'info');
        return;
    }

    const container = document.getElementById('quizTakingArea');
    const list = document.getElementById('availableQuizzes');
    if (list) list.style.display = 'none';
    if (container) container.style.display = 'block';
    if (!container) return;

    let html = `
        <div class="quiz-taking-header">
            <h3>${quiz.title}</h3>
            <p>${quiz.description}</p>
            <div class="quiz-taking-meta">${quiz.questions.length} questions • ${quiz.pointsPerQuestion} points each</div>
        </div>
        <div class="quiz-taking-form">`;

    quiz.questions.forEach((q, i) => {
        html += `
            <div class="quiz-taking-question">
                <div class="quiz-taking-qtext"><strong>Q${i + 1}.</strong> ${escapeHtml(q.text)}</div>
                <div class="quiz-taking-options">`;
        q.options.forEach((opt, j) => {
            const letter = String.fromCharCode(65 + j);
            html += `
                    <label class="quiz-taking-option">
                        <input type="radio" name="quizAns-${i}" value="${j}">
                        <span class="quiz-opt-letter">${letter}</span>
                        <span class="quiz-opt-text">${escapeHtml(opt)}</span>
                    </label>`;
        });
        html += `</div></div>`;
    });

    html += `
        </div>
        <div class="quiz-taking-actions">
            <button class="btn-secondary" onclick="cancelQuiz()">Cancel</button>
            <button class="btn-primary" onclick="submitQuiz('${quiz.id}')">Submit Answers</button>
        </div>
    `;

    container.innerHTML = html;
}

function cancelQuiz() {
    const container = document.getElementById('quizTakingArea');
    const list = document.getElementById('availableQuizzes');
    if (container) container.style.display = 'none';
    if (list) list.style.display = 'grid';
}

function submitQuiz(quizId) {
    const quiz = DB.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const user = DB.currentUser;
    if (!user) return;

    const answers = [];
    let correctCount = 0;

    for (let i = 0; i < quiz.questions.length; i++) {
        const radios = document.getElementsByName('quizAns-' + i);
        let selected = -1;
        for (let r = 0; r < radios.length; r++) {
            if (radios[r].checked) selected = parseInt(radios[r].value);
        }
        if (selected === -1) {
            showToast('Please answer all questions before submitting.', 'error');
            return;
        }
        answers.push(selected);
        if (selected === quiz.questions[i].correct) correctCount++;
    }

    const earnedPoints = correctCount * quiz.pointsPerQuestion;
    const result = {
        quizId: quizId,
        user: user.name,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        earnedPoints: earnedPoints,
        answers: answers,
        completedAt: new Date().toISOString()
    };

    DB.quizResults.push(result);
    saveDB();

    // Show results
    const container = document.getElementById('quizTakingArea');
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    let message = percentage >= 80 ? '🎉 Excellent!' : percentage >= 50 ? '👍 Good job!' : '💪 Keep practicing!';

    if (container) {
        container.innerHTML = `
            <div class="quiz-result-card">
                <div class="quiz-result-icon">${percentage >= 50 ? '🏆' : '📝'}</div>
                <div class="quiz-result-title">${message}</div>
                <div class="quiz-result-score">${correctCount} / ${quiz.questions.length} correct</div>
                <div class="quiz-result-percent">${percentage}%</div>
                <div class="quiz-result-points">+${earnedPoints} points earned!</div>
                <button class="btn-primary" onclick="finishQuiz()" style="margin-top:20px;">Back to Quizzes</button>
            </div>
        `;
    }

    updatePointsBadge();
    renderLeaderboard();
    showToast('Quiz submitted! +' + earnedPoints + ' points!', 'success');
}

function finishQuiz() {
    const container = document.getElementById('quizTakingArea');
    const list = document.getElementById('availableQuizzes');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    if (list) list.style.display = 'grid';
    renderAvailableQuizzes();
    renderQuizResults();
}

function renderQuizResults() {
    const container = document.getElementById('myQuizResults');
    if (!container) return;
    const user = DB.currentUser;
    if (!user) return;

    const myResults = DB.quizResults.filter(r => r.user === user.name);
    if (myResults.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No quizzes taken yet. Start your first challenge!</div>';
        return;
    }

    container.innerHTML = myResults.map(r => {
        const quiz = DB.quizzes.find(q => q.id === r.quizId);
        const quizTitle = quiz ? quiz.title : 'Deleted Quiz';
        const percentage = Math.round((r.score / r.totalQuestions) * 100);
        const date = new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `
            <div class="quiz-result-item">
                <div class="quiz-result-info">
                    <div class="quiz-result-name">${quizTitle}</div>
                    <div class="quiz-result-date">${date} • ${r.score}/${r.totalQuestions} correct</div>
                </div>
                <div class="quiz-result-badge">
                    <span class="quiz-result-pct ${percentage >= 80 ? 'high' : percentage >= 50 ? 'mid' : 'low'}">${percentage}%</span>
                    <span class="quiz-result-pts">+${r.earnedPoints} pts</span>
                </div>
            </div>
        `;
    }).join('');
}

// ================== ADMIN PANEL ==================
function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersTable');
    if (!tbody) return;
    tbody.innerHTML = DB.users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td><span class="member-role ${getRoleClass(u.name)}">${getRole(u.name)}</span></td>
            <td>${new Date(u.joinedAt).toLocaleDateString()}</td>
            <td><button class="btn-danger" onclick="deleteUser('${u.name}')">Delete</button></td>
        </tr>
    `).join('');
}

function renderAdminMessages() {
    const tbody = document.getElementById('adminMessagesTable');
    if (!tbody) return;
    tbody.innerHTML = DB.messages.map((m, i) => `
        <tr>
            <td>${m.sender}</td>
            <td>${escapeHtml(m.text.substring(0, 50))}${m.text.length > 50 ? '...' : ''}</td>
            <td>${new Date(m.time).toLocaleString()}</td>
            <td><button class="btn-danger" onclick="deleteMessage(${i})">Delete</button></td>
        </tr>
    `).join('');
}

function renderAdminWorks() {
    const tbody = document.getElementById('adminWorksTable');
    if (!tbody) return;
    tbody.innerHTML = DB.studentWorks.map(w => `
        <tr>
            <td>${w.title}</td>
            <td>${w.student}</td>
            <td>${w.type}</td>
            <td>${DB.ratings[w.id] ? DB.ratings[w.id].stars + '★' : 'Not rated'}</td>
            <td><button class="btn-danger" onclick="deleteWork('${w.id}')">Delete</button></td>
        </tr>
    `).join('');
}

function deleteUser(name) {
    if (!confirm('Delete user ' + name + '?')) return;
    DB.users = DB.users.filter(u => u.name !== name);
    DB.studentWorks = DB.studentWorks.filter(w => w.student !== name);
    DB.messages = DB.messages.filter(m => m.sender !== name);
    DB.quizResults = DB.quizResults.filter(r => r.user !== name);
    saveDB();
    renderAdminUsers();
    renderAdminMessages();
    renderAdminWorks();
    showToast('User deleted.', 'info');
}

function deleteMessage(index) {
    if (!confirm('Delete this message?')) return;
    DB.messages.splice(index, 1);
    saveDB();
    renderAdminMessages();
    showToast('Message deleted.', 'info');
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));
    event.target.classList.add('active');
    document.getElementById('admin' + tab).classList.remove('hidden');
    if (tab === 'Users') renderAdminUsers();
    if (tab === 'Messages') renderAdminMessages();
    if (tab === 'Works') renderAdminWorks();
}


// ================== UTILS ==================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + (type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ') + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updatePointsBadge() {
    const badge = document.getElementById('pointsBadge');
    if (!badge || !DB.currentUser) return;
    const points = getUserPoints(DB.currentUser.name);
    badge.innerHTML = '⭐ ' + points;
}