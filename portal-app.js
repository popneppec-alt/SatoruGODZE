// Supabase Configuration
const SUPABASE_URL = 'https://mfktgnwlqjytqjxrvowi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3RnbndscWp5dHFqeHJ2b3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjE2MjYsImV4cCI6MjA4NzkzNzYyNn0.WeFMGZrSk-0EGahmyBC1PS5Byv_NwQJCPLOR1aZSr80';

let clientSupabase = null;
let currentUser = null;
let currentView = 'dashboard';
let currentGroupId = null;
let currentGroupName = null;

// Управление темой
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// Create stars
function createStars() {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
  }
}

function updateLoadingStatus(message) {
  const statusEl = document.getElementById('loading-status');
  if (statusEl) statusEl.textContent = message;
}

async function initSupabase() {
  try {
    initTheme(); // Инициализация темы
    updateLoadingStatus('Загрузка библиотеки...');
    
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Библиотека Supabase не загружена');
    }

    updateLoadingStatus('Создание клиента...');
    const { createClient } = window.supabase;
    clientSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    updateLoadingStatus('Проверка подключения...');
    const { data, error } = await clientSupabase.from('users').select('id').limit(1);
    
    if (error) {
      throw new Error(error.message);
    }

    updateLoadingStatus('Готово!');
    setTimeout(() => {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('login-page').style.display = 'flex';
      createStars();
    }, 500);
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    document.getElementById('loading').innerHTML = `
      <div style="max-width: 600px; padding: 40px; background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 10px; text-align: center;">
        <h2 style="color: #f44336; margin-bottom: 20px;">❌ Ошибка подключения</h2>
        <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">${error.message}</p>
        <button onclick="location.reload()" style="padding: 15px 30px; background: #dc143c; color: white; border: none; cursor: pointer; border-radius: 5px; font-size: 14px;">
          Попробовать снова
        </button>
      </div>
    `;
  }
}

// Role selection
function selectRole(role) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.role-card[data-role="${role}"]`);
  if (card) card.classList.add('selected');

  const logins = { admin: 'admin', teacher: 'teacher', student: 'student' };
  const usernameInput = document.getElementById('username');
  if (usernameInput) usernameInput.value = logins[role] || '';
  document.getElementById('password').focus();
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('login-btn');

  loginBtn.textContent = 'ВХОД...';
  loginBtn.disabled = true;

  try {
    const { data: users, error } = await clientSupabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !users) {
      const errEl = document.getElementById('login-error');
      errEl.textContent = 'Неверный логин или пароль';
      errEl.style.display = 'block';
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
      return;
    }

    currentUser = users;
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('login-error').textContent = '';
    showDashboard();
  } catch (error) {
    console.error('Ошибка входа:', error);
    document.getElementById('login-error').textContent = 'Ошибка входа';
  } finally {
    loginBtn.textContent = 'ВОЙТИ';
    loginBtn.disabled = false;
  }
}

function handleLogout() {
  currentUser = null;
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('dashboard-page').style.display = 'none';
  document.getElementById('login-form').reset();
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  window.scrollTo(0, 0);
}


// Navigation
function updateNavigation() {
  const navMenu = document.getElementById('nav-menu');
  let menuHTML = '<button onclick="showDashboard()" class="' + (currentView === 'dashboard' ? 'active' : '') + '">Главная</button>';
  
  if (currentUser.role === 'student') {
    menuHTML += `
      <button onclick="showGrades()" class="${currentView === 'grades' ? 'active' : ''}">Оценки</button>
      <button onclick="showSchedule()" class="${currentView === 'schedule' ? 'active' : ''}">Расписание</button>
      <button onclick="showAssignments()" class="${currentView === 'assignments' ? 'active' : ''}">Задания</button>
      <button onclick="showMaterials()" class="${currentView === 'materials' ? 'active' : ''}">Материалы</button>
      <button onclick="showNews()" class="${currentView === 'news' ? 'active' : ''}">Новости</button>
    `;
  } else if (currentUser.role === 'teacher') {
    menuHTML += `
      <button onclick="showTeacherGrades()" class="${currentView === 'grades' ? 'active' : ''}">Журнал</button>
      <button onclick="showSchedule()" class="${currentView === 'schedule' ? 'active' : ''}">Расписание</button>
      <button onclick="showTeacherAssignments()" class="${currentView === 'assignments' ? 'active' : ''}">Задания</button>
      <button onclick="showTeacherMaterials()" class="${currentView === 'materials' ? 'active' : ''}">Материалы</button>
      <button onclick="showTeacherAttendance()" class="${currentView === 'attendance' ? 'active' : ''}">Посещаемость</button>
      <button onclick="showNews()" class="${currentView === 'news' ? 'active' : ''}">Новости</button>
    `;
  } else if (currentUser.role === 'admin') {
    menuHTML += `
      <button onclick="showUsers()" class="${currentView === 'users' ? 'active' : ''}">Пользователи</button>
      <button onclick="showAdminSchedule()" class="${currentView === 'schedule' ? 'active' : ''}">Расписание</button>
      <button onclick="showAdminNews()" class="${currentView === 'news' ? 'active' : ''}">Новости</button>
      <button onclick="showAnalytics()" class="${currentView === 'analytics' ? 'active' : ''}">Аналитика</button>
    `;
  }
  
  navMenu.innerHTML = menuHTML;
}

async function showDashboard() {
  currentView = 'dashboard';
  document.getElementById('login-page').style.display = 'none';
  const dashboardPage = document.getElementById('dashboard-page');
  dashboardPage.style.display = 'flex';
  window.scrollTo(0, 0);

  document.getElementById('user-name').textContent = currentUser.full_name;
  document.getElementById('theme-toggle').onclick = toggleTheme;
  document.getElementById('logout-btn').onclick = handleLogout;

  updateNavigation();

  const content = document.getElementById('content');
  if (currentUser.role === 'admin') {
    showAdminDashboard(content);
  } else if (currentUser.role === 'teacher') {
    showTeacherDashboard(content);
  } else if (currentUser.role === 'student') {
    showStudentDashboard(content);
  }
}



// Admin Dashboard
async function showAdminDashboard(content) {
  const { data: users } = await clientSupabase.from('users').select('*');
  const { data: subjects } = await clientSupabase.from('subjects').select('*');
  const { data: groups } = await clientSupabase.from('groups').select('*');
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  content.innerHTML = `
    <h2>ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
    <p style="color: rgba(0,0,0,0.6); margin-bottom: 40px;">Добро пожаловать, ${currentUser.full_name}</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${students.length}</div>
        <div class="stat-label">УЧЕНИКОВ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${teachers.length}</div>
        <div class="stat-label">УЧИТЕЛЕЙ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${subjects.length}</div>
        <div class="stat-label">ПРЕДМЕТОВ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${groups.length}</div>
        <div class="stat-label">ГРУПП</div>
      </div>
    </div>

    <h3 style="margin-top: 60px; margin-bottom: 30px; font-size: 24px; color: rgba(0,0,0,0.8);">БЫСТРЫЕ ДЕЙСТВИЯ</h3>
    <div class="btn-group">
      <button onclick="showUsers()">Управление пользователями</button>
      <button onclick="showAdminSchedule()">Управление расписанием</button>
      <button onclick="showAdminNews()">Управление новостями</button>
    </div>
  `;
}

// Teacher Dashboard  
async function showTeacherDashboard(content) {
  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  // Получаем только студентов из групп, где учитель ведёт предметы
  const subjectIds = teacherSubjects ? teacherSubjects.map(ts => ts.subject_id) : [];
  
  const { data: mySchedules } = await clientSupabase
    .from('schedules')
    .select('group_id')
    .eq('teacher_id', currentUser.id);
  
  const myGroupIds = mySchedules ? [...new Set(mySchedules.map(s => s.group_id))] : [];

  let myStudents = [];
  if (myGroupIds.length > 0) {
    const { data: students } = await clientSupabase
      .from('users')
      .select('*, groups(name)')
      .eq('role', 'student')
      .in('group_id', myGroupIds);
    myStudents = students || [];
  }

  content.innerHTML = `
    <h2>ПАНЕЛЬ УЧИТЕЛЯ</h2>
    <p style="color: rgba(0,0,0,0.6); margin-bottom: 40px;">Добро пожаловать, ${currentUser.full_name}</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${teacherSubjects?.length || 0}</div>
        <div class="stat-label">ПРЕДМЕТОВ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${myGroupIds.length}</div>
        <div class="stat-label">ГРУПП</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${myStudents.length}</div>
        <div class="stat-label">УЧЕНИКОВ</div>
      </div>
    </div>

    <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 20px; color: rgba(0,0,0,0.8);">МОИ ПРЕДМЕТЫ</h3>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;">
      ${(teacherSubjects || []).map(ts => `
        <div class="subject-card" onclick="showSubjectGrades(${ts.subject_id}, '${ts.subjects.name}')">
          <div style="font-size: 16px; font-weight: 700; color: #000;">${ts.subjects.name}</div>
          <div style="font-size: 11px; color: #888; margin-top: 4px;">Нажмите для журнала</div>
        </div>
      `).join('')}
    </div>

    <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 20px; color: rgba(0,0,0,0.8);">БЫСТРЫЕ ДЕЙСТВИЯ</h3>
    <div class="btn-group">
      <button onclick="showTeacherGrades()">📊 Журнал оценок</button>
      <button onclick="showTeacherAssignments()">📝 Мои задания</button>
      <button onclick="showTeacherMaterials()">📚 Мои материалы</button>
      <button onclick="showTeacherAttendance()">✅ Посещаемость</button>
    </div>

    <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 20px; color: rgba(0,0,0,0.8);">МОИ УЧЕНИКИ</h3>
    ${myStudents.length === 0 
      ? '<p style="color:rgba(0,0,0,0.4);">Нет учеников в ваших группах</p>'
      : `<table>
          <thead><tr><th>ФИО</th><th>Группа</th><th>Действия</th></tr></thead>
          <tbody>
            ${myStudents.map(s => `
              <tr>
                <td>${s.full_name}</td>
                <td>${s.groups?.name || '-'}</td>
                <td><button class="small" onclick="addGradeForStudent(${s.id}, '${s.full_name.replace(/'/g,"\\'")}')">Поставить оценку</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
    }
  `;
}


// Student Dashboard
async function showStudentDashboard(content) {
  const { data: finalGrades } = await clientSupabase
    .from('final_grades')
    .select('*, subjects(name)')
    .eq('student_id', currentUser.id);

  const { data: grades } = await clientSupabase
    .from('grades')
    .select('*, subjects(name)')
    .eq('student_id', currentUser.id)
    .order('date', { ascending: false });

  const { data: attendance } = await clientSupabase
    .from('attendance')
    .select('*')
    .eq('student_id', currentUser.id);

  const { data: assignments } = await clientSupabase
    .from('assignments')
    .select('*')
    .eq('group_id', currentUser.group_id);

  const { data: submissions } = await clientSupabase
    .from('assignment_submissions')
    .select('*')
    .eq('student_id', currentUser.id);

  let gpa = 0;
  if (finalGrades && finalGrades.length > 0) {
    const sum = finalGrades.reduce((acc, fg) => acc + parseFloat(fg.gpa), 0);
    gpa = (sum / finalGrades.length);
  }

  const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0;
  const totalAttendance = presentCount + absentCount;
  const attendancePercent = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100) : 0;

  const totalAssignments = assignments?.length || 0;
  const completedAssignments = submissions?.length || 0;
  const assignmentPercent = totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100) : 0;

  // Группировка оценок по предметам
  const subjectStats = {};
  if (grades && grades.length > 0) {
    grades.forEach(g => {
      const subjectName = g.subjects?.name || 'Неизвестно';
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { grades: [], total: 0, count: 0 };
      }
      subjectStats[subjectName].grades.push(g.grade);
      subjectStats[subjectName].total += g.grade;
      subjectStats[subjectName].count += 1;
    });
  }

  const gpaColor = gpa >= 3 ? 'high' : gpa >= 2 ? 'medium' : 'low';
  const gpaPercent = (gpa / 4) * 100;
  const attendanceColor = attendancePercent >= 80 ? 'high' : attendancePercent >= 60 ? 'medium' : 'low';
  const assignmentColor = assignmentPercent >= 80 ? 'high' : assignmentPercent >= 60 ? 'medium' : 'low';

  content.innerHTML = `
    <h2>ПАНЕЛЬ УЧЕНИКА</h2>
    <p style="text-align: center; color: rgba(0,0,0,0.6); margin: 40px 0;">Добро пожаловать, ${currentUser.full_name}</p>
    
    <div class="gpa-display-new">
      <div class="gpa-number">${gpa.toFixed(2)}</div>
      <div class="gpa-label">Средний GPA</div>
      <div class="progress-item">
        <div class="progress-bar-container">
          <div class="progress-bar ${gpaColor}" style="width: 0%" data-width="${gpaPercent}"></div>
        </div>
        <div class="progress-tooltip">
          GPA: ${gpa.toFixed(2)} / 4.0<br>
          Итоговых оценок: ${finalGrades?.length || 0}
        </div>
      </div>
    </div>

    <div class="progress-section">
      <h3 style="font-size: 24px; color: #000; margin-bottom: 30px;">📊 ОБЩАЯ УСПЕВАЕМОСТЬ</h3>
      
      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">Посещаемость</span>
          <span class="progress-value">${attendancePercent.toFixed(0)}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar ${attendanceColor}" style="width: 0%" data-width="${attendancePercent}"></div>
        </div>
        <div class="progress-tooltip">
          Присутствовал: ${presentCount} раз<br>
          Пропущено: ${absentCount} раз<br>
          Всего занятий: ${totalAttendance}
        </div>
      </div>

      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">Выполнение заданий</span>
          <span class="progress-value">${assignmentPercent.toFixed(0)}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar ${assignmentColor}" style="width: 0%" data-width="${assignmentPercent}"></div>
        </div>
        <div class="progress-tooltip">
          Сдано: ${completedAssignments}<br>
          Всего заданий: ${totalAssignments}<br>
          Не сдано: ${totalAssignments - completedAssignments}
        </div>
      </div>
    </div>

    <h3 style="font-size: 24px; color: #000; margin: 60px 0 30px;">📚 УСПЕВАЕМОСТЬ ПО ПРЕДМЕТАМ</h3>
    <div class="circular-progress-grid">
      ${Object.keys(subjectStats).map(subjectName => {
        const stats = subjectStats[subjectName];
        const avgGrade = stats.total / stats.count;
        const percent = (avgGrade / 100) * 100;
        const color = avgGrade >= 80 ? '#00c853' : avgGrade >= 60 ? '#ffa500' : '#dc143c';
        const circumference = 2 * Math.PI * 60;
        const offset = circumference - (percent / 100) * circumference;
        
        return `
          <div class="circular-progress-item">
            <div class="circular-progress">
              <svg width="150" height="150">
                <circle class="circular-progress-bg" cx="75" cy="75" r="60"></circle>
                <circle class="circular-progress-bar" cx="75" cy="75" r="60" 
                  stroke="${color}"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${circumference}"
                  data-offset="${offset}"></circle>
              </svg>
              <div class="circular-progress-text">${avgGrade.toFixed(0)}</div>
            </div>
            <div class="circular-subject-name">${subjectName}</div>
            <div class="circular-subject-info">Оценок: ${stats.count}</div>
          </div>
        `;
      }).join('')}
    </div>

    <h3 style="margin-top: 60px; margin-bottom: 20px; font-size: 24px; color: #000;">БЫСТРЫЕ ДЕЙСТВИЯ</h3>
    <div class="btn-group">
      <button onclick="showGrades()">Мои оценки</button>
      <button onclick="showSchedule()">Расписание</button>
      <button onclick="showAssignments()">Задания</button>
      <button onclick="showMaterials()">Материалы</button>
    </div>
  `;

  // Анимация прогресс-баров
  setTimeout(() => {
    document.querySelectorAll('.progress-bar').forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.width = width + '%';
    });

    document.querySelectorAll('.circular-progress-bar').forEach(circle => {
      const offset = circle.getAttribute('data-offset');
      circle.style.strokeDashoffset = offset;
    });
  }, 100);
}

// Grades Module (Student)
async function showGrades() {
  currentView = 'grades';
  updateNavigation();
  
  const { data: finalGrades } = await clientSupabase
    .from('final_grades')
    .select('*, subjects(name)')
    .eq('student_id', currentUser.id);

  const { data: grades } = await clientSupabase
    .from('grades')
    .select('*, subjects(name)')
    .eq('student_id', currentUser.id)
    .order('date', { ascending: false });

  let html = '<h2>📊 МОИ ОЦЕНКИ</h2>';
  
  if (finalGrades && finalGrades.length > 0) {
    html += `
      <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 24px; color: rgba(0,0,0,0.8);">ИТОГОВЫЕ ОЦЕНКИ</h3>
      <table>
        <thead><tr><th>Предмет</th><th>Четверть</th><th>Оценка</th><th>GPA</th></tr></thead>
        <tbody>
          ${finalGrades.map(fg => `
            <tr>
              <td>${fg.subjects?.name || 'Неизвестно'}</td>
              <td>${fg.quarter}</td>
              <td>${fg.grade}</td>
              <td><span class="badge ${fg.gpa >= 3.0 ? 'success' : fg.gpa >= 2.0 ? 'warning' : 'danger'}">${fg.gpa}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  if (grades && grades.length > 0) {
    html += `
      <h3 style="margin-top: 60px; margin-bottom: 20px; font-size: 24px; color: rgba(0,0,0,0.8);">ПОСЛЕДНИЕ ОЦЕНКИ</h3>
      <table>
        <thead><tr><th>Предмет</th><th>Оценка</th><th>GPA</th><th>Тип</th><th>Дата</th></tr></thead>
        <tbody>
          ${grades.slice(0, 20).map(g => `
            <tr>
              <td>${g.subjects?.name || 'Неизвестно'}</td>
              <td>${g.grade}</td>
              <td><span class="badge ${g.gpa >= 3.0 ? 'success' : g.gpa >= 2.0 ? 'warning' : 'danger'}">${g.gpa}</span></td>
              <td>${g.grade_type}</td>
              <td>${new Date(g.date).toLocaleDateString('ru-RU')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Оценок пока нет</p>';
  }
  
  document.getElementById('content').innerHTML = html;
}


// Schedule Module
async function showSchedule() {
  currentView = 'schedule';
  updateNavigation();
  
  const { data: schedules } = await clientSupabase
    .from('schedules')
    .select('*, subjects(name), users(full_name), groups(name)')
    .eq('group_id', currentUser.group_id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  
  let html = '<h2>📅 РАСПИСАНИЕ</h2>';
  
  if (!schedules || schedules.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Расписание пока не создано</p>';
  } else {
    days.forEach((day, index) => {
      const daySchedule = schedules.filter(s => s.day_of_week === index + 1);
      if (daySchedule.length > 0) {
        html += `
          <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 24px; color: rgba(0,0,0,0.8);">${day}</h3>
          <table>
            <thead><tr><th>Время</th><th>Предмет</th><th>Учитель</th><th>Кабинет</th></tr></thead>
            <tbody>
              ${daySchedule.map(s => `
                <tr>
                  <td>${s.start_time.substring(0,5)} - ${s.end_time.substring(0,5)}</td>
                  <td>${s.subjects?.name || 'Неизвестно'}</td>
                  <td>${s.users?.full_name || 'Неизвестно'}</td>
                  <td>${s.room_number || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    });
  }
  
  document.getElementById('content').innerHTML = html;
}

// Assignments Module (Student)
async function showAssignments() {
  currentView = 'assignments';
  updateNavigation();
  
  const { data: assignments } = await clientSupabase
    .from('assignments')
    .select('*, subjects(name), users(full_name)')
    .eq('group_id', currentUser.group_id)
    .order('due_date', { ascending: true });

  let html = '<h2>📝 МОИ ЗАДАНИЯ</h2>';
  
  if (!assignments || assignments.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Заданий пока нет</p>';
  } else {
    html += `
      <table>
        <thead><tr><th>Предмет</th><th>Задание</th><th>Учитель</th><th>Срок сдачи</th><th>Статус</th></tr></thead>
        <tbody>
    `;
    
    for (const assignment of assignments) {
      const { data: submission } = await clientSupabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignment.id)
        .eq('student_id', currentUser.id)
        .single();
      
      const status = submission ? (submission.grade ? 'Проверено' : 'Сдано') : 'Не сдано';
      const statusClass = submission ? (submission.grade ? 'success' : 'warning') : 'danger';
      
      html += `
        <tr style="cursor: pointer;" onclick="showAssignmentDetail(${assignment.id})">
          <td>${assignment.subjects?.name || 'Неизвестно'}</td>
          <td>${assignment.title}</td>
          <td>${assignment.users?.full_name || 'Неизвестно'}</td>
          <td>${new Date(assignment.due_date).toLocaleDateString('ru-RU')}</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
        </tr>
      `;
    }
    
    html += '</tbody></table>';
  }
  
  document.getElementById('content').innerHTML = html;
}

// Materials Module (Student)
async function showMaterials() {
  currentView = 'materials';
  updateNavigation();
  
  const { data: materials } = await clientSupabase
    .from('materials')
    .select('*, subjects(name), users(full_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  let html = '<h2>📚 УЧЕБНЫЕ МАТЕРИАЛЫ</h2>';
  
  if (!materials || materials.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Материалов пока нет</p>';
  } else {
    html += `
      <table>
        <thead><tr><th>Предмет</th><th>Название</th><th>Учитель</th><th>Тип</th><th>Дата</th></tr></thead>
        <tbody>
          ${materials.map(m => `
            <tr>
              <td>${m.subjects?.name || 'Неизвестно'}</td>
              <td>${m.title}</td>
              <td>${m.users?.full_name || 'Неизвестно'}</td>
              <td><span class="badge success">${m.file_type || 'FILE'}</span></td>
              <td>${new Date(m.created_at).toLocaleDateString('ru-RU')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  document.getElementById('content').innerHTML = html;
}

// News Module
async function showNews() {
  currentView = 'news';
  updateNavigation();
  
  const { data: news } = await clientSupabase
    .from('news')
    .select('*, news_categories(name, color), users(full_name)')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false });

  let html = '<h2>📰 НОВОСТИ КОЛЛЕДЖА</h2>';
  
  if (!news || news.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Новостей пока нет</p>';
  } else {
    news.forEach(item => {
      const isPinned = item.is_pinned ? '<span class="badge danger">Закреплено</span>' : '';
      html += `
        <div class="panel" style="cursor: pointer;">
          ${item.image_url ? `<img src="${item.image_url}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;">` : ''}
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <span class="badge" style="background: ${item.news_categories?.color || '#dc143c'}20; color: ${item.news_categories?.color || '#dc143c'}; border: 1px solid ${item.news_categories?.color || '#dc143c'}50;">
              ${item.news_categories?.name || 'Новость'}
            </span>
            ${isPinned}
          </div>
          <h3 style="font-size: 24px; margin-bottom: 10px; color: #000;">${item.title}</h3>
          <p style="color: rgba(0,0,0,0.6); margin-bottom: 10px;">${item.excerpt || ''}</p>
          <p style="color: rgba(0,0,0,0.4); font-size: 12px;">
            ${item.users?.full_name || 'Администратор'} • ${new Date(item.published_at).toLocaleDateString('ru-RU')} • ${item.views_count} просмотров
          </p>
        </div>
      `;
    });
  }
  
  document.getElementById('content').innerHTML = html;
}


// Teacher Grades Module
async function showTeacherGrades() {
  currentView = 'grades';
  updateNavigation();
  
  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  let html = '<h2>📊 ЖУРНАЛ ОЦЕНОК</h2>';
  html += '<p style="color: rgba(0,0,0,0.6); margin-bottom: 20px;">Выберите предмет для просмотра и выставления оценок</p>';
  
  if (!teacherSubjects || teacherSubjects.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">У вас нет назначенных предметов</p>';
  } else {
    html += '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
    teacherSubjects.forEach(ts => {
      html += `
        <button onclick="showSubjectGrades(${ts.subject_id}, '${ts.subjects.name}')" class="subject-card" style="padding: 20px 30px;">
          ${ts.subjects.name}
        </button>
      `;
    });
    html += '</div>';
  }
  
  document.getElementById('content').innerHTML = html;
}

// Show Subject Grades (Teacher) — с формой добавления оценки
async function showSubjectGrades(subjectId, subjectName) {
  // Получаем студентов только из групп учителя
  const { data: mySchedules } = await clientSupabase
    .from('schedules')
    .select('group_id')
    .eq('teacher_id', currentUser.id);
  
  const myGroupIds = mySchedules ? [...new Set(mySchedules.map(s => s.group_id))] : [];

  let students = [];
  if (myGroupIds.length > 0) {
    const { data } = await clientSupabase
      .from('users')
      .select('*, groups(name)')
      .eq('role', 'student')
      .in('group_id', myGroupIds)
      .order('full_name');
    students = data || [];
  } else {
    // fallback — все студенты
    const { data } = await clientSupabase.from('users').select('*, groups(name)').eq('role', 'student').order('full_name');
    students = data || [];
  }

  const { data: grades } = await clientSupabase
    .from('grades')
    .select('*')
    .eq('subject_id', subjectId)
    .order('date', { ascending: false });

  let html = `<h2>📊 ${subjectName}</h2>`;
  html += '<div class="btn-group"><button onclick="showTeacherGrades()">← Назад</button></div>';

  // Форма добавления оценки
  html += `
    <div class="panel" style="margin-top: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 20px; color: #111;">Выставить оценку</h3>
      <form id="grade-form" style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
        <div style="flex:2; min-width:180px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">УЧЕНИК</label>
          <select id="gf-student" required style="margin-bottom:0;">
            <option value="">Выберите ученика</option>
            ${students.map(s => `<option value="${s.id}">${s.full_name} (${s.groups?.name || '-'})</option>`).join('')}
          </select>
        </div>
        <div style="flex:1; min-width:100px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ОЦЕНКА (0-100)</label>
          <input type="number" id="gf-grade" min="0" max="100" placeholder="85" required style="margin-bottom:0;">
        </div>
        <div style="flex:1; min-width:120px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ТИП</label>
          <select id="gf-type" style="margin-bottom:0;">
            <option value="Практика">Практика</option>
            <option value="Контрольная">Контрольная</option>
            <option value="Лабораторная">Лабораторная</option>
            <option value="Экзамен">Экзамен</option>
            <option value="Домашняя работа">Домашняя работа</option>
          </select>
        </div>
        <div style="flex:1; min-width:130px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ДАТА</label>
          <input type="date" id="gf-date" value="${new Date().toISOString().split('T')[0]}" required style="margin-bottom:0;">
        </div>
        <div>
          <button type="submit" style="width:auto; padding:14px 24px; min-height:unset; margin:0;">Сохранить</button>
        </div>
      </form>
      <div id="grade-form-msg" style="margin-top:12px; font-size:13px;"></div>
    </div>
  `;

  // Таблица оценок
  html += `<h3 style="margin-top:32px; margin-bottom:16px; font-size:18px; color:#111;">Журнал оценок</h3>`;
  if (!students || students.length === 0) {
    html += '<p style="color:rgba(0,0,0,0.4);">Нет учеников</p>';
  } else {
    html += `
      <table>
        <thead><tr><th>Ученик</th><th>Группа</th><th>Последняя оценка</th><th>Средний балл</th><th>GPA</th></tr></thead>
        <tbody>
    `;
    students.forEach(student => {
      const sg = grades ? grades.filter(g => g.student_id === student.id) : [];
      const avg = sg.length > 0 ? (sg.reduce((s,g) => s + g.grade, 0) / sg.length).toFixed(1) : '-';
      const avgGPA = sg.length > 0 ? (sg.reduce((s,g) => s + parseFloat(g.gpa), 0) / sg.length).toFixed(2) : '-';
      const last = sg.length > 0 ? sg[0].grade : '-';
      const gpaNum = parseFloat(avgGPA);
      html += `
        <tr>
          <td>${student.full_name}</td>
          <td>${student.groups?.name || '-'}</td>
          <td>${last}</td>
          <td>${avg}</td>
          <td><span class="badge ${gpaNum >= 3.0 ? 'success' : gpaNum >= 2.0 ? 'warning' : 'danger'}">${avgGPA}</span></td>
        </tr>
      `;
    });
    html += '</tbody></table>';
  }

  document.getElementById('content').innerHTML = html;

  // Обработчик формы
  document.getElementById('grade-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('gf-student').value);
    const gradeVal = parseInt(document.getElementById('gf-grade').value);
    const gradeType = document.getElementById('gf-type').value;
    const date = document.getElementById('gf-date').value;
    const msg = document.getElementById('grade-form-msg');

    // Конвертируем балл в GPA
    const gpa = gradeVal >= 90 ? 4.0 : gradeVal >= 75 ? 3.0 : gradeVal >= 60 ? 2.0 : 1.0;

    const { error } = await clientSupabase.from('grades').insert({
      student_id: studentId,
      subject_id: subjectId,
      teacher_id: currentUser.id,
      grade: gradeVal,
      gpa: gpa,
      grade_type: gradeType,
      date: date
    });

    if (error) {
      msg.style.color = '#dc143c';
      msg.textContent = 'Ошибка: ' + error.message;
    } else {
      msg.style.color = '#00a846';
      msg.textContent = '✅ Оценка сохранена!';
      document.getElementById('gf-grade').value = '';
      // Обновляем страницу через 1 сек
      setTimeout(() => showSubjectGrades(subjectId, subjectName), 1000);
    }
  });
}

// Быстрое добавление оценки со страницы дашборда
async function addGradeForStudent(studentId, studentName) {
  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  const html = `
    <h2>Оценка для ${studentName}</h2>
    <div class="btn-group"><button onclick="showDashboard()">← Назад</button></div>
    <div class="panel" style="margin-top:24px; max-width:600px;">
      <form id="quick-grade-form">
        <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ПРЕДМЕТ</label>
        <select id="qgf-subject" required>
          <option value="">Выберите предмет</option>
          ${(teacherSubjects || []).map(ts => `<option value="${ts.subject_id}">${ts.subjects.name}</option>`).join('')}
        </select>
        <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ОЦЕНКА (0-100)</label>
        <input type="number" id="qgf-grade" min="0" max="100" placeholder="85" required>
        <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ТИП</label>
        <select id="qgf-type">
          <option value="Практика">Практика</option>
          <option value="Контрольная">Контрольная</option>
          <option value="Лабораторная">Лабораторная</option>
          <option value="Экзамен">Экзамен</option>
          <option value="Домашняя работа">Домашняя работа</option>
        </select>
        <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ДАТА</label>
        <input type="date" id="qgf-date" value="${new Date().toISOString().split('T')[0]}" required>
        <div class="btn-group">
          <button type="submit">Сохранить оценку</button>
          <button type="button" onclick="showDashboard()">Отмена</button>
        </div>
      </form>
      <div id="qgf-msg" style="margin-top:12px; font-size:13px;"></div>
    </div>
  `;
  document.getElementById('content').innerHTML = html;

  document.getElementById('quick-grade-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subjectId = parseInt(document.getElementById('qgf-subject').value);
    const gradeVal = parseInt(document.getElementById('qgf-grade').value);
    const gradeType = document.getElementById('qgf-type').value;
    const date = document.getElementById('qgf-date').value;
    const gpa = gradeVal >= 90 ? 4.0 : gradeVal >= 75 ? 3.0 : gradeVal >= 60 ? 2.0 : 1.0;
    const msg = document.getElementById('qgf-msg');

    const { error } = await clientSupabase.from('grades').insert({
      student_id: studentId,
      subject_id: subjectId,
      teacher_id: currentUser.id,
      grade: gradeVal,
      gpa: gpa,
      grade_type: gradeType,
      date: date
    });

    if (error) {
      msg.style.color = '#dc143c';
      msg.textContent = 'Ошибка: ' + error.message;
    } else {
      msg.style.color = '#00a846';
      msg.textContent = '✅ Оценка сохранена!';
      setTimeout(() => showDashboard(), 1000);
    }
  });
}

// Teacher Assignments Module
async function showTeacherAssignments() {
  currentView = 'assignments';
  updateNavigation();
  
  const { data: assignments } = await clientSupabase
    .from('assignments')
    .select('*, subjects(name), groups(name)')
    .eq('teacher_id', currentUser.id)
    .order('due_date', { ascending: false });

  let html = '<h2>📝 МОИ ЗАДАНИЯ</h2>';
  html += '<div class="btn-group"><button onclick="createAssignment()">➕ Создать задание</button></div>';
  
  if (!assignments || assignments.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Вы еще не создали ни одного задания</p>';
  } else {
    // Получаем все submissions для заданий этого учителя
    const assignmentIds = assignments.map(a => a.id);
    const { data: allSubmissions } = await clientSupabase
      .from('assignment_submissions')
      .select('assignment_id')
      .in('assignment_id', assignmentIds);

    html += `
      <table>
        <thead><tr><th>Предмет</th><th>Группа</th><th>Задание</th><th>Срок сдачи</th><th>Сдано</th></tr></thead>
        <tbody>
          ${assignments.map(a => {
            const count = allSubmissions ? allSubmissions.filter(s => s.assignment_id === a.id).length : 0;
            const badgeClass = count > 0 ? 'success' : 'warning';
            return `
            <tr style="cursor: pointer;" onclick="viewAssignmentSubmissions(${a.id})">
              <td>${a.subjects?.name || 'Неизвестно'}</td>
              <td>${a.groups?.name || 'Неизвестно'}</td>
              <td>${a.title}</td>
              <td>${new Date(a.due_date).toLocaleDateString('ru-RU')}</td>
              <td><span class="badge ${badgeClass}">${count}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }
  
  document.getElementById('content').innerHTML = html;
}

// Teacher Materials Module
async function showTeacherMaterials() {
  currentView = 'materials';
  updateNavigation();
  
  const { data: materials } = await clientSupabase
    .from('materials')
    .select('*, subjects(name)')
    .eq('teacher_id', currentUser.id)
    .order('created_at', { ascending: false });

  let html = '<h2>📚 МОИ МАТЕРИАЛЫ</h2>';
  html += '<div class="btn-group"><button onclick="uploadMaterial()">➕ Загрузить материал</button></div>';
  
  if (!materials || materials.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Вы еще не загрузили ни одного материала</p>';
  } else {
    html += `
      <table>
        <thead><tr><th>Предмет</th><th>Название</th><th>Тип</th><th>Дата</th><th>Действия</th></tr></thead>
        <tbody>
          ${materials.map(m => `
            <tr>
              <td>${m.subjects?.name || 'Неизвестно'}</td>
              <td>${m.title}</td>
              <td><span class="badge success">${m.file_type || 'FILE'}</span></td>
              <td>${new Date(m.created_at).toLocaleDateString('ru-RU')}</td>
              <td><button class="small" onclick="deleteMaterial(${m.id})">Удалить</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  document.getElementById('content').innerHTML = html;
}

// Admin Users Module
async function showUsers() {
  currentView = 'users';
  updateNavigation();
  
  const { data: users } = await clientSupabase.from('users').select('*').order('role');

  let html = '<h2>👥 УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</h2>';
  html += '<div class="btn-group"><button onclick="createUser()">➕ Создать пользователя</button></div>';
  
  html += `
    <table>
      <thead><tr><th>ФИО</th><th>Логин</th><th>Email</th><th>Роль</th><th>Действия</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${u.full_name}</td>
            <td>${u.username}</td>
            <td>${u.email || '-'}</td>
            <td><span class="badge ${u.role === 'admin' ? 'danger' : u.role === 'teacher' ? 'warning' : 'success'}">${u.role}</span></td>
            <td>
              <button class="small" onclick="editUser(${u.id})">Редактировать</button>
              ${u.id !== currentUser.id ? `<button class="small" onclick="deleteUser(${u.id})">Удалить</button>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  document.getElementById('content').innerHTML = html;
}

// Admin Schedule Module
async function showAdminSchedule() {
  currentView = 'schedule';
  updateNavigation();
  
  const { data: groups } = await clientSupabase.from('groups').select('*');

  let html = '<h2>📅 УПРАВЛЕНИЕ РАСПИСАНИЕМ</h2>';
  html += '<div class="btn-group"><button onclick="createSchedule()">➕ Создать занятие</button></div>';
  
  if (!groups || groups.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Сначала создайте группы</p>';
  } else {
    html += '<h3 style="margin-top: 40px; margin-bottom: 20px;">Выберите группу:</h3>';
    html += '<div style="display: flex; gap: 20px; flex-wrap: wrap;">';
    groups.forEach(g => {
      html += `
        <button onclick="viewGroupSchedule(${g.id}, '${g.name}')" class="subject-card" style="padding: 20px 30px;">
          ${g.name}
        </button>
      `;
    });
    html += '</div>';
  }
  
  document.getElementById('content').innerHTML = html;
}

// Admin News Module
async function showAdminNews() {
  currentView = 'news';
  updateNavigation();
  
  const { data: news } = await clientSupabase
    .from('news')
    .select('*, news_categories(name), users(full_name)')
    .order('created_at', { ascending: false });

  let html = '<h2>📰 УПРАВЛЕНИЕ НОВОСТЯМИ</h2>';
  html += '<div class="btn-group"><button onclick="createNews()">➕ Создать новость</button></div>';
  
  if (!news || news.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Новостей пока нет</p>';
  } else {
    html += `
      <table>
        <thead><tr><th>Заголовок</th><th>Категория</th><th>Автор</th><th>Статус</th><th>Действия</th></tr></thead>
        <tbody>
          ${news.map(n => `
            <tr>
              <td>${n.title}</td>
              <td>${n.news_categories?.name || '-'}</td>
              <td>${n.users?.full_name || 'Неизвестно'}</td>
              <td><span class="badge ${n.is_published ? 'success' : 'warning'}">${n.is_published ? 'Опубликовано' : 'Черновик'}</span></td>
              <td>
                <button class="small" onclick="editNews(${n.id})">Редактировать</button>
                <button class="small" onclick="deleteNews(${n.id})">Удалить</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  document.getElementById('content').innerHTML = html;
}

// Analytics Module
async function showAnalytics() {
  currentView = 'analytics';
  updateNavigation();
  
  document.getElementById('content').innerHTML = `
    <h2>📊 АНАЛИТИКА</h2>
    <p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Модуль аналитики в разработке</p>
  `;
}

// Create Assignment (Teacher)
async function createAssignment() {
  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  const { data: groups } = await clientSupabase.from('groups').select('*');

  const html = `
    <h2>➕ СОЗДАТЬ ЗАДАНИЕ</h2>
    <form id="assignment-form" style="max-width: 800px;">
      <input type="text" id="title" placeholder="Название задания" required>
      <textarea id="description" placeholder="Описание задания" rows="5" required></textarea>
      
      <select id="subject_id" required>
        <option value="">Выберите предмет</option>
        ${teacherSubjects.map(ts => `<option value="${ts.subject_id}">${ts.subjects.name}</option>`).join('')}
      </select>
      
      <select id="group_id" required>
        <option value="">Выберите группу</option>
        ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
      </select>
      
      <label style="color: rgba(0,0,0,0.6); font-size: 14px; margin-bottom: 10px; display: block;">Срок сдачи:</label>
      <input type="datetime-local" id="due_date" required>
      
      <input type="number" id="max_grade" placeholder="Максимальный балл" value="100" min="1" max="100" required>
      
      <div class="btn-group">
        <button type="submit">Создать задание</button>
        <button type="button" onclick="showTeacherAssignments()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('assignment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data, error } = await clientSupabase
      .from('assignments')
      .insert({
        teacher_id: currentUser.id,
        subject_id: document.getElementById('subject_id').value,
        group_id: document.getElementById('group_id').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        due_date: document.getElementById('due_date').value,
        max_grade: document.getElementById('max_grade').value
      });
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Задание создано!');
      showTeacherAssignments();
    }
  });
}

// Upload Material (Teacher)
async function uploadMaterial() {
  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  const html = `
    <h2>📤 ЗАГРУЗИТЬ МАТЕРИАЛ</h2>
    <form id="material-form" style="max-width: 800px;">
      <input type="text" id="title" placeholder="Название материала" required>
      <textarea id="description" placeholder="Описание" rows="3"></textarea>
      
      <select id="subject_id" required>
        <option value="">Выберите предмет</option>
        ${teacherSubjects.map(ts => `<option value="${ts.subject_id}">${ts.subjects.name}</option>`).join('')}
      </select>
      
      <input type="text" id="file_url" placeholder="Ссылка на файл (Google Drive, Dropbox и т.д.)" required>
      
      <select id="file_type">
        <option value="PDF">PDF</option>
        <option value="DOC">DOC/DOCX</option>
        <option value="PPT">Презентация</option>
        <option value="VIDEO">Видео</option>
        <option value="OTHER">Другое</option>
      </select>
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_public" checked>
        Доступен всем ученикам
      </label>
      
      <div class="btn-group">
        <button type="submit">Загрузить</button>
        <button type="button" onclick="showTeacherMaterials()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('material-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data, error } = await clientSupabase
      .from('materials')
      .insert({
        teacher_id: currentUser.id,
        subject_id: document.getElementById('subject_id').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        file_url: document.getElementById('file_url').value,
        file_type: document.getElementById('file_type').value,
        is_public: document.getElementById('is_public').checked
      });
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Материал загружен!');
      showTeacherMaterials();
    }
  });
}

// Delete Material
async function deleteMaterial(id) {
  if (!confirm('Удалить материал?')) return;
  
  const { error } = await clientSupabase
    .from('materials')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('✅ Материал удален!');
    showTeacherMaterials();
  }
}

// Create User (Admin)
async function createUser() {
  const { data: groups } = await clientSupabase.from('groups').select('*');

  const html = `
    <h2>➕ СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ</h2>
    <form id="user-form" style="max-width: 800px;">
      <input type="text" id="full_name" placeholder="ФИО" required>
      <input type="text" id="username" placeholder="Логин" required>
      <input type="password" id="password" placeholder="Пароль" required>
      <input type="email" id="email" placeholder="Email">
      <input type="tel" id="phone" placeholder="Телефон">
      
      <select id="role" required onchange="toggleGroupSelect()">
        <option value="">Выберите роль</option>
        <option value="admin">Администратор</option>
        <option value="teacher">Учитель</option>
        <option value="student">Ученик</option>
      </select>
      
      <select id="group_id" style="display: none;">
        <option value="">Выберите группу</option>
        ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
      </select>
      
      <div class="btn-group">
        <button type="submit">Создать</button>
        <button type="button" onclick="showUsers()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  window.toggleGroupSelect = function() {
    const role = document.getElementById('role').value;
    const groupSelect = document.getElementById('group_id');
    groupSelect.style.display = role === 'student' ? 'block' : 'none';
  };
  
  document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const role = document.getElementById('role').value;
    const userData = {
      full_name: document.getElementById('full_name').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      role: role,
      group_id: role === 'student' ? document.getElementById('group_id').value : null
    };
    
    const { data, error } = await clientSupabase
      .from('users')
      .insert(userData);
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Пользователь создан!');
      showUsers();
    }
  });
}

// Edit User (Admin)
async function editUser(id) {
  const { data: user } = await clientSupabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  const { data: groups } = await clientSupabase.from('groups').select('*');

  const html = `
    <h2>✏️ РЕДАКТИРОВАТЬ ПОЛЬЗОВАТЕЛЯ</h2>
    <form id="edit-user-form" style="max-width: 800px;">
      <input type="text" id="full_name" placeholder="ФИО" value="${user.full_name}" required>
      <input type="text" id="username" placeholder="Логин" value="${user.username}" required>
      <input type="email" id="email" placeholder="Email" value="${user.email || ''}">
      <input type="tel" id="phone" placeholder="Телефон" value="${user.phone || ''}">
      
      <select id="role" required onchange="toggleGroupSelect()">
        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
        <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Учитель</option>
        <option value="student" ${user.role === 'student' ? 'selected' : ''}>Ученик</option>
      </select>
      
      <select id="group_id" style="display: ${user.role === 'student' ? 'block' : 'none'};">
        <option value="">Выберите группу</option>
        ${groups.map(g => `<option value="${g.id}" ${user.group_id == g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
      </select>
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_active" ${user.is_active ? 'checked' : ''}>
        Активен
      </label>
      
      <div class="btn-group">
        <button type="submit">Сохранить</button>
        <button type="button" onclick="showUsers()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  window.toggleGroupSelect = function() {
    const role = document.getElementById('role').value;
    const groupSelect = document.getElementById('group_id');
    groupSelect.style.display = role === 'student' ? 'block' : 'none';
  };
  
  document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const role = document.getElementById('role').value;
    const userData = {
      full_name: document.getElementById('full_name').value,
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      role: role,
      group_id: role === 'student' ? document.getElementById('group_id').value : null,
      is_active: document.getElementById('is_active').checked
    };
    
    const { data, error } = await clientSupabase
      .from('users')
      .update(userData)
      .eq('id', id);
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Пользователь обновлен!');
      showUsers();
    }
  });
}

// Delete User (Admin)
async function deleteUser(id) {
  if (!confirm('Удалить пользователя? Это действие нельзя отменить.')) return;
  
  const { error } = await clientSupabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('✅ Пользователь удален!');
    showUsers();
  }
}

// Create Schedule (Admin)
async function createSchedule() {
  const { data: groups } = await clientSupabase.from('groups').select('*');
  const { data: subjects } = await clientSupabase.from('subjects').select('*');
  const { data: teachers } = await clientSupabase.from('users').select('*').eq('role', 'teacher');

  const html = `
    <h2>➕ СОЗДАТЬ ЗАНЯТИЕ</h2>
    <form id="schedule-form" style="max-width: 800px;">
      <select id="group_id" required>
        <option value="">Выберите группу</option>
        ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
      </select>
      
      <select id="subject_id" required>
        <option value="">Выберите предмет</option>
        ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
      
      <select id="teacher_id" required>
        <option value="">Выберите учителя</option>
        ${teachers.map(t => `<option value="${t.id}">${t.full_name}</option>`).join('')}
      </select>
      
      <select id="day_of_week" required>
        <option value="">Выберите день недели</option>
        <option value="1">Понедельник</option>
        <option value="2">Вторник</option>
        <option value="3">Среда</option>
        <option value="4">Четверг</option>
        <option value="5">Пятница</option>
        <option value="6">Суббота</option>
      </select>
      
      <label style="color: rgba(0,0,0,0.6); font-size: 14px; margin-bottom: 10px; display: block;">Время начала:</label>
      <input type="time" id="start_time" required>
      
      <label style="color: rgba(0,0,0,0.6); font-size: 14px; margin-bottom: 10px; display: block;">Время окончания:</label>
      <input type="time" id="end_time" required>
      
      <input type="text" id="room_number" placeholder="Номер кабинета">
      
      <div class="btn-group">
        <button type="submit">Создать</button>
        <button type="button" onclick="showAdminSchedule()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('schedule-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { data, error } = await clientSupabase
      .from('schedules')
      .insert({
        group_id: document.getElementById('group_id').value,
        subject_id: document.getElementById('subject_id').value,
        teacher_id: document.getElementById('teacher_id').value,
        day_of_week: document.getElementById('day_of_week').value,
        start_time: document.getElementById('start_time').value,
        end_time: document.getElementById('end_time').value,
        room_number: document.getElementById('room_number').value
      });
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Занятие создано!');
      showAdminSchedule();
    }
  });
}

// View Group Schedule (Admin)
async function viewGroupSchedule(groupId, groupName) {
  currentGroupId = groupId;
  currentGroupName = groupName;
  const { data: schedules } = await clientSupabase
    .from('schedules')
    .select('*, subjects(name), users(full_name)')
    .eq('group_id', groupId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  let html = `<h2>📅 РАСПИСАНИЕ ГРУППЫ ${groupName}</h2>`;
  html += '<div class="btn-group"><button onclick="showAdminSchedule()">← Назад</button><button onclick="createSchedule()">➕ Добавить занятие</button></div>';
  
  if (!schedules || schedules.length === 0) {
    html += '<p style="color: rgba(0,0,0,0.5); text-align: center; margin-top: 40px;">Расписание пока не создано</p>';
  } else {
    days.forEach((day, index) => {
      const daySchedule = schedules.filter(s => s.day_of_week === index + 1);
      if (daySchedule.length > 0) {
        html += `
          <h3 style="margin-top: 40px; margin-bottom: 20px; font-size: 24px; color: rgba(0,0,0,0.8);">${day}</h3>
          <table>
            <thead><tr><th>Время</th><th>Предмет</th><th>Учитель</th><th>Кабинет</th><th>Действия</th></tr></thead>
            <tbody>
              ${daySchedule.map(s => `
                <tr>
                  <td>${s.start_time.substring(0,5)} - ${s.end_time.substring(0,5)}</td>
                  <td>${s.subjects?.name || 'Неизвестно'}</td>
                  <td>${s.users?.full_name || 'Неизвестно'}</td>
                  <td>${s.room_number || '-'}</td>
                  <td><button class="small" onclick="deleteSchedule(${s.id})">Удалить</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    });
  }
  
  document.getElementById('content').innerHTML = html;
}

// Delete Schedule
async function deleteSchedule(id) {
  if (!confirm('Удалить занятие?')) return;
  
  const { error } = await clientSupabase
    .from('schedules')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    viewGroupSchedule(currentGroupId, currentGroupName);
  }
}

// Create News (Admin)
async function createNews() {
  const { data: categories } = await clientSupabase.from('news_categories').select('*');

  const html = `
    <h2>➕ СОЗДАТЬ НОВОСТЬ</h2>
    <form id="news-form" style="max-width: 800px;">
      <input type="text" id="title" placeholder="Заголовок новости" required>
      <textarea id="excerpt" placeholder="Краткое описание" rows="2"></textarea>
      <textarea id="content" placeholder="Полный текст новости" rows="8" required></textarea>
      
      <select id="category_id" required>
        <option value="">Выберите категорию</option>
        ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
      
      <input type="url" id="image_url" placeholder="Ссылка на изображение (необязательно)">
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_published" checked>
        Опубликовать сразу
      </label>
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_pinned">
        Закрепить новость
      </label>
      
      <div class="btn-group">
        <button type="submit">Создать</button>
        <button type="button" onclick="showAdminNews()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const slug = title.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const { data, error } = await clientSupabase
      .from('news')
      .insert({
        author_id: currentUser.id,
        category_id: document.getElementById('category_id').value,
        title: title,
        slug: slug + '-' + Date.now(),
        content: document.getElementById('content').value,
        excerpt: document.getElementById('excerpt').value,
        image_url: document.getElementById('image_url').value,
        is_published: document.getElementById('is_published').checked,
        is_pinned: document.getElementById('is_pinned').checked,
        published_at: document.getElementById('is_published').checked ? new Date().toISOString() : null
      });
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Новость создана!');
      showAdminNews();
    }
  });
}

// Edit News (Admin)
async function editNews(id) {
  const { data: newsItem } = await clientSupabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  const { data: categories } = await clientSupabase.from('news_categories').select('*');

  const html = `
    <h2>✏️ РЕДАКТИРОВАТЬ НОВОСТЬ</h2>
    <form id="edit-news-form" style="max-width: 800px;">
      <input type="text" id="title" placeholder="Заголовок новости" value="${newsItem.title}" required>
      <textarea id="excerpt" placeholder="Краткое описание" rows="2">${newsItem.excerpt || ''}</textarea>
      <textarea id="content" placeholder="Полный текст новости" rows="8" required>${newsItem.content}</textarea>
      
      <select id="category_id" required>
        ${categories.map(c => `<option value="${c.id}" ${newsItem.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      
      <input type="url" id="image_url" placeholder="Ссылка на изображение" value="${newsItem.image_url || ''}">
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_published" ${newsItem.is_published ? 'checked' : ''}>
        Опубликовано
      </label>
      
      <label style="display: flex; align-items: center; gap: 10px; color: rgba(0,0,0,0.7);">
        <input type="checkbox" id="is_pinned" ${newsItem.is_pinned ? 'checked' : ''}>
        Закреплено
      </label>
      
      <div class="btn-group">
        <button type="submit">Сохранить</button>
        <button type="button" onclick="showAdminNews()">Отмена</button>
      </div>
    </form>
  `;
  
  document.getElementById('content').innerHTML = html;
  
  document.getElementById('edit-news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const isPublished = document.getElementById('is_published').checked;
    
    const { data, error } = await clientSupabase
      .from('news')
      .update({
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        excerpt: document.getElementById('excerpt').value,
        category_id: document.getElementById('category_id').value,
        image_url: document.getElementById('image_url').value,
        is_published: isPublished,
        is_pinned: document.getElementById('is_pinned').checked,
        published_at: isPublished && !newsItem.published_at ? new Date().toISOString() : newsItem.published_at
      })
      .eq('id', id);
    
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('✅ Новость обновлена!');
      showAdminNews();
    }
  });
}

// Delete News (Admin)
async function deleteNews(id) {
  if (!confirm('Удалить новость?')) return;
  
  const { error } = await clientSupabase
    .from('news')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('✅ Новость удалена!');
    showAdminNews();
  }
}

// Show Assignment Detail (Student)
function showAssignmentDetail(id) {
  alert(`Детали задания ID: ${id} - функция в разработке`);
}

// Teacher Attendance Module
async function showTeacherAttendance() {
  currentView = 'attendance';
  updateNavigation();

  const { data: teacherSubjects } = await clientSupabase
    .from('teacher_subjects')
    .select('*, subjects(*)')
    .eq('teacher_id', currentUser.id);

  const { data: mySchedules } = await clientSupabase
    .from('schedules')
    .select('group_id')
    .eq('teacher_id', currentUser.id);

  const myGroupIds = mySchedules ? [...new Set(mySchedules.map(s => s.group_id))] : [];

  let students = [];
  if (myGroupIds.length > 0) {
    const { data } = await clientSupabase
      .from('users')
      .select('*, groups(name)')
      .eq('role', 'student')
      .in('group_id', myGroupIds)
      .order('full_name');
    students = data || [];
  }

  let html = '<h2>✅ ПОСЕЩАЕМОСТЬ</h2>';
  html += `
    <div class="panel" style="margin-top:24px;">
      <h3 style="font-size:18px; margin-bottom:20px; color:#111;">Отметить посещаемость</h3>
      <form id="attendance-form" style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
        <div style="flex:2; min-width:180px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">УЧЕНИК</label>
          <select id="af-student" required style="margin-bottom:0;">
            <option value="">Выберите ученика</option>
            ${students.map(s => `<option value="${s.id}">${s.full_name} (${s.groups?.name || '-'})</option>`).join('')}
          </select>
        </div>
        <div style="flex:1; min-width:140px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ПРЕДМЕТ</label>
          <select id="af-subject" required style="margin-bottom:0;">
            <option value="">Предмет</option>
            ${(teacherSubjects || []).map(ts => `<option value="${ts.subject_id}">${ts.subjects.name}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1; min-width:120px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">СТАТУС</label>
          <select id="af-status" style="margin-bottom:0;">
            <option value="present">Присутствует</option>
            <option value="absent">Отсутствует</option>
            <option value="late">Опоздал</option>
          </select>
        </div>
        <div style="flex:1; min-width:130px;">
          <label style="font-size:12px; color:#888; display:block; margin-bottom:6px;">ДАТА</label>
          <input type="date" id="af-date" value="${new Date().toISOString().split('T')[0]}" required style="margin-bottom:0;">
        </div>
        <div>
          <button type="submit" style="width:auto; padding:14px 24px; min-height:unset; margin:0;">Сохранить</button>
        </div>
      </form>
      <div id="af-msg" style="margin-top:12px; font-size:13px;"></div>
    </div>
  `;

  document.getElementById('content').innerHTML = html;

  document.getElementById('attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('af-msg');
    const { error } = await clientSupabase.from('attendance').upsert({
      student_id: parseInt(document.getElementById('af-student').value),
      subject_id: parseInt(document.getElementById('af-subject').value),
      date: document.getElementById('af-date').value,
      status: document.getElementById('af-status').value
    }, { onConflict: 'student_id,subject_id,date' });

    if (error) {
      msg.style.color = '#dc143c';
      msg.textContent = 'Ошибка: ' + error.message;
    } else {
      msg.style.color = '#00a846';
      msg.textContent = '✅ Посещаемость сохранена!';
      setTimeout(() => { msg.textContent = ''; }, 2000);
    }
  });
}

// View Assignment Submissions (Teacher)
function viewAssignmentSubmissions(id) {
  alert(`Просмотр сданных заданий ID: ${id} - функция в разработке`);
}

// Initialize on load
window.addEventListener('load', initSupabase);
