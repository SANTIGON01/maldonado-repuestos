# 🚨 FIX URGENTE: Error "column public_id does not exist"

## Problema

La aplicación está caída con el error:
```
asyncpg.exceptions.UndefinedColumnError: column product_images.public_id does not exist
```

## Causa

Agregamos el campo `public_id` al modelo Python pero NO se ejecutó la migración en PostgreSQL.

---

## ✅ SOLUCIÓN RÁPIDA (Railway Dashboard)

### Opción 1: Railway Data Tab (MÁS FÁCIL)

1. **Ir a Railway Dashboard**
2. **Click en tu servicio PostgreSQL** (NO el backend)
3. **Click en "Data" tab**
4. **En la consola SQL**, ejecutar:

```sql
ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS public_id VARCHAR(200) NULL;
```

5. **Click "Run"**
6. **Verificar** que diga "Success" o "ALTER TABLE"
7. **Ir al servicio backend** y click "Restart"
8. **Esperar 20 segundos** y probar el sitio

---

### Opción 2: Railway CLI

```bash
# Conectar a PostgreSQL
railway connect postgres

# En psql, ejecutar:
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS public_id VARCHAR(200) NULL;

# Salir
\q

# Restart backend
railway restart
```

---

### Opción 3: Psql Directo (Si tenés psql instalado)

1. **Obtener DATABASE_URL de Railway**:
   - Railway > PostgreSQL service > Variables > DATABASE_URL
   - Copiar el valor completo

2. **Conectar con psql**:
```bash
psql "tu-database-url-completa-aquí"
```

3. **Ejecutar migración**:
```sql
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS public_id VARCHAR(200) NULL;
```

4. **Verificar**:
```sql
\d product_images
```

Deberías ver `public_id` en la lista de columnas.

5. **Salir**:
```
\q
```

6. **Restart backend en Railway**

---

## 🔍 Verificar que Funcionó

Después del restart:

1. **Ir a tu sitio**: https://tu-frontend.vercel.app
2. **Debería cargar productos normalmente**
3. **Ver logs del backend**: NO debería mostrar el error de `public_id`

---

## 📋 Checklist

- [ ] Ejecuté el ALTER TABLE en la base de datos
- [ ] Vi "Success" o "ALTER TABLE" como respuesta
- [ ] Hice restart del servicio backend
- [ ] Esperé 20-30 segundos
- [ ] El sitio vuelve a mostrar productos
- [ ] No hay errores en los logs

---

## 🆘 Si No Funciona

**Verificar que la columna existe:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_images' AND column_name = 'public_id';
```

Debería retornar:
```
 column_name | data_type      | is_nullable
-------------+----------------+-------------
 public_id   | character varying | YES
```

Si NO aparece nada, la columna NO se creó. Intentar de nuevo sin el `IF NOT EXISTS`:

```sql
ALTER TABLE product_images ADD COLUMN public_id VARCHAR(200) NULL;
```

---

## 📞 Screenshots Útiles

### Railway Data Tab

```
╔═══════════════════════════════════════╗
║  PostgreSQL > Data                    ║
╠═══════════════════════════════════════╣
║  [Query Editor]                       ║
║  ┌───────────────────────────────────┐║
║  │ ALTER TABLE product_images        │║
║  │ ADD COLUMN IF NOT EXISTS          │║
║  │ public_id VARCHAR(200) NULL;      │║
║  └───────────────────────────────────┘║
║  [Run Query]  [Clear]                 ║
╚═══════════════════════════════════════╝
```

---

## ⏱️ Tiempo Estimado

- **Con Railway Data tab**: 1-2 minutos
- **Con Railway CLI**: 2-3 minutos
- **Con psql directo**: 3-5 minutos

---

## 🔄 Alternativa: Rollback (Si la migración falla)

Si la migración no funciona, podemos hacer rollback del código:

```bash
git revert HEAD
git push origin main
```

Esto volverá al código anterior sin el campo `public_id`.

---

**IMPORTANTE**: Ejecutar esto YA para que el sitio vuelva a funcionar.
