-- ПОЛНАЯ СХЕМА БД ДЛЯ ВЕБА-ПОРТАЛА КОЛЛЕДЖА
-- Выполните этот SQL в Supabase SQL Editor

-- Удаление старых таблиц
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS final_grades CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS teacher_subjects CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Таблица пользователей
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  group_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица групп
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица предметов
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Связь учителей и предметов
CREATE TABLE teacher_subjects (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, subject_id)
);


-- Связь студентов и групп
CREATE TABLE student_groups (
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, group_id)
);

-- Таблица оценок
CREATE TABLE grades (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id BIGINT REFERENCES users(id),
  grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 100),
  gpa DECIMAL(3,2) NOT NULL,
  grade_type TEXT NOT NULL,
  comment TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица итоговых оценок
CREATE TABLE final_grades (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  year INTEGER NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 100),
  gpa DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, quarter, year)
);

-- Таблица посещаемости
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица расписания
CREATE TABLE schedules (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id BIGINT REFERENCES users(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Таблица учебных материалов
CREATE TABLE materials (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица заданий
CREATE TABLE assignments (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id BIGINT REFERENCES users(id),
  group_id BIGINT REFERENCES groups(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_grade INTEGER DEFAULT 100,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица выполненных заданий
CREATE TABLE assignment_submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  submission_url TEXT,
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  grade INTEGER,
  teacher_comment TEXT,
  graded_at TIMESTAMPTZ
);

-- Таблица категорий новостей
CREATE TABLE news_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#dc143c',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица новостей
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT REFERENCES users(id),
  category_id BIGINT REFERENCES news_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Таблица уведомлений
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Вставка тестовых данных
INSERT INTO users (username, password, role, full_name, email) VALUES
  ('admin', 'admin123', 'admin', 'Администратор Системы', 'admin@narxoz.kz'),
  ('teacher', 'teacher123', 'teacher', 'Иванов Иван Иванович', 'teacher@narxoz.kz'),
  ('student', 'student123', 'student', 'Петров Петр Петрович', 'student@narxoz.kz');

INSERT INTO groups (name, year) VALUES
  ('11А', 2026),
  ('11Б', 2026);

INSERT INTO subjects (name, description) VALUES
  ('Математика', 'Алгебра и геометрия'),
  ('Информатика', 'Программирование и ИТ'),
  ('Английский язык', 'Иностранный язык'),
  ('История', 'История Казахстана'),
  ('Физика', 'Физика и астрономия'),
  ('Қазақ тілі', 'Казахский язык');

-- Назначение учителя на предметы
INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6);

-- Добавление ученика в группу
UPDATE users SET group_id = 1 WHERE id = 3;

-- Категории новостей
INSERT INTO news_categories (name, slug, color) VALUES
  ('Объявления', 'announcements', '#dc143c'),
  ('События', 'events', '#2196F3'),
  ('Достижения', 'achievements', '#4CAF50'),
  ('Учеба', 'education', '#FF9800');


-- Включить Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Удаление старых политик
DROP POLICY IF EXISTS "Enable all access for users" ON users;
DROP POLICY IF EXISTS "Enable all access for groups" ON groups;
DROP POLICY IF EXISTS "Enable all access for subjects" ON subjects;
DROP POLICY IF EXISTS "Enable all access for teacher_subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Enable all access for student_groups" ON student_groups;
DROP POLICY IF EXISTS "Enable all access for grades" ON grades;
DROP POLICY IF EXISTS "Enable all access for final_grades" ON final_grades;
DROP POLICY IF EXISTS "Enable all access for attendance" ON attendance;
DROP POLICY IF EXISTS "Enable all access for schedules" ON schedules;
DROP POLICY IF EXISTS "Enable all access for materials" ON materials;
DROP POLICY IF EXISTS "Enable all access for assignments" ON assignments;
DROP POLICY IF EXISTS "Enable all access for assignment_submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Enable all access for news_categories" ON news_categories;
DROP POLICY IF EXISTS "Enable all access for news" ON news;
DROP POLICY IF EXISTS "Enable all access for notifications" ON notifications;
DROP POLICY IF EXISTS "Enable all access for messages" ON messages;

-- Создание политик (разрешаем все для упрощения)
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all access for groups" ON groups FOR ALL USING (true);
CREATE POLICY "Enable all access for subjects" ON subjects FOR ALL USING (true);
CREATE POLICY "Enable all access for teacher_subjects" ON teacher_subjects FOR ALL USING (true);
CREATE POLICY "Enable all access for student_groups" ON student_groups FOR ALL USING (true);
CREATE POLICY "Enable all access for grades" ON grades FOR ALL USING (true);
CREATE POLICY "Enable all access for final_grades" ON final_grades FOR ALL USING (true);
CREATE POLICY "Enable all access for attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Enable all access for schedules" ON schedules FOR ALL USING (true);
CREATE POLICY "Enable all access for materials" ON materials FOR ALL USING (true);
CREATE POLICY "Enable all access for assignments" ON assignments FOR ALL USING (true);
CREATE POLICY "Enable all access for assignment_submissions" ON assignment_submissions FOR ALL USING (true);
CREATE POLICY "Enable all access for news_categories" ON news_categories FOR ALL USING (true);
CREATE POLICY "Enable all access for news" ON news FOR ALL USING (true);
CREATE POLICY "Enable all access for notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Enable all access for messages" ON messages FOR ALL USING (true);

-- Готово!
