ALTER TABLE t_p288352_240fps_site_project.components_case ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_motherboard ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_cpu ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_gpu ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_ram ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_ssd ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_psu ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE t_p288352_240fps_site_project.components_cooler ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
UPDATE t_p288352_240fps_site_project.components_case SET active = false WHERE id IN (3, 4);
