-- Процессоры: обновляем названия и цены, добавляем новые
UPDATE t_p288352_240fps_site_project.components_cpu SET name='i5 12400F', price=12000 WHERE id=1;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='i5 14400F', price=16000 WHERE id=2;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='i5 14600KF', price=22000 WHERE id=3;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='i7 14700KF', price=32000 WHERE id=4;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R5 5500', price=8000 WHERE id=5;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R5 5600', price=11000 WHERE id=6;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R5 7500F', price=10000 WHERE id=7;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R7 7700', price=16000 WHERE id=8;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R7 7800X3D', price=28000 WHERE id=9;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R7 9800X3D', price=36000 WHERE id=10;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='Ultra 5 245KF', price=16000 WHERE id=11;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='Ultra 7 265KF', price=24000 WHERE id=12;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R7 5700X', price=13000 WHERE id=13;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='Ultra 9 285K', price=50000 WHERE id=14;
UPDATE t_p288352_240fps_site_project.components_cpu SET name='R7 5700', price=14000 WHERE id=15;
INSERT INTO t_p288352_240fps_site_project.components_cpu (name, price, in_stock) VALUES ('9950X', 39000, false);
INSERT INTO t_p288352_240fps_site_project.components_cpu (name, price, in_stock) VALUES ('9600X', 15500, false);
INSERT INTO t_p288352_240fps_site_project.components_cpu (name, price, in_stock) VALUES ('i5 12400', 12000, false);
