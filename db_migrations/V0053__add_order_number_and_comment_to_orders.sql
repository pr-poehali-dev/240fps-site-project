ALTER TABLE t_p288352_240fps_site_project.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE t_p288352_240fps_site_project.orders ADD COLUMN IF NOT EXISTS comment TEXT NOT NULL DEFAULT '';
