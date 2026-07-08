-- Деактивируем все брендовые корпуса (мягкое удаление, данные сохраняются)
UPDATE t_p288352_240fps_site_project.components_case SET active = false WHERE id NOT IN (1,2,3,4);

-- Настраиваем 4 базовых варианта корпуса
UPDATE t_p288352_240fps_site_project.components_case SET name='Белый аквариум на выбор', price=5500, color='white', brand=NULL, image_url=NULL, active=true WHERE id=1;
UPDATE t_p288352_240fps_site_project.components_case SET name='Черный аквариум на выбор', price=5000, color='black', brand=NULL, image_url=NULL, active=true WHERE id=2;
UPDATE t_p288352_240fps_site_project.components_case SET name='Белый корпус', price=4000, color='white', brand=NULL, image_url=NULL, active=true WHERE id=3;
UPDATE t_p288352_240fps_site_project.components_case SET name='Черный корпус', price=3500, color='black', brand=NULL, image_url=NULL, active=true WHERE id=4;
