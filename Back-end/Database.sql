CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id UUID NOT NULL REFERENCES categories(id),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
    reception_mode TEXT NOT NULL CHECK (reception_mode IN ('PICKUP', 'DELIVERY')),
    scheduled_date DATE NOT NULL,
    scheduled_time_slot TEXT NOT NULL,
    delivery_address TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (reception_mode = 'PICKUP' OR delivery_address IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

INSERT INTO categories (name, slug, sort_order) VALUES
    ('Pains', 'pains', 1),
    ('Viennoiseries', 'viennoiseries', 2),
    ('Pâtisseries', 'patisseries', 3),
    ('Ventes additionnelles', 'ventes-additionnelles', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, category_id, image_url)
SELECT values.name, values.slug, values.description, values.price, categories.id, values.image_url
FROM (VALUES
    ('Baguette tradition', 'baguette-tradition', 'Une baguette croustillante, façonnée et cuite chaque jour.', 1.20, 'pains', 'PagePains/ImagesPains/pains.jpg'),
    ('Croissant au beurre', 'croissant-beurre', 'Feuilletage pur beurre et cuisson dorée.', 1.10, 'viennoiseries', 'PageViennoiseries/ImagesViennoiseries/viennoiseries.jpg'),
    ('Fraisier maison', 'fraisier-maison', 'Un dessert frais aux fraises et à la crème légère.', 4.50, 'patisseries', 'PagePatisseries/ImagesPatisseries/fraisier.png'),
    ('Macarons assortis', 'macarons-assortis', 'Une boîte de macarons aux parfums du moment.', 8.90, 'ventes-additionnelles', 'PageVentesAdditionnelles/ImagesVentesAdditionnelles/macarons.jpg')
) AS seed(name, slug, description, price, category_slug, image_url)
JOIN categories ON categories.slug = seed.category_slug
ON CONFLICT (slug) DO NOTHING;

ALTER USER o2passions WITH PASSWORD 'Azerty';