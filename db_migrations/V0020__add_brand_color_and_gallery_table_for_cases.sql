ALTER TABLE t_p288352_240fps_site_project.components_case ADD COLUMN IF NOT EXISTS brand VARCHAR(50);
ALTER TABLE t_p288352_240fps_site_project.components_case ADD COLUMN IF NOT EXISTS color VARCHAR(20);

CREATE TABLE IF NOT EXISTS t_p288352_240fps_site_project.components_case_images (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_case_images_case_id ON t_p288352_240fps_site_project.components_case_images(case_id);
