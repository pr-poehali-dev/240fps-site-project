CREATE TABLE t_p288352_240fps_site_project.product_images (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  img TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p288352_240fps_site_project.product_images (product_id, name, img) VALUES
(1, 'GLADIATOR', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg'),
(2, 'GLADIATOR V2', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg'),
(3, 'GLADIATOR V3', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg'),
(4, 'GLADIATOR V4', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg'),
(5, 'DOMINATOR', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg'),
(6, 'DOMINATOR V2', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/9883ca4b-2016-4faa-8123-c3cbf2989feb.jpg'),
(7, 'DOMINATOR V3', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg'),
(8, 'DOMINATOR V4', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg'),
(9, 'RAPTOR', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg'),
(10, 'RAPTOR V2', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg'),
(11, 'RAPTOR V3', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg'),
(12, 'RAPTOR V4', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/9883ca4b-2016-4faa-8123-c3cbf2989feb.jpg'),
(13, 'BERSERK', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/5866b2d1-4443-4366-a8e3-8f604190c52f.jpg'),
(14, 'BERSERK V2', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/6bd8e47b-6f79-41c5-992f-c3dfc9465db5.jpg'),
(15, 'BERSERK V3', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/961c46e9-9d96-4813-834d-9a0c864e6a57.jpg'),
(16, 'BERSERK V4', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/c4a58926-e305-4631-b900-7efc56f18c46.jpg'),
(17, 'BERSERK V5', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/e93c092a-d299-49ed-97e2-34cfb28df332.jpg'),
(18, 'DOMINATOR2 V4', 'https://cdn.poehali.dev/projects/5376b460-4536-4f54-ba9a-faff1ad7ec10/files/9883ca4b-2016-4faa-8123-c3cbf2989feb.jpg');