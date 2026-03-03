-- ПРОСТАЯ ВЕРСИЯ SQL СХЕМЫ
-- Копируйте и выполняйте по частям в Supabase SQL Editor

-- ============================================
-- ЧАСТЬ 1: Удаление старых таблиц (если есть)
-- ============================================
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS final_grades CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- ЧАСТЬ 2: Создание таблиц
-- ============================================yt hf,jnftnm

-- Таблица пользователей
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица предметов
CREATE TABLE subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица групп
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  grade INTEGER NOT NULL,
  gpa DECIMAL(3,2) NOT NULL,
  grade_type TEXT NOT NULL,
  date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица итоговых оценок
CREATE TABLE final_grades (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL,
  grade INTEGER NOT NULL,
  gpa DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, quarter)
);

-- Таблица посещаемости
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ЧАСТЬ 3: Вставка тестовых данных
-- ============================================

INSERT INTO users (username, password, role, full_name) VALUES
  ('admin', 'admin123', 'admin', 'Администратор Системы'),
  ('teacher', 'teacher123', 'teacher', 'Иванов Иван Иванович'),
  ('student', 'student123', 'student', 'Петров Петр Петрович');

INSERT INTO subjects (name, teacher_id) VALUES
  ('Математика', 2),
  ('Информатика', 2),
  ('Английский язык', 2),
  ('История', 2),
  ('Физика', 2),
  ('Қазақ тілі', 2);

INSERT INTO groups (name) VALUES
  ('11А'),
  ('11Б');

-- ============================================
-- ЧАСТЬ 4: Настройка Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Enable all access for users" ON users;
DROP POLICY IF EXISTS "Enable all access for subjects" ON subjects;
DROP POLICY IF EXISTS "Enable all access for groups" ON groups;
DROP POLICY IF EXISTS "Enable all access for student_groups" ON student_groups;
DROP POLICY IF EXISTS "Enable all access for grades" ON grades;
DROP POLICY IF EXISTS "Enable all access for final_grades" ON final_grades;
DROP POLICY IF EXISTS "Enable all access for attendance" ON attendance;

-- Создаем новые политики (разрешаем все операции)
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all access for subjects" ON subjects FOR ALL USING (true);
CREATE POLICY "Enable all access for groups" ON groups FOR ALL USING (true);
CREATE POLICY "Enable all access for student_groups" ON student_groups FOR ALL USING (true);
CREATE POLICY "Enable all access for grades" ON grades FOR ALL USING (true);
CREATE POLICY "Enable all access for final_grades" ON final_grades FOR ALL USING (true);
CREATE POLICY "Enable all access for attendance" ON attendance FOR ALL USING (true);

-- ============================================
-- ГОТОВО! Проверьте что все таблицы созданы
-- ============================================
