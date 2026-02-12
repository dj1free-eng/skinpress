# 🎨 SkinPress

Herramienta PWA offline para convertir imágenes PNG a WebP **LOSSLESS** (sin pérdida), optimizada para preparar skins de juegos Phaser 3.

## ✨ Características

- ✅ Conversión PNG → WebP **100% lossless** (sin pérdida de calidad)
- ✅ Preserva transparencia y resolución original
- ✅ Funciona **completamente offline** después de la primera carga
- ✅ Optimizada para **iPhone** (PWA instalable)
- ✅ Conversión en lote con Web Workers (no congela la UI)
- ✅ Generación automática de `index.json` para catálogo de skins
- ✅ Exportación ZIP con estructura lista para Phaser 3
- ✅ Preview antes/después de cada conversión
- ✅ Edición de nombres y labels
- ✅ Copiar rutas al portapapeles

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/skinpress.git
cd skinpress

# Instalar dependencias
npm install
```

## 💻 Desarrollo

```bash
# Servidor de desarrollo
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## 📦 Build para producción

```bash
# Build normal
npm run build

# Build + deploy a GitHub Pages (automático)
npm run deploy
```

El build genera una carpeta `dist/` lista para desplegar.

## 🌐 Deploy en GitHub Pages

### Opción 1: Automática (recomendada)

```bash
npm run deploy
```

Esto ejecuta el build y publica automáticamente en la rama `gh-pages`.

### Opción 2: Manual

1. **Build del proyecto:**
   ```bash
   npm run build
   ```

2. **Configurar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **Subir dist a gh-pages:**
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

4. **Acceder a tu app:**
   ```
   https://tu-usuario.github.io/skinpress/
   ```

### Configurar la base URL

Si tu repositorio NO se llama "skinpress", actualiza `vite.config.js`:

```js
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/nombre-repo/' : '/',
  // ...
});
```

## 📱 Instalar como PWA en iPhone

1. Abre la app en Safari
2. Toca el botón "Compartir" (icono con flecha hacia arriba)
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! Ahora funciona offline como app nativa

## 🎮 Uso con Phaser 3 / Top-Down Race 2

### 1. Convertir tus skins

1. Arrastra archivos PNG a SkinPress
2. Click en "⚡ Convertir todo"
3. Espera a que termine (verás el progreso)

### 2. Descargar el ZIP

Click en "📦 Descargar ZIP". Obtendrás:

```
skinpress_export.zip
├── skins/
│   ├── skin_crown_vector.webp
│   ├── skin_police_car.webp
│   └── skin_racing_blue.webp
└── index.json
```

### 3. Integrar en tu proyecto

1. **Descomprime el ZIP** en tu proyecto:
   ```
   public/assets/
   ```

2. **Resultado:**
   ```
   public/assets/
   ├── skins/
   │   ├── skin_crown_vector.webp
   │   ├── skin_police_car.webp
   │   └── skin_racing_blue.webp
   └── index.json  (o muévelo a skins/ si prefieres)
   ```

3. **En tu `CarFactoryScene.js`:**
   ```javascript
   async preload() {
     // Cargar catálogo
     const catalog = await fetch('assets/skins/index.json').then(r => r.json());
     
     // Cargar cada skin
     catalog.items.forEach(item => {
       this.load.image(
         item.file.replace('.webp', ''), // key sin extensión
         `assets/skins/${item.file}`
       );
     });
   }
   
   create() {
     // Usar skins
     const catalog = this.cache.json.get('skinsCatalog');
     catalog.items.forEach(item => {
       // Crear sprite, botón de selección, etc.
       const skin = this.add.sprite(x, y, item.file.replace('.webp', ''));
       // ...
     });
   }
   ```

### 4. Formato del index.json

```json
{
  "version": 1,
  "items": [
    { "file": "skin_crown_vector.webp", "label": "Crown Vector" },
    { "file": "skin_police_car.webp", "label": "Police Car" },
    { "file": "skin_racing_blue.webp", "label": "Racing Blue" }
  ]
}
```

## 🛠️ Tecnologías

- **Vite** - Build tool ultrarrápido
- **Vanilla JS** - Sin frameworks, máxima compatibilidad
- **Web Workers** - Conversión sin bloquear la UI
- **OffscreenCanvas** - Renderizado eficiente en worker
- **JSZip** - Generación de archivos ZIP
- **Service Worker** - Caché offline inteligente
- **PWA** - Instalable en iOS/Android

## 🔧 Conversión WebP Lossless

SkinPress usa la API nativa del navegador `OffscreenCanvas.convertToBlob()` con:

```javascript
{
  type: 'image/webp',
  quality: 1.0  // Máxima calidad = lossless
}
```

Esto produce WebP lossless **real**, equivalente a:
```bash
cwebp -lossless input.png -o output.webp
```

### Compatibilidad

- ✅ Chrome/Edge (siempre)
- ✅ Safari 16.4+ (iOS 16.4+)
- ✅ Firefox (con flag, o nativo en versiones recientes)

Si tu navegador no soporta WebP encoding, verás un error. **Solución:** usa Chrome o Safari actualizado.

## 📂 Estructura del proyecto

```
skinpress/
├── public/
│   ├── manifest.webmanifest  # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── icon-192.svg          # Icono app (conviértelo a PNG)
│   └── icon-512.svg          # Icono app (conviértelo a PNG)
├── src/
│   ├── main.js               # Lógica principal
│   ├── worker.js             # Web Worker para conversión
│   └── styles.css            # Estilos
├── index.html                # HTML principal
├── vite.config.js            # Config de Vite
├── build.mjs                 # Script de build custom
├── package.json              # Dependencias
└── README.md                 # Este archivo
```

## 🎨 Iconos

Los iconos actuales son **SVG placeholders**. Para producción:

1. Abre `public/icon-192.svg` y `public/icon-512.svg` en un navegador
2. Usa una herramienta como [CloudConvert](https://cloudconvert.com/svg-to-png)
3. O con ImageMagick:
   ```bash
   convert public/icon-192.svg public/icon-192.png
   convert public/icon-512.svg public/icon-512.png
   ```
4. Reemplaza los `.svg` por `.png` en `public/manifest.webmanifest`

## ⚡ Rendimiento

- **Conversión en cola:** 1 archivo a la vez para no saturar RAM en móvil
- **Web Workers:** No congela la interfaz
- **Progress tracking:** Barra de progreso global y por archivo
- **Manejo de errores:** Si falla un archivo, continúa con los demás

## 🐛 Troubleshooting

### "Browser does not support WebP encoding"

**Solución:** Actualiza tu navegador o usa Chrome/Safari moderno.

### La app no funciona offline

1. Recarga la página (Cmd+R / Ctrl+R)
2. Verifica que el Service Worker esté registrado (DevTools → Application → Service Workers)
3. Si hay actualización disponible, verás un botón "🔄 Actualizar disponible"

### Los archivos convertidos son grandes

WebP lossless **siempre** será más grande que PNG si el PNG está altamente comprimido. Lossless significa **cero pérdida de calidad**, por lo que el tamaño puede variar. En general, WebP lossless es 25-50% más pequeño que PNG sin pérdida.

Si necesitas menor tamaño, usa WebP **lossy** (con pérdida), pero eso requiere otra herramienta.

### Error al descargar ZIP en iPhone

iOS Safari tiene límites en downloads grandes. Si el ZIP es muy grande (>50MB), descarga los archivos individualmente o en grupos más pequeños.

## 📝 Licencia

MIT License - úsalo libremente para tus proyectos.

## 🤝 Contribuir

¿Mejoras? ¿Bugs? Abre un issue o PR en GitHub.

---

Hecho con ❤️ para la comunidad de desarrollo de juegos
