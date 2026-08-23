ALTER TABLE t_p288352_240fps_site_project.components_cpu ADD COLUMN IF NOT EXISTS socket VARCHAR(20);
ALTER TABLE t_p288352_240fps_site_project.components_motherboard ADD COLUMN IF NOT EXISTS socket VARCHAR(20);
ALTER TABLE t_p288352_240fps_site_project.components_ram ADD COLUMN IF NOT EXISTS ram_type VARCHAR(10);

UPDATE t_p288352_240fps_site_project.components_cpu SET socket = 'lga1700' WHERE id IN (1,2,3,4,18);
UPDATE t_p288352_240fps_site_project.components_cpu SET socket = 'lga1851' WHERE id IN (11,12,14);
UPDATE t_p288352_240fps_site_project.components_cpu SET socket = 'am4' WHERE id IN (5,6,13,15,19);
UPDATE t_p288352_240fps_site_project.components_cpu SET socket = 'am5' WHERE id IN (7,8,9,10,16,17,20);

UPDATE t_p288352_240fps_site_project.components_motherboard SET socket = 'lga1700' WHERE id IN (9,13,14,15);
UPDATE t_p288352_240fps_site_project.components_motherboard SET socket = 'lga1851' WHERE id IN (8,12);
UPDATE t_p288352_240fps_site_project.components_motherboard SET socket = 'am4' WHERE id IN (1,3);
UPDATE t_p288352_240fps_site_project.components_motherboard SET socket = 'am5' WHERE id IN (2,4,5,6,7,10,16);

UPDATE t_p288352_240fps_site_project.components_ram SET ram_type = 'ddr4' WHERE id IN (1,2);
UPDATE t_p288352_240fps_site_project.components_ram SET ram_type = 'ddr5' WHERE id IN (4,6,7,9);
