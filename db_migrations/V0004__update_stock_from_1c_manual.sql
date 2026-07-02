-- Сброс всего наличия
UPDATE t_p288352_240fps_site_project.components_cpu SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_gpu SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_motherboard SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_ram SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_ssd SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_psu SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_case SET in_stock = false;
UPDATE t_p288352_240fps_site_project.components_cooler SET in_stock = false;

-- Процессоры: i5 12400F, R5 5500, R5 7500F, R7 7700, R7 7800X3D
UPDATE t_p288352_240fps_site_project.components_cpu SET in_stock = true WHERE id IN (1, 5, 7, 8, 9);

-- Видеокарты: RTX 5050, RTX 5060, RTX 5060 Ti 16Gb, RTX 5070
UPDATE t_p288352_240fps_site_project.components_gpu SET in_stock = true WHERE id IN (1, 2, 3, 5);

-- Материнские платы: H610M, B550M, B650M, B850M, A620M
UPDATE t_p288352_240fps_site_project.components_motherboard SET in_stock = true WHERE id IN (9, 3, 4, 5, 2);

-- Память: DDR4 16GB, DDR4 32GB, DDR5 32GB 6000, DDR5 64GB 6000
UPDATE t_p288352_240fps_site_project.components_ram SET in_stock = true WHERE id IN (1, 2, 6, 9);

-- SSD: M2 500GB, M2 1Tb NVME, Samsung 990 EVO 1TB
UPDATE t_p288352_240fps_site_project.components_ssd SET in_stock = true WHERE id IN (2, 3, 4);

-- БП: 550W, 650W, 750W ATX 3.1, 850W ATX 3.1, NGDP 850W
UPDATE t_p288352_240fps_site_project.components_psu SET in_stock = true WHERE id IN (1, 2, 4, 5, 6);

-- Кулеры: SE-224 B, SE-224 W, Вода 3 секции
UPDATE t_p288352_240fps_site_project.components_cooler SET in_stock = true WHERE id IN (1, 2, 3);
