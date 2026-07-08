ALTER TABLE t_p288352_240fps_site_project.components_case ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Деактивируем старые заглушки-аквариумы
UPDATE t_p288352_240fps_site_project.components_case SET active = false WHERE id IN (1, 2, 3, 4);
