# Configuración de Cloudinary en Railway - Guía Detallada

## 🚨 Problema Detectado

Los logs muestran: `[Cloudinary] Configured: False, Cloud: N/A...`

Esto significa que las variables de entorno **NO** se están leyendo en Railway.

---

## ✅ Solución: Configurar Variables en Railway

### Paso 1: Obtener Credenciales de Cloudinary

1. Ir a [https://console.cloudinary.com](https://console.cloudinary.com)
2. Login con tu cuenta
3. En el Dashboard principal, verás:

```
Cloud name:      tu-cloud-name-aquí
API Key:         123456789012345
API Secret:      Abc123****** (click en "Reveal" para ver completo)
```

4. **COPIAR** estas 3 credenciales

---

### Paso 2: Ir a Railway Dashboard

1. Abrir [https://railway.app](https://railway.app)
2. Seleccionar tu proyecto: **maldonado-repuestos**
3. Click en el servicio **backend** (o el que tenga el código Python)

---

### Paso 3: Agregar Variables de Entorno

#### Método 1: Pestaña "Variables" (Recomendado)

1. Click en pestaña **"Variables"** (en el menú superior)
2. Verás una lista de variables existentes
3. Click en **"+ New Variable"** o **"Raw Editor"**

#### Opción A: Agregar una por una

```
Variable Name: CLOUDINARY_CLOUD_NAME
Value: [pegar tu cloud name]
```

Repetir para:
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### Opción B: Raw Editor (Más rápido)

Click en **"Raw Editor"** y agregar al final:

```bash
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123def456ghi789
```

⚠️ **IMPORTANTE**: NO usar comillas, NO espacios extra

---

### Paso 4: Verificar Formato Correcto

✅ **CORRECTO:**
```bash
CLOUDINARY_CLOUD_NAME=demo-cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbC123dEf456GhI789jKl
```

❌ **INCORRECTO:**
```bash
CLOUDINARY_CLOUD_NAME="demo-cloud"          # NO usar comillas
CLOUDINARY_CLOUD_NAME = demo-cloud          # NO espacios alrededor del =
CLOUDINARY_API_KEY=123 456 789              # NO espacios en el valor
```

---

### Paso 5: Guardar y Redeploy

1. Click en **"Deploy"** o **"Redeploy"** (botón en la parte superior)
2. Esperar a que termine el deploy (se mostrará "Active" en verde)
3. Click en **"View Logs"** > **"Deploy Logs"**

---

### Paso 6: Verificar en Logs

Buscar en los logs de deploy la línea:

✅ **Si funciona:**
```
[Cloudinary] Configured: True, Cloud: tu-cloud-name...
```

❌ **Si NO funciona:**
```
[Cloudinary] Configured: False, Cloud: N/A...
[Cloudinary] WARNING: Credenciales no configuradas
[Cloudinary] CLOUD_NAME presente: False
[Cloudinary] API_KEY presente: False
[Cloudinary] API_SECRET presente: False
```

---

## 🔍 Troubleshooting Común

### Problema 1: "Cloud: N/A"

**Causa**: Las variables no existen o están mal escritas

**Solución**:
1. Ir a Variables en Railway
2. Verificar que los nombres sean EXACTOS:
   - `CLOUDINARY_CLOUD_NAME` (no cloud_name, ni cloudinary_cloud_name)
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Verificar que NO haya espacios extra
4. Redeploy

---

### Problema 2: "Configured: False" pero las variables existen

**Causa**: El servicio está leyendo otro .env o las variables están vacías

**Solución**:
1. Click en la variable en Railway
2. Verificar que el **Value** NO esté vacío
3. Copiar el valor directamente desde Cloudinary Dashboard
4. Redeploy

---

### Problema 3: Variables configuradas pero sigue sin funcionar

**Causa**: Puede que estés viendo logs del deploy anterior

**Solución**:
1. Forzar un nuevo deploy:
   - Opción A: Click en "Redeploy" en Railway
   - Opción B: Hacer un git push con un cambio mínimo
2. Esperar a que termine completamente
3. Ir a **Deploy Logs** (NO Build Logs)
4. Buscar la línea `[Cloudinary] Configured:`

---

### Problema 4: "Invalid credentials" al subir imagen

**Causa**: Credenciales incorrectas (typo al copiar/pegar)

**Solución**:
1. Ir a Cloudinary Dashboard
2. Copiar nuevamente las 3 credenciales
3. En Railway, ELIMINAR las variables viejas
4. Crear nuevas variables con valores correctos
5. Redeploy

---

## 📸 Screenshot de Ejemplo (Railway)

Tu pantalla de Variables debería verse así:

```
╔════════════════════════════════════╗
║  Variables                         ║
╠════════════════════════════════════╣
║  DATABASE_URL                      ║
║  postgres://...                    ║
╠════════════════════════════════════╣
║  CLOUDINARY_CLOUD_NAME             ║
║  demo-cloud                        ║
╠════════════════════════════════════╣
║  CLOUDINARY_API_KEY                ║
║  123456789012345                   ║
╠════════════════════════════════════╣
║  CLOUDINARY_API_SECRET             ║
║  AbC123dEf***                      ║
╚════════════════════════════════════╝
```

---

## 🧪 Test Rápido

Después de configurar, probar:

```bash
# 1. Ver logs del deploy
railway logs --deployment

# 2. Buscar la línea de Cloudinary
# Debería decir: [Cloudinary] Configured: True

# 3. Probar upload desde panel admin
```

---

## 🆘 Si Nada Funciona

### Último Recurso: Verificar que Pydantic lea el .env

Agregar esto temporalmente en `backend/app/config.py`:

```python
class Settings(BaseSettings):
    # ... tus campos existentes ...

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# AL FINAL DEL ARCHIVO, agregar esto para debug:
settings = get_settings()
print(f"[DEBUG Config] CLOUDINARY_CLOUD_NAME: {settings.CLOUDINARY_CLOUD_NAME}")
print(f"[DEBUG Config] CLOUDINARY_API_KEY: {settings.CLOUDINARY_API_KEY[:5]}***")
```

Esto imprimirá las variables al iniciar. Si sigue mostrando vacío, el problema es que Pydantic no está leyendo las variables de Railway.

---

## 📝 Checklist Final

Antes de pedir ayuda, verificar:

- [ ] Las 3 variables existen en Railway Variables
- [ ] Los nombres son EXACTOS (copiar de arriba)
- [ ] Los valores NO tienen comillas
- [ ] Los valores NO tienen espacios extra
- [ ] Hiciste un Redeploy DESPUÉS de agregar variables
- [ ] Estás viendo los logs del deploy MÁS RECIENTE
- [ ] Las credenciales de Cloudinary son correctas (probadas en Dashboard)

---

## 💡 Alternativa: Usar Railway CLI

Si la UI web no funciona:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Agregar variables
railway variables set CLOUDINARY_CLOUD_NAME=tu-cloud-name
railway variables set CLOUDINARY_API_KEY=tu-api-key
railway variables set CLOUDINARY_API_SECRET=tu-api-secret

# Redeploy
railway up
```

---

## 📞 Información para Soporte

Si necesitás compartir el problema:

1. Screenshot de Railway > Variables (ocultar valores sensibles)
2. Logs completos del último deploy
3. Output de: `railway variables` (si usás CLI)
4. Confirmar que las credenciales funcionan en Cloudinary Dashboard

---

**Última actualización**: 2026-01-21
**Autor**: Claude Code
