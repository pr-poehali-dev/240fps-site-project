ALTER TABLE t_p288352_240fps_site_project.components_cpu ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_gpu ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_motherboard ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_ram ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_ssd ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_psu ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_case ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE t_p288352_240fps_site_project.components_cooler ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT false;
