# Cómo Ver Logs de Cloudinary en Railway

## 🎯 Problema

Hiciste redeploy pero no ves los logs de Cloudinary en "Deploy Logs".

## ✅ Solución

Los logs de Cloudinary **NO** aparecen en "Deploy Logs" porque se imprimen cuando la aplicación **INICIA**, no cuando se construye.

---

## 📍 Dónde Buscar los Logs Correctos

### Paso 1: Ir a tu Proyecto en Railway

```
https://railway.app
> Click en tu proyecto "maldonado-repuestos"
> Click en el servicio "backend" (o donde tengas Python)
```

### Paso 2: Ver Logs de Runtime (NO Deploy Logs)

Hay **3 tipos de logs** en Railway:

1. **Build Logs** ❌ - Instalación de dependencias (pip install)
2. **Deploy Logs** ⚠️ - Proceso de deploy (puede no mostrar todo)
3. **View Logs** ✅ - Logs de la aplicación corriendo (AQUÍ están los de Cloudinary)

### Paso 3: Click en "View Logs"

```
En el panel del servicio:
> Botón superior derecho "View Logs"
O
> Pestaña "Logs" en el menú horizontal
```

### Paso 4: Buscar las Líneas de Cloudinary

Usar el buscador de logs (Ctrl+F o Cmd+F):

**Buscar:** `cloudinary`

Deberías ver:

```
[STARTUP] Verificando configuración de Cloudinary...
[STARTUP] CLOUDINARY_CLOUD_NAME: dak3u9rhi
[STARTUP] CLOUDINARY_API_KEY: Configurado
[STARTUP] CLOUDINARY_API_SECRET: Configurado
```

O si hay problema:

```
[STARTUP] CLOUDINARY_CLOUD_NAME: NO CONFIGURADO
[STARTUP] CLOUDINARY_API_KEY: NO CONFIGURADO
[STARTUP] CLOUDINARY_API_SECRET: NO CONFIGURADO
```

---

## 🔍 Alternativa: Railway CLI

Si no los ves en la UI:

```bash
# Instalar Railway CLI (si no lo tenés)
npm i -g @railway/cli

# Login
railway login

# Link al proyecto (si no lo hiciste)
railway link

# Ver logs en tiempo real
railway logs
```

Esto muestra los logs en tu terminal.

---

## 📸 Guía Visual

### 1. Panel Principal del Servicio

```
╔═══════════════════════════════════════╗
║  maldonado-repuestos-backend          ║
╠═══════════════════════════════════════╣
║  [Settings] [Variables] [Logs] [...]  ║  <-- Click aquí en "Logs"
╚═══════════════════════════════════════╝
```

### 2. Buscador de Logs

```
╔═══════════════════════════════════════╗
║  🔍 [Search logs...] cloudinary       ║  <-- Escribir "cloudinary"
╠═══════════════════════════════════════╣
║  Time (GMT-3)         Data            ║
║  ───────────────────────────────────  ║
║  19:06:44  [STARTUP] Verificando...   ║  <-- Debería aparecer aquí
║  19:06:44  CLOUDINARY_CLOUD_NAME: ... ║
╚═══════════════════════════════════════╝
```

---

## 🐛 Si AÚN NO Aparece

### Causa 1: La app no se reinició después del redeploy

**Solución:**
1. Ir a Railway > Tu servicio
2. Click en "Restart" (botón superior)
3. Esperar 10-20 segundos
4. Refrescar los logs

### Causa 2: Estás viendo logs viejos

**Solución:**
1. Scroll hasta el final de los logs (bottom)
2. O filtrar por "Last hour" o "Last 30 minutes"

### Causa 3: La app falló al iniciar

**Solución:**
1. Ver si hay errores en rojo en los logs
2. Buscar por "ERROR" o "Traceback"
3. Si ves error de import o módulo, puede que falte instalar cloudinary

---

## 🧪 Test Rápido: Forzar Reinicio

```bash
# Opción A: Railway UI
Railway Dashboard > Tu servicio > Settings > Restart

# Opción B: Git push con cambio mínimo
echo "# test" >> README.md
git add .
git commit -m "test: forzar redeploy"
git push origin main

# Opción C: Railway CLI
railway restart
```

Luego ir inmediatamente a "View Logs" y buscar `cloudinary`.

---

## 📋 Checklist de Verificación

Antes de pedir más ayuda, confirmar:

- [ ] Estás viendo "View Logs" o "Logs" (NO "Deploy Logs")
- [ ] Usaste el buscador con la palabra "cloudinary"
- [ ] Buscaste en los logs de los últimos 30 minutos
- [ ] El servicio está en estado "Active" (verde)
- [ ] Hiciste restart del servicio después de agregar variables
- [ ] Las variables están en la pestaña "Variables" de Railway

---

## 💡 Tip: Ver Logs en Tiempo Real

```bash
# Desde Railway CLI
railway logs --follow

# Luego en otra terminal, forzar restart
railway restart

# Verás los logs de startup en vivo
```

---

## 🆘 Última Opción: Verificar Manualmente

Si no aparece nada de Cloudinary, probá llamar al endpoint de salud:

```bash
# Ver URL de tu servicio
https://tu-servicio.railway.app

# Llamar al endpoint
curl https://tu-servicio.railway.app/api/health

# Si funciona, la app está corriendo
# Ahora intentá subir una imagen desde el panel admin
# Los errores de Cloudinary aparecerán en los logs
```

---

## 📞 Qué Compartir si Necesitás Ayuda

1. Screenshot de Railway > Variables (ocultar valores sensibles)
2. Screenshot de "View Logs" completo (últimos 50 líneas)
3. Confirmar que el servicio está "Active"
4. Output de `railway logs` si usás CLI

---

**Última actualización**: 2026-01-21
