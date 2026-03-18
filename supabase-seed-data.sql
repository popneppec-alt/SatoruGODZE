-- ============================================
-- SEED DATA: Группы ПО-231 и ПО-336
-- Выполните в Supabase SQL Editor
-- ============================================

-- Группы
INSERT INTO groups (id, name, year) VALUES
  (10, 'ПО-231', 2026),
  (11, 'ПО-336', 2026)
ON CONFLICT (id) DO NOTHING;

-- Преподаватели (id: 10-13)
INSERT INTO users (id, username, password, role, full_name, email, is_active) VALUES
  (10, 'setkali',    'teacher123', 'teacher', 'Сейткали Асхат Маратович',   'setkali@narxoz.kz',   true),
  (11, 'kim',        'teacher123', 'teacher', 'Ким Виктор Сергеевич',        'kim@narxoz.kz',       true),
  (12, 'baijanov',   'teacher123', 'teacher', 'Байжанов Ерлан Тимурович',    'baijanov@narxoz.kz',  true),
  (13, 'omarova',    'teacher123', 'teacher', 'Омарова Зарина Кайратовна',   'omarova@narxoz.kz',   true)
ON CONFLICT (id) DO NOTHING;

-- Студенты ПО-231 (id: 20-24), group_id = 10
INSERT INTO users (id, username, password, role, full_name, email, group_id, is_active) VALUES
  (20, 'asanov',      'student123', 'student', 'Асанов Данияр Серикович',       'asanov@narxoz.kz',      10, true),
  (21, 'zhumabekova', 'student123', 'student', 'Жумабекова Айгерим Нурланovna', 'zhumabekova@narxoz.kz', 10, true),
  (22, 'petrov',      'student123', 'student', 'Петров Никита Андреевич',        'petrov@narxoz.kz',      10, true),
  (23, 'nurlanova',   'student123', 'student', 'Нурланова Дина Асхатовна',       'nurlanova@narxoz.kz',   10, true),
  (24, 'sarsenov',    'student123', 'student', 'Сарсенов Арман Болатович',       'sarsenov@narxoz.kz',    10, true)
ON CONFLICT (id) DO NOTHING;

-- Студенты ПО-336 (id: 25-29), group_id = 11
INSERT INTO users (id, username, password, role, full_name, email, group_id, is_active) VALUES
  (25, 'akhmetova',   'student123', 'student', 'Ахметова Камила Дауреновна',     'akhmetova@narxoz.kz',   11, true),
  (26, 'isaev',       'student123', 'student', 'Исаев Тимур Русланович',          'isaev@narxoz.kz',       11, true),
  (27, 'kozlova',     'student123', 'student', 'Козлова Валерия Игоревна',        'kozlova@narxoz.kz',     11, true),
  (28, 'abdrakhmanov','student123', 'student', 'Абдрахманов Руслан Маратович',    'abdrakhmanov@narxoz.kz',11, true),
  (29, 'tleubaeva',   'student123', 'student', 'Тлеубаева Жанар Сериковна',       'tleubaeva@narxoz.kz',   11, true)
ON CONFLICT (id) DO NOTHING;

-- Предметы ПО-231 (id: 10-13)
INSERT INTO subjects (id, name, description) VALUES
  (10, 'Веб-разработка',      'HTML, CSS, JavaScript, адаптивная верстка'),
  (11, 'Базы данных',         'SQL, проектирование реляционных БД, PostgreSQL'),
  (12, 'Python-разработка',   'Python, Flask, REST API, ООП'),
  (13, 'Компьютерные сети',   'Сетевые протоколы, маршрутизация, Cisco')
ON CONFLICT (id) DO NOTHING;

-- Предметы ПО-336 (id: 14-17)
INSERT INTO subjects (id, name, description) VALUES
  (14, 'Мобильная разработка',              'Flutter, Dart, кроссплатформенные приложения'),
  (15, 'Алгоритмы и структуры данных',      'Сортировки, деревья, графы, сложность алгоритмов'),
  (16, 'DevOps и CI/CD',                    'Docker, GitHub Actions, деплой, автоматизация'),
  (17, 'Кибербезопасность',                 'OWASP, пентест, анализ уязвимостей, защита данных')
ON CONFLICT (id) DO NOTHING;

-- Связь учителей с предметами
INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
  (10, 10), -- Сейткали → Веб-разработка
  (11, 11), -- Ким → Базы данных
  (12, 12), -- Байжанов → Python
  (13, 13), -- Омарова → Компьютерные сети
  (12, 14), -- Байжанов → Мобильная разработка
  (11, 15), -- Ким → Алгоритмы
  (10, 16), -- Сейткали → DevOps
  (13, 17)  -- Омарова → Кибербезопасность
ON CONFLICT DO NOTHING;

-- Задания для ПО-231 (group_id = 10)
INSERT INTO assignments (id, subject_id, teacher_id, group_id, title, description, due_date, max_grade) VALUES
  (10, 10, 10, 10, 'Верстка адаптивного лендинга',
      'Сверстать адаптивный лендинг колледжа с использованием Flexbox и Grid. Обязательна мобильная версия.',
      NOW() + INTERVAL '14 days', 100),
  (11, 11, 11, 10, 'Проектирование схемы БД интернет-магазина',
      'Спроектировать реляционную схему БД для интернет-магазина: товары, заказы, пользователи, корзина.',
      NOW() + INTERVAL '10 days', 100),
  (12, 12, 12, 10, 'Разработка REST API на Flask',
      'Реализовать CRUD API для управления задачами (To-Do) с авторизацией через JWT.',
      NOW() + INTERVAL '21 days', 100),
  (13, 13, 13, 10, 'Настройка маршрутизатора Cisco',
      'Настроить статическую маршрутизацию между тремя подсетями в Cisco Packet Tracer.',
      NOW() + INTERVAL '7 days', 100)
ON CONFLICT (id) DO NOTHING;

-- Задания для ПО-336 (group_id = 11)
INSERT INTO assignments (id, subject_id, teacher_id, group_id, title, description, due_date, max_grade) VALUES
  (14, 14, 12, 11, 'Разработка To-Do приложения на Flutter',
      'Создать мобильное приложение To-Do с локальным хранилищем (Hive) и анимациями.',
      NOW() + INTERVAL '14 days', 100),
  (15, 15, 11, 11, 'Реализация сортировки и бинарного поиска',
      'Реализовать на Python: пузырьковую, быструю сортировку и бинарный поиск. Сравнить производительность.',
      NOW() + INTERVAL '10 days', 100),
  (16, 16, 10, 11, 'Настройка GitHub Actions pipeline',
      'Настроить CI/CD pipeline: автотесты, линтер, деплой на Vercel при push в main.',
      NOW() + INTERVAL '21 days', 100),
  (17, 17, 13, 11, 'Анализ уязвимостей OWASP Top 10',
      'Провести анализ тестового веб-приложения DVWA, найти и задокументировать уязвимости из OWASP Top 10.',
      NOW() + INTERVAL '18 days', 100)
ON CONFLICT (id) DO NOTHING;

-- Оценки студентов ПО-231
INSERT INTO grades (student_id, subject_id, teacher_id, grade, gpa, grade_type, date) VALUES
  -- Асанов
  (20, 10, 10, 85, 3.50, 'Практика',   CURRENT_DATE - 5),
  (20, 11, 11, 78, 3.00, 'Контрольная',CURRENT_DATE - 3),
  (20, 12, 12, 90, 4.00, 'Лабораторная',CURRENT_DATE - 1),
  -- Жумабекова
  (21, 10, 10, 92, 4.00, 'Практика',   CURRENT_DATE - 6),
  (21, 11, 11, 88, 3.50, 'Контрольная',CURRENT_DATE - 4),
  (21, 13, 13, 75, 3.00, 'Лабораторная',CURRENT_DATE - 2),
  -- Петров
  (22, 11, 11, 70, 2.50, 'Контрольная',CURRENT_DATE - 5),
  (22, 13, 13, 82, 3.50, 'Практика',   CURRENT_DATE - 3),
  (22, 12, 12, 77, 3.00, 'Лабораторная',CURRENT_DATE - 1),
  -- Нурланова
  (23, 10, 10, 95, 4.00, 'Практика',   CURRENT_DATE - 7),
  (23, 12, 12, 88, 3.50, 'Лабораторная',CURRENT_DATE - 2),
  (23, 13, 13, 80, 3.00, 'Контрольная',CURRENT_DATE - 1),
  -- Сарсенов
  (24, 12, 12, 65, 2.00, 'Лабораторная',CURRENT_DATE - 4),
  (24, 13, 13, 72, 2.50, 'Практика',   CURRENT_DATE - 2),
  (24, 11, 11, 68, 2.00, 'Контрольная',CURRENT_DATE - 1);

-- Оценки студентов ПО-336
INSERT INTO grades (student_id, subject_id, teacher_id, grade, gpa, grade_type, date) VALUES
  -- Ахметова
  (25, 14, 12, 94, 4.00, 'Практика',    CURRENT_DATE - 5),
  (25, 16, 10, 89, 3.50, 'Лабораторная',CURRENT_DATE - 3),
  (25, 17, 13, 91, 4.00, 'Контрольная', CURRENT_DATE - 1),
  -- Исаев
  (26, 14, 12, 80, 3.00, 'Практика',    CURRENT_DATE - 6),
  (26, 15, 11, 85, 3.50, 'Контрольная', CURRENT_DATE - 4),
  (26, 17, 13, 78, 3.00, 'Лабораторная',CURRENT_DATE - 2),
  -- Козлова
  (27, 15, 11, 92, 4.00, 'Контрольная', CURRENT_DATE - 5),
  (27, 16, 10, 87, 3.50, 'Лабораторная',CURRENT_DATE - 3),
  (27, 17, 13, 83, 3.50, 'Практика',    CURRENT_DATE - 1),
  -- Абдрахманов
  (28, 14, 12, 76, 3.00, 'Практика',    CURRENT_DATE - 7),
  (28, 15, 11, 70, 2.50, 'Контрольная', CURRENT_DATE - 2),
  (28, 16, 10, 82, 3.50, 'Лабораторная',CURRENT_DATE - 1),
  -- Тлеубаева
  (29, 15, 11, 88, 3.50, 'Контрольная', CURRENT_DATE - 4),
  (29, 16, 10, 93, 4.00, 'Лабораторная',CURRENT_DATE - 2),
  (29, 17, 13, 86, 3.50, 'Практика',    CURRENT_DATE - 1);

-- Итоговые оценки
INSERT INTO final_grades (student_id, subject_id, quarter, year, grade, gpa) VALUES
  (20, 10, 1, 2026, 85, 3.50), (20, 11, 1, 2026, 78, 3.00),
  (21, 10, 1, 2026, 92, 4.00), (21, 11, 1, 2026, 88, 3.50),
  (22, 11, 1, 2026, 70, 2.50), (22, 13, 1, 2026, 82, 3.50),
  (23, 10, 1, 2026, 95, 4.00), (23, 12, 1, 2026, 88, 3.50),
  (24, 12, 1, 2026, 65, 2.00), (24, 13, 1, 2026, 72, 2.50),
  (25, 14, 1, 2026, 94, 4.00), (25, 16, 1, 2026, 89, 3.50),
  (26, 14, 1, 2026, 80, 3.00), (26, 15, 1, 2026, 85, 3.50),
  (27, 15, 1, 2026, 92, 4.00), (27, 16, 1, 2026, 87, 3.50),
  (28, 14, 1, 2026, 76, 3.00), (28, 15, 1, 2026, 70, 2.50),
  (29, 15, 1, 2026, 88, 3.50), (29, 16, 1, 2026, 93, 4.00)
ON CONFLICT DO NOTHING;

-- Посещаемость (последние 2 недели)
INSERT INTO attendance (student_id, subject_id, date, status) VALUES
  (20,10,CURRENT_DATE-10,'present'),(20,10,CURRENT_DATE-3,'present'),
  (20,11,CURRENT_DATE-9,'present'), (20,11,CURRENT_DATE-2,'absent'),
  (21,10,CURRENT_DATE-10,'present'),(21,10,CURRENT_DATE-3,'present'),
  (21,13,CURRENT_DATE-8,'present'), (21,13,CURRENT_DATE-1,'present'),
  (22,11,CURRENT_DATE-9,'absent'),  (22,11,CURRENT_DATE-2,'present'),
  (22,13,CURRENT_DATE-8,'present'), (22,13,CURRENT_DATE-1,'present'),
  (23,10,CURRENT_DATE-10,'present'),(23,10,CURRENT_DATE-3,'present'),
  (23,12,CURRENT_DATE-7,'present'), (23,12,CURRENT_DATE-1,'present'),
  (24,12,CURRENT_DATE-7,'absent'),  (24,12,CURRENT_DATE-1,'present'),
  (24,13,CURRENT_DATE-8,'absent'),  (24,13,CURRENT_DATE-1,'present'),
  (25,14,CURRENT_DATE-10,'present'),(25,14,CURRENT_DATE-3,'present'),
  (25,16,CURRENT_DATE-6,'present'), (25,16,CURRENT_DATE-1,'present'),
  (26,14,CURRENT_DATE-10,'present'),(26,14,CURRENT_DATE-3,'absent'),
  (26,15,CURRENT_DATE-5,'present'), (26,15,CURRENT_DATE-1,'present'),
  (27,15,CURRENT_DATE-5,'present'), (27,15,CURRENT_DATE-1,'present'),
  (27,16,CURRENT_DATE-6,'present'), (27,16,CURRENT_DATE-1,'present'),
  (28,14,CURRENT_DATE-10,'present'),(28,14,CURRENT_DATE-3,'present'),
  (28,15,CURRENT_DATE-5,'absent'),  (28,15,CURRENT_DATE-1,'present'),
  (29,15,CURRENT_DATE-5,'present'), (29,15,CURRENT_DATE-1,'present'),
  (29,16,CURRENT_DATE-6,'present'), (29,16,CURRENT_DATE-1,'present');

-- Расписание ПО-231 (group_id = 10)
INSERT INTO schedules (group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number) VALUES
  (10, 10, 10, 1, '08:00', '09:30', '304'),
  (10, 11, 11, 2, '09:45', '11:15', '304'),
  (10, 12, 12, 3, '08:00', '09:30', '304'),
  (10, 13, 13, 4, '09:45', '11:15', '304'),
  (10, 10, 10, 5, '08:00', '09:30', '304');

-- Расписание ПО-336 (group_id = 11)
INSERT INTO schedules (group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number) VALUES
  (11, 14, 12, 1, '11:30', '13:00', '412'),
  (11, 15, 11, 2, '11:30', '13:00', '412'),
  (11, 16, 10, 3, '11:30', '13:00', '412'),
  (11, 17, 13, 4, '11:30', '13:00', '412'),
  (11, 14, 12, 5, '11:30', '13:00', '412');

-- ============================================
-- ГОТОВО! Данные для ПО-231 и ПО-336 добавлены
-- ============================================
