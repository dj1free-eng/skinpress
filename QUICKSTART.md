# ⚡ QUICKSTART - SkinPress

## 🚀 Setup rápido (5 minutos)

```bash
cd skinpress
npm install
npm run dev
```

Abre http://localhost:5173

## 📱 Generar iconos PNG

1. Abre en navegador: `public/generate-icons.html`
2. Descarga `icon-192.png` y `icon-512.png`
3. Guárdalos en carpeta `public/`

O usa los SVG (también funcionan).

## 🌐 Publicar en GitHub Pages

### Opción A: Automática
```bash
npm run deploy
```

### Opción B: Manual
1. Build: `npm run build`
2. GitHub Settings → Pages → Source: gh-pages
3. Push: `git subtree push --prefix dist origin gh-pages`

Tu app estará en: `https://tu-usuario.github.io/skinpress/`

## 🎮 Usar con Phaser 3

1. **En SkinPress:** Convierte PNGs → Descarga ZIP
2. **En tu proyecto:** Descomprime en `public/assets/`
3. **En código:**
   ```js
   // Cargar catálogo
   this.load.json('catalog', 'assets/skins/index.json');
   
   // Usar skins
   const catalog = this.cache.json.get('catalog');
   catalog.items.forEach(item => {
     this.load.image(item.file, 'assets/skins/' + item.file);
   });
   ```

## 📂 Estructura del ZIP exportado

```
skinpress_export.zip
├── skins/
│   ├── skin_xxx.webp
│   └── skin_yyy.webp
└── index.json
```

## ⚙️ Configurar para otro repo

En `vite.config.js` cambia:
```js
base: '/nombre-de-tu-repo/'
```

## 🔧 Troubleshooting

**No funciona offline?**
- Recarga con Cmd+R o Ctrl+R
- Revisa Service Worker en DevTools

**Error "WebP not supported"?**
- Actualiza navegador
- Usa Chrome/Safari moderno

**ZIP muy grande en iPhone?**
- Descarga archivos individuales
- O en grupos pequeños

---

✅ Listo! Más info en README.md
