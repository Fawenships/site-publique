-- WEBORA — schéma initial
-- Table unique pour la V1 : un site = une ligne
-- Sera éclatée plus tard en sites / site_settings / site_sections (Étape 11+)

CREATE TABLE IF NOT EXISTS sites (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(100) UNIQUE NOT NULL,      -- ex: atelier-lumiere -> /site/atelier-lumiere
  category      VARCHAR(50)  NOT NULL DEFAULT 'boutique',
  template      VARCHAR(50)  NOT NULL DEFAULT 'boutique-01',

  business_name VARCHAR(150) NOT NULL,
  tagline       VARCHAR(200),
  description   TEXT,

  phone         VARCHAR(50),
  whatsapp      VARCHAR(50),
  address       VARCHAR(255),
  email         VARCHAR(150),

  primary_color VARCHAR(20)  DEFAULT '#1F7A5C',

  products      JSONB NOT NULL DEFAULT '[]',
  -- ex: [{"name":"Chemise Lin Sable","price":"2450","category":"Chemises","badge":"Nouveau"}]

  published     BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites (slug);
