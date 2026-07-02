CREATE TABLE t_p288352_240fps_site_project.visits (
  id BIGSERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '/',
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  ip TEXT,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX idx_visits_visited_at ON t_p288352_240fps_site_project.visits (visited_at);
CREATE INDEX idx_visits_session_id ON t_p288352_240fps_site_project.visits (session_id);
