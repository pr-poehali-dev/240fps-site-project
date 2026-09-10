CREATE TABLE IF NOT EXISTS t_p288352_240fps_site_project.leads (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    delivered BOOLEAN NOT NULL DEFAULT FALSE,
    channel VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON t_p288352_240fps_site_project.leads (created_at DESC);