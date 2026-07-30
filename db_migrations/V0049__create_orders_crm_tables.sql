CREATE TABLE t_p288352_240fps_site_project.orders (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    customer_name TEXT NOT NULL DEFAULT '',
    customer_phone TEXT NOT NULL DEFAULT '',
    final_date DATE,
    total_price INTEGER NOT NULL DEFAULT 0,
    assembly_cost INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    issued_at TIMESTAMPTZ
);

CREATE TABLE t_p288352_240fps_site_project.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES t_p288352_240fps_site_project.orders(id),
    component_name TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    cost_price INTEGER NOT NULL DEFAULT 0,
    availability TEXT NOT NULL DEFAULT 'in_stock',
    delivery_date DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_city_status ON t_p288352_240fps_site_project.orders(city, status);
CREATE INDEX idx_order_items_order_id ON t_p288352_240fps_site_project.order_items(order_id);
