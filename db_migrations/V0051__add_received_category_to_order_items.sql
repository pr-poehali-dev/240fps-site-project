ALTER TABLE t_p288352_240fps_site_project.order_items ADD COLUMN IF NOT EXISTS received BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.order_items ADD COLUMN IF NOT EXISTS category TEXT;
