ALTER TABLE t_p288352_240fps_site_project.products
  ADD COLUMN cpu_id integer REFERENCES t_p288352_240fps_site_project.components_cpu(id),
  ADD COLUMN gpu_id integer REFERENCES t_p288352_240fps_site_project.components_gpu(id),
  ADD COLUMN ram_id integer REFERENCES t_p288352_240fps_site_project.components_ram(id),
  ADD COLUMN ssd_id integer REFERENCES t_p288352_240fps_site_project.components_ssd(id),
  ADD COLUMN motherboard_id integer REFERENCES t_p288352_240fps_site_project.components_motherboard(id),
  ADD COLUMN cooler_id integer REFERENCES t_p288352_240fps_site_project.components_cooler(id),
  ADD COLUMN psu_id integer REFERENCES t_p288352_240fps_site_project.components_psu(id),
  ADD COLUMN case_id integer REFERENCES t_p288352_240fps_site_project.components_case(id),
  ADD COLUMN markup integer NOT NULL DEFAULT 5000,
  ADD COLUMN auto_price boolean NOT NULL DEFAULT true;
