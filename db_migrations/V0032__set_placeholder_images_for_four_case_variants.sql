UPDATE t_p288352_240fps_site_project.components_case SET image_url='/cases/gallery/white-aquarium-0.webp' WHERE id=1;
UPDATE t_p288352_240fps_site_project.components_case SET image_url='/cases/gallery/black-aquarium-0.webp' WHERE id=2;
UPDATE t_p288352_240fps_site_project.components_case SET image_url='/cases/gallery/white-case-0.webp' WHERE id=3;
UPDATE t_p288352_240fps_site_project.components_case SET image_url='/cases/gallery/black-case-0.webp' WHERE id=4;

INSERT INTO t_p288352_240fps_site_project.components_case_images (case_id, image_url, sort_order) VALUES
(1, '/cases/gallery/white-aquarium-0.webp', 0),
(1, '/cases/gallery/white-aquarium-1.webp', 1),
(1, '/cases/gallery/white-aquarium-2.webp', 2),
(1, '/cases/gallery/white-aquarium-3.webp', 3),
(1, '/cases/gallery/white-aquarium-4.webp', 4),
(2, '/cases/gallery/black-aquarium-0.webp', 0),
(2, '/cases/gallery/black-aquarium-1.webp', 1),
(2, '/cases/gallery/black-aquarium-2.webp', 2),
(2, '/cases/gallery/black-aquarium-3.webp', 3),
(2, '/cases/gallery/black-aquarium-4.webp', 4),
(3, '/cases/gallery/white-case-0.webp', 0),
(3, '/cases/gallery/white-case-1.webp', 1),
(3, '/cases/gallery/white-case-2.webp', 2),
(3, '/cases/gallery/white-case-3.webp', 3),
(3, '/cases/gallery/white-case-4.webp', 4),
(4, '/cases/gallery/black-case-0.webp', 0),
(4, '/cases/gallery/black-case-1.webp', 1),
(4, '/cases/gallery/black-case-2.webp', 2),
(4, '/cases/gallery/black-case-3.webp', 3),
(4, '/cases/gallery/black-case-4.webp', 4);
