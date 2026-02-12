# 📱 Troubleshooting iPhone / iOS

## Problemas comunes y soluciones para usar SkinPress en iPhone

### 🔧 La app no funciona offline

**Causa:** Service Worker no se registró correctamente.

**Solución:**
1. Cierra todas las pestañas de Safari con SkinPress
2. Ve a Ajustes → Safari → Avanzado → Datos de sitios web
3. Busca tu dominio y elimínalo
4. Abre Safari nuevamente y carga SkinPress
5. Dale tiempo a que se cargue completamente
6. Verás "SW registered" en la consola (Safari → Desarrollar → Consola)

### 📥 No puedo descargar archivos

**Causa:** iOS Safari tiene restricciones de descarga.

**Soluciones:**

**Para archivos individuales:**
- Toca el archivo descargado
- Safari mostrará una flecha ↓ arriba a la derecha
- Toca la flecha → "Descargas"
- Mantén presionado el archivo → "Compartir"
- Guarda en Archivos o envía por email

**Para ZIPs grandes (>50MB):**
- Descarga en grupos más pequeños
- O usa el botón "Descargar seleccionados"

### 🎨 Los iconos no se ven en pantalla de inicio

**Causa:** Faltan los archivos PNG de los iconos.

**Solución:**
1. Abre en Safari: `https://tu-dominio.com/generate-icons.html`
2. Descarga `icon-192.png` y `icon-512.png`
3. Si tienes acceso al repo, sube estos archivos a `public/`
4. Si no, los SVG también funcionan (pero pueden verse pixelados)

### ⚡ La conversión es muy lenta

**Causa:** iPhone tiene menos RAM que desktop.

**Soluciones:**
- Convierte de 5-10 archivos a la vez máximo
- Cierra otras apps en segundo plano
- Espera a que termine cada lote antes de agregar más
- Evita archivos PNG muy grandes (>5MB)

### 🔄 No aparece el botón "Actualizar disponible"

**Causa:** El Service Worker no detectó actualización.

**Solución:**
1. Cierra Safari completamente (desliza hacia arriba desde multitarea)
2. Espera 30 segundos
3. Abre Safari y vuelve a la app
4. Si hay actualización, debería aparecer el botón

**Forzar actualización:**
1. Ajustes → Safari → Avanzado → Datos de sitios web
2. Elimina tu dominio
3. Recarga la app

### 💾 Archivos convertidos desaparecen al recargar

**Esto es NORMAL.**

SkinPress NO guarda archivos en el dispositivo. Todo se procesa en memoria:
- Convierte tus archivos
- Descarga los resultados
- Los originales quedan en tu dispositivo
- Los WebP descargados van a "Descargas" de Safari

Para guardar permanente:
1. Descarga ZIP
2. Descomprime en app "Archivos" (iOS Files)
3. Mueve a iCloud Drive o carpeta local

### 📋 "Copiar al portapapeles" no funciona

**Causa:** Safari iOS requiere interacción directa del usuario.

**Solución:**
- Asegúrate de tocar el botón directamente
- No uses gestos de toque prolongado
- Si sigue sin funcionar, usa "Descargar index.json" en su lugar

### 🚫 Error "WebP not supported"

**Causa:** Safari muy antiguo (iOS < 14).

**Soluciones:**
1. Actualiza iOS a la última versión (Ajustes → General → Actualización)
2. Si no puedes actualizar, usa Chrome para iOS
3. O haz la conversión en un desktop y transfiere los archivos

### 📱 La app se ve mal en modo horizontal

**Por diseño.** SkinPress está optimizada para modo vertical.

**Solución:**
- Activa el bloqueo de rotación
- Usa en modo retrato (vertical)

### 🔐 No puedo instalar como PWA

**Causas posibles:**

1. **No estás en Safari:** Las PWA en iOS solo funcionan con Safari.
   - Chrome iOS, Firefox iOS NO soportan "Añadir a inicio"
   
2. **HTTPS no configurado:** GitHub Pages ya tiene HTTPS, así que esto no debería ser problema.

3. **Manifest incorrecto:**
   - Verifica que `/manifest.webmanifest` se carga correctamente
   - Abre Safari DevTools → Consola, busca errores

**Pasos correctos para instalar:**
1. Abre en **Safari** (no Chrome)
2. Toca botón Compartir (cuadrado con flecha ↑)
3. Desliza hacia abajo y busca "Añadir a pantalla de inicio"
4. Toca → Añadir

### 💡 Tips de rendimiento en iPhone

**Para mejor experiencia:**

1. **Cierra otras apps** antes de convertir muchos archivos
2. **Usa WiFi** si tienes que cargar la app por primera vez
3. **Modo Ahorro de Energía OFF** para mejor rendimiento
4. **Mantén Safari actualizado** (actualiza iOS)
5. **Libera espacio** si iPhone está casi lleno (Ajustes → General → Almacenamiento)

### 🆘 Nada funciona, ¿qué hago?

**Reset completo:**

1. Safari → Ajustes → Borrar historial y datos
2. Reinicia iPhone (apagar/encender)
3. Abre Safari y vuelve a cargar la app
4. Espera a que cargue completamente
5. Prueba con un solo archivo PNG pequeño

**Si sigue sin funcionar:**

Prueba desde un desktop (Mac/PC):
- Funcionalidad idéntica
- Mejor rendimiento
- Mismos resultados

---

## ✅ Checklist antes de reportar bug

Antes de pensar que hay un bug, verifica:

- [ ] Estoy usando **Safari** (no Chrome iOS)
- [ ] Tengo **iOS 14+** (Ajustes → General → Información)
- [ ] Tengo **conexión a internet** la primera vez
- [ ] Esperé a que la app **cargue completamente**
- [ ] Probé con **un solo archivo** pequeño primero
- [ ] **Reinicié Safari** cerrando todas las pestañas
- [ ] No tengo **Modo Bajo Consumo** activado
- [ ] Tengo **espacio libre** en iPhone

Si todo lo anterior está OK y sigue sin funcionar, entonces sí puede ser un bug real.

---

**Última actualización:** Versión 1.0 - Compatible con iOS 14+
