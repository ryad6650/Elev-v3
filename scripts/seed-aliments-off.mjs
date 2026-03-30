/**
 * Seed Aliments — OpenFoodFacts France
 *
 * Importe les ~50 000 produits alimentaires français les plus scannés
 * depuis l'API OpenFoodFacts dans la table Supabase `aliments`.
 *
 * Usage :
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-aliments-off.mjs
 *
 * Options :
 *   --pages=100     Nombre de pages (défaut: 100, × 500 = 50 000 produits)
 *   --start-page=1  Page de départ (pour reprendre un import interrompu)
 *   --dry-run       Simule sans insérer en base
 */

import { createClient } from '@supabase/supabase-js';

// Lit aussi depuis .env.local si disponible
try {
  const { readFileSync } = await import('fs');
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length && !process.env[k.trim()]) {
      process.env[k.trim()] = v.join('=').trim();
    }
  }
} catch { /* .env.local absent, on continue avec les vars d'env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = 500;

const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.replace('--', '').split('=')).filter(p => p.length === 2)
);
const TOTAL_PAGES = parseInt(args.pages ?? '100', 10);
const START_PAGE = parseInt(args['start-page'] ?? '1', 10);
const DRY_RUN = '--dry-run' in Object.fromEntries(process.argv.slice(2).map(a => [a, true]));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Normalise un produit OFT en ligne aliment */
function normalize(product) {
  const nom = (product.product_name_fr || product.product_name || '').trim().slice(0, 200);
  if (!nom || nom.length < 2) return null;

  const n = product.nutriments ?? {};
  const kcal = n['energy-kcal_100g'] ?? n['energy_value'] ?? null;
  if (!kcal || kcal < 0 || kcal > 9000) return null;

  return {
    nom,
    marque: product.brands ? product.brands.split(',')[0].trim().slice(0, 100) : null,
    code_barres: product.code ? String(product.code).slice(0, 30) : null,
    calories: Math.round(kcal),
    proteines: n['proteins_100g'] != null ? Math.round(n['proteins_100g'] * 10) / 10 : null,
    glucides: n['carbohydrates_100g'] != null ? Math.round(n['carbohydrates_100g'] * 10) / 10 : null,
    lipides: n['fat_100g'] != null ? Math.round(n['fat_100g'] * 10) / 10 : null,
    fibres: n['fiber_100g'] != null ? Math.round(n['fiber_100g'] * 10) / 10 : null,
    sucres: n['sugars_100g'] != null ? Math.round(n['sugars_100g'] * 10) / 10 : null,
    sel: n['salt_100g'] != null ? Math.round(n['salt_100g'] * 10) / 10 : null,
    is_global: true,
    user_id: null,
  };
}

/** Récupère une page de produits depuis l'API OFT (avec retry sur 503) */
async function fetchPage(page) {
  const params = new URLSearchParams({
    action: 'process',
    tagtype_0: 'countries',
    tag_contains_0: 'contains',
    tag_0: 'france',
    sort_by: 'unique_scans_n',
    page_size: String(PAGE_SIZE),
    page: String(page),
    json: '1',
    fields: 'code,product_name,product_name_fr,brands,nutriments',
  });

  const url = `https://world.openfoodfacts.org/cgi/search.pl?${params}`;
  const MAX_RETRIES = 8;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Elev-v3-Seeder/1.0 (contact@elev.app)' },
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 503 || res.status === 429) {
      // Backoff exponentiel : 5s, 10s, 20s, 40s, 60s, 60s, 60s, 60s
      const wait = Math.min(5000 * Math.pow(2, attempt - 1), 60000);
      process.stdout.write(` [503 retry ${attempt}/${MAX_RETRIES} dans ${wait/1000}s]`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.products ?? [];
  }

  throw new Error(`Trop de tentatives (${MAX_RETRIES} × 503)`);
}

/** Insère un batch en base, ignore les doublons de code_barres */
async function insertBatch(rows) {
  if (DRY_RUN) return { count: rows.length, error: null };

  // Supabase ne supporte pas ON CONFLICT sur index partiel via JS client
  // On insère et on ignore les erreurs de contrainte
  const { error, count } = await supabase
    .from('aliments')
    .insert(rows, { count: 'exact' });

  return { count, error };
}

async function run() {
  console.log(`🌱 Seed Aliments OFT — ${TOTAL_PAGES} pages × ${PAGE_SIZE} produits`);
  if (DRY_RUN) console.log('   Mode dry-run activé (aucune insertion)');
  console.log('');

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let page = START_PAGE; page <= START_PAGE + TOTAL_PAGES - 1; page++) {
    const pageNum = page - START_PAGE + 1;
    process.stdout.write(`Page ${page} (${pageNum}/${TOTAL_PAGES})... `);

    try {
      const products = await fetchPage(page);
      if (!products.length) {
        console.log('fin des données OFT.');
        break;
      }

      const rows = products.map(normalize).filter(Boolean);
      totalSkipped += products.length - rows.length;

      if (rows.length > 0) {
        // Split en sous-batches de 100 pour éviter les timeouts Supabase
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await insertBatch(batch);
          if (error) {
            // Ignoré si contrainte unique (code_barres doublon)
            if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
              totalErrors++;
              console.error(`\n   ❌ Erreur batch [${i}-${i+batch.length}]: ${error.message} (code: ${error.code})`);
            }
          } else {
            totalInserted += batch.length;
          }
        }
      }

      console.log(`${rows.length} produits (total: ${totalInserted})`);

      // Délai poli entre pages (évite le rate-limiting OFT)
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.log(`⚠️  Erreur: ${err.message}`);
      totalErrors++;
      // Pause longue après un échec complet (OFT saturé)
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  console.log('');
  console.log('✅ Terminé !');
  console.log(`   Insérés : ${totalInserted}`);
  console.log(`   Ignorés (données manquantes) : ${totalSkipped}`);
  console.log(`   Erreurs : ${totalErrors}`);
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
