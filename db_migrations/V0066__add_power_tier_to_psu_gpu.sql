ALTER TABLE t_p288352_240fps_site_project.components_psu ADD COLUMN IF NOT EXISTS power_tier INTEGER;
ALTER TABLE t_p288352_240fps_site_project.components_gpu ADD COLUMN IF NOT EXISTS min_power_tier INTEGER;

UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 1 WHERE id = 1;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 2 WHERE id = 2;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 3 WHERE id = 3;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 4 WHERE id = 4;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 5 WHERE id = 5;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 6 WHERE id = 6;
UPDATE t_p288352_240fps_site_project.components_psu SET power_tier = 7 WHERE id = 7;

UPDATE t_p288352_240fps_site_project.components_gpu SET min_power_tier = 1 WHERE id IN (9, 1);
UPDATE t_p288352_240fps_site_project.components_gpu SET min_power_tier = 2 WHERE id IN (2, 4, 3);
UPDATE t_p288352_240fps_site_project.components_gpu SET min_power_tier = 3 WHERE id = 5;
UPDATE t_p288352_240fps_site_project.components_gpu SET min_power_tier = 5 WHERE id IN (6, 8);
UPDATE t_p288352_240fps_site_project.components_gpu SET min_power_tier = 6 WHERE id = 7;
