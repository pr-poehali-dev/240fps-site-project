-- Материнские платы: обновляем названия и цены
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='A520M', price=6000 WHERE id=1;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='A620M', price=6500 WHERE id=2;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B550M', price=8000 WHERE id=3;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B650M WiFi', price=11000 WHERE id=4;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B850M WiFi', price=11000 WHERE id=5;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B850M FORCE WIFI6E', price=12000 WHERE id=6;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B850M Gaming X AX', price=16000 WHERE id=7;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='B860M', price=10000 WHERE id=8;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='H610M', price=5500 WHERE id=9;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='MSI B850 Gaming Plus WiFi6e', price=15000 WHERE id=10;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='MAG B860 TOMAHAWK WIFI', price=19000 WHERE id=11;
UPDATE t_p288352_240fps_site_project.components_motherboard SET name='Z890M GAMING X', price=19000 WHERE id=12;
INSERT INTO t_p288352_240fps_site_project.components_motherboard (name, price, in_stock) VALUES ('Z790 GAMING PLUS WIFI', 22000, false);
INSERT INTO t_p288352_240fps_site_project.components_motherboard (name, price, in_stock) VALUES ('B660m D4', 10000, false);
INSERT INTO t_p288352_240fps_site_project.components_motherboard (name, price, in_stock) VALUES ('B760m D4', 10000, false);
