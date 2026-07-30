ALTER TABLE t_p288352_240fps_site_project.orders ADD COLUMN IF NOT EXISTS warranty_number TEXT;
ALTER TABLE t_p288352_240fps_site_project.orders ADD COLUMN IF NOT EXISTS warranty_url TEXT;
CREATE SEQUENCE IF NOT EXISTS t_p288352_240fps_site_project.warranty_number_seq START WITH 14;
