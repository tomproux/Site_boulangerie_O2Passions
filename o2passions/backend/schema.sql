-- ============================================================
-- O2Passions — Schéma de base de données PostgreSQL
-- ============================================================
-- Remplace le SQLite initialement prévu au MVP (cf. doc section 6
-- et section 11 "Évolutions possibles" : migration anticipée vers
-- PostgreSQL dès cette version, décidée avant même la mise en
-- production).
--
-- Utilise pgcrypto pour générer des UUID côté base (gen_random_uuid()).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Table users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    first_name     TEXT NOT NULL,
    last_name      TEXT NOT NULL,
    phone          TEXT,
    role           TEXT NOT NULL DEFAULT 'CUSTOMER'
                       CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Table products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    description   TEXT,
    price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_url     TEXT,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- ------------------------------------------------------------
-- Table orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status                TEXT NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN (
                                  'PENDING', 'IN_PREPARATION', 'READY',
                                  'IN_DELIVERY', 'COMPLETED', 'CANCELLED'
                              )),
    reception_mode        TEXT NOT NULL CHECK (reception_mode IN ('PICKUP', 'DELIVERY')),
    scheduled_date        DATE NOT NULL,
    scheduled_time_slot   TEXT NOT NULL,
    delivery_address      TEXT,
    total_amount          NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status        TEXT NOT NULL DEFAULT 'PENDING'
                              CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    cancel_reason         TEXT,
    stripe_payment_intent TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT delivery_address_required
        CHECK (reception_mode = 'PICKUP' OR delivery_address IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ------------------------------------------------------------
-- Table order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity     INTEGER NOT NULL CHECK (quantity > 0),
    unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price  NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------
-- Table shop_settings (horaires & informations boutique — US-02)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_settings (
    id            SMALLINT PRIMARY KEY DEFAULT 1,
    shop_name     TEXT NOT NULL DEFAULT 'O2Passions',
    address       TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    map_url       TEXT NOT NULL DEFAULT '',
    opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    about_text    TEXT NOT NULL DEFAULT '',
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Trigger générique pour updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Données de démonstration (catégories + produits)
-- ------------------------------------------------------------
INSERT INTO categories (name, slug, sort_order) VALUES
    ('Pains', 'pains', 1),
    ('Viennoiseries', 'viennoiseries', 2),
    ('Pâtisseries', 'patisseries', 3),
    ('Traiteur', 'traiteur', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Baguette tradition', 'baguette-tradition', 'Baguette au levain, croûte croustillante et mie alvéolée.', 1.20,
       (SELECT id FROM categories WHERE slug = 'pains'), '/images/baguette.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'baguette-tradition');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Pain de campagne', 'pain-de-campagne', 'Pain rustique au levain naturel, cuit sur pierre.', 3.80,
       (SELECT id FROM categories WHERE slug = 'pains'), '/images/pain-campagne.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pain-de-campagne');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Croissant pur beurre', 'croissant-pur-beurre', 'Croissant feuilleté, doré et croustillant.', 1.30,
       (SELECT id FROM categories WHERE slug = 'viennoiseries'), '/images/croissant.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'croissant-pur-beurre');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Pain au chocolat', 'pain-au-chocolat', 'Viennoiserie feuilletée, deux barres de chocolat noir.', 1.40,
       (SELECT id FROM categories WHERE slug = 'viennoiseries'), '/images/pain-chocolat.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pain-au-chocolat');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Éclair chocolat', 'eclair-chocolat', 'Pâte à choux, crème pâtissière au chocolat noir.', 3.50,
       (SELECT id FROM categories WHERE slug = 'patisseries'), '/images/eclair.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'eclair-chocolat');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Tarte aux pommes', 'tarte-aux-pommes', 'Pâte sablée maison, pommes caramélisées.', 4.20,
       (SELECT id FROM categories WHERE slug = 'patisseries'), '/images/tarte-pommes.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'tarte-aux-pommes');

INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
SELECT 'Quiche lorraine', 'quiche-lorraine', 'Pâte brisée maison, lardons et crème fraîche.', 4.90,
       (SELECT id FROM categories WHERE slug = 'traiteur'), '/images/quiche.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'quiche-lorraine');

UPDATE shop_settings SET
    address = '12 rue du Four, 75000 Ville',
    phone = '01 23 45 67 89',
    map_url = 'https://maps.google.com',
    about_text = 'O2Passions est une boulangerie-pâtisserie artisanale, fidèle au levain naturel et aux produits de saison.',
    opening_hours = '{
        "lundi": "Fermé",
        "mardi": "7h-19h",
        "mercredi": "7h-19h",
        "jeudi": "7h-19h",
        "vendredi": "7h-19h",
        "samedi": "7h-19h",
        "dimanche": "7h-13h"
    }'::jsonb
WHERE id = 1;
