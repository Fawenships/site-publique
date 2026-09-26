const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// ---------- utilitaires ----------

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function darken(hex, amount = 20) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function renderProductsHtml(products) {
  if (!products || products.length === 0) {
    return '<p style="color:#5B6478;">Aucun produit ajouté pour le moment.</p>';
  }
  return products.map(p => `
    <div class="card">
      <div class="card-media">
        <div class="swatch" style="background:linear-gradient(160deg,#E7E4DB,#CFC6AE);"></div>
        ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <span class="cat">${escapeHtml(p.category || '')}</span>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">${escapeHtml(p.price)} HTG</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSite(site) {
  const templatePath = path.join(__dirname, 'templates', `${site.template}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  const firstProduct = (site.products && site.products[0]) || { name: 'Votre produit', price: '0' };

  const values = {
    BUSINESS_NAME: escapeHtml(site.business_name),
    DESCRIPTION: escapeHtml(site.description),
    TAGLINE: escapeHtml(site.tagline || site.business_name),
    PHONE: escapeHtml(site.phone || 'Non renseigné'),
    WHATSAPP: escapeHtml(site.whatsapp || 'Non renseigné'),
    ADDRESS: escapeHtml(site.address || 'Non renseignée'),
    HERO_PRODUCT_NAME: escapeHtml(firstProduct.name),
    HERO_PRODUCT_PRICE: escapeHtml(firstProduct.price),
    PRODUCTS_HTML: renderProductsHtml(site.products),
    PRIMARY_COLOR: site.primary_color || '#1F7A5C',
    PRIMARY_COLOR_DARK: darken(site.primary_color || '#1F7A5C'),
    YEAR: new Date().getFullYear(),
  };

  for (const [key, val] of Object.entries(values)) {
    html = html.split(`{{${key}}}`).join(val);
  }
  return html;
}

// ---------- routes API ----------

// Créer ou mettre à jour un site
app.post('/api/sites', async (req, res) => {
  try {
    const {
      slug, business_name, description, tagline,
      phone, whatsapp, address, products
    } = req.body;

    if (!business_name || !description) {
      return res.status(400).json({ error: 'Nom et description sont requis.' });
    }

    const finalSlug = slugify(slug || business_name);
    if (!finalSlug) {
      return res.status(400).json({ error: 'Adresse de site invalide.' });
    }

    const query = `
      INSERT INTO sites (slug, category, template, business_name, tagline, description, phone, whatsapp, address, products, published)
      VALUES ($1, 'boutique', 'boutique-01', $2, $3, $4, $5, $6, $7, $8, true)
      ON CONFLICT (slug) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        address = EXCLUDED.address,
        products = EXCLUDED.products,
        updated_at = NOW()
      RETURNING slug;
    `;
    const result = await pool.query(query, [
      finalSlug, business_name, tagline || '', description,
      phone || '', whatsapp || '', address || '', JSON.stringify(products || [])
    ]);

    res.json({ slug: result.rows[0].slug, url: `/site/${result.rows[0].slug}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création du site.' });
  }
});

// Récupérer les données d'un site (pour ré-édition future)
app.get('/api/sites/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sites WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Site introuvable.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Afficher le site publié et personnalisé
app.get('/site/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sites WHERE slug = $1 AND published = true', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).send('<h1>Site introuvable</h1><p>Ce site n\'existe pas ou n\'a pas été publié.</p>');
    }
    res.send(renderSite(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur.');
  }
});

app.listen(PORT, () => {
  console.log(`WEBORA backend prêt sur http://localhost:${PORT}`);
});
