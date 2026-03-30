/**
 * Génère les icônes PWA (PNG) sans dépendance externe.
 * Utilise uniquement zlib (built-in Node.js) pour encoder le PNG.
 * Usage : node scripts/generate-icons.js
 */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC-32 pour les chunks PNG
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(d.length, 0);
  const crcBuf = Buffer.concat([t, d]);
  const crcVal = Buffer.allocUnsafe(4);
  crcVal.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, d, crcVal]);
}

function fillRect(pixels, size, x1, y1, w, h, color) {
  for (let y = Math.round(y1); y < Math.round(y1 + h); y++) {
    for (let x = Math.round(x1); x < Math.round(x1 + w); x++) {
      if (x < 0 || x >= size || y < 0 || y >= size) continue;
      const i = (y * size + x) * 4;
      pixels[i]     = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = color[3];
    }
  }
}

function fillCircle(pixels, size, cx, cy, r, color) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        const i = (y * size + x) * 4;
        pixels[i]     = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
        pixels[i + 3] = color[3];
      }
    }
  }
}

function createIcon(size) {
  const BG     = [12, 10, 9, 255];       // #0C0A09
  const ACCENT = [232, 134, 12, 255];    // #E8860C
  const WHITE  = [255, 255, 255, 255];

  const pixels = new Uint8Array(size * size * 4);

  // Fond sombre
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4]     = BG[0];
    pixels[i * 4 + 1] = BG[1];
    pixels[i * 4 + 2] = BG[2];
    pixels[i * 4 + 3] = BG[3];
  }

  // Cercle orange centré (zone safe area pour maskable)
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.38;
  fillCircle(pixels, size, cx, cy, r, ACCENT);

  // Lettre "É" en blanc (construite avec des rectangles)
  const fH    = r * 1.1;          // hauteur totale de la lettre
  const fW    = fH * 0.58;        // largeur max
  const fX    = cx - fW * 0.5;   // coin gauche
  const fY    = cy - fH * 0.5;   // coin haut
  const stem  = fW * 0.22;       // largeur de la tige gauche
  const bar   = fH * 0.15;       // épaisseur des barres

  fillRect(pixels, size, fX,        fY,             stem, fH,        WHITE); // tige gauche
  fillRect(pixels, size, fX,        fY,             fW,   bar,        WHITE); // barre haute
  fillRect(pixels, size, fX,        fY + fH/2 - bar/2, fW * 0.80, bar, WHITE); // barre milieu
  fillRect(pixels, size, fX,        fY + fH - bar,  fW,   bar,        WHITE); // barre basse

  // Accent aigu au-dessus du É
  const acX = cx + fW * 0.18;
  const acY = fY - fH * 0.12;
  const acW = fW * 0.10;
  const acH = fH * 0.12;
  // Petit rectangle incliné simulé par un rectangle simple
  fillRect(pixels, size, acX, acY, acW, acH, WHITE);

  // Encodage PNG : filter byte (None=0) + données RGBA
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.allocUnsafe(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row[1 + x * 4]     = pixels[i];
      row[1 + x * 4 + 1] = pixels[i + 1];
      row[1 + x * 4 + 2] = pixels[i + 2];
      row[1 + x * 4 + 3] = pixels[i + 3];
    }
    rows.push(row);
  }

  const raw        = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // signature PNG
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const sizes = [
  { size: 192,  file: 'icon-192.png' },
  { size: 512,  file: 'icon-512.png' },
  { size: 180,  file: 'apple-touch-icon.png' },
];

for (const { size, file } of sizes) {
  fs.writeFileSync(path.join(outDir, file), createIcon(size));
  console.log(`✓ ${file} (${size}×${size})`);
}

console.log('\nIcônes générées dans public/icons/');
