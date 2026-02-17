# 🎯 Sistema de Licencias - Tu Dinero Claro

## ✅ Estado Actual del Sistema

### **Sistema Completamente Funcional**

El sistema de licencias automáticas está operativo y listo para ventas reales.

---

## 📊 Arquitectura del Sistema

```
COMPRA (Gumroad €47)
    ↓
WEBHOOK POST → Railway (Flask Server)
    ↓
Generar Licencia (TDC-2025-XXXXX)
    ↓
Enviar Email (Resend API)
    ↓
Usuario recibe email con licencia
    ↓
Clic en botón → bienvenida.html
    ↓
Copiar licencia → index.html
    ↓
Activar licencia → App funcional
```

---

## 🔗 URLs Principales

| Recurso | URL |
|---------|-----|
| **App Principal** | https://finanzas.tuadministrativa.es |
| **Página de Bienvenida** | https://finanzas.tuadministrativa.es/bienvenida.html |
| **Panel Admin** | https://finanzas.tuadministrativa.es/admin-licencias.html |
| **API Status** | https://finanzas.tuadministrativa.es/api/status |
| **Webhook Gumroad** | https://finanzas.tuadministrativa.es/webhook/gumroad |

---

## 📧 Flujo del Email

### Cuando un usuario compra:

1. **Recibe email** con:
   - ✅ Saludo personalizado: "Hola [NOMBRE]"
   - ✅ Licencia visible: `TDC-2025-XXXXX`
   - ✅ Botón: "🚀 Activar Mi Licencia"
   - ✅ Instrucciones paso a paso
   - ✅ Lista de características

2. **Hace clic en el botón** → Va a:
   ```
   https://finanzas.tuadministrativa.es/bienvenida.html?license=TDC-2025-XXXXX
   ```

3. **En la página de bienvenida**:
   - ✅ Ve su licencia destacada
   - ✅ Puede copiarla con un clic
   - ✅ Lee instrucciones claras
   - ✅ Clic en "Ir a la Aplicación" → index.html

4. **En la app (index.html)**:
   - ✅ Si NO tiene licencia → Pantalla de activación
   - ✅ Pega su licencia
   - ✅ Clic en "Activar"
   - ✅ ¡App lista para usar!

---

## 🛠️ Archivos Clave

### **Frontend**
- `index.html` - App principal con pantalla de activación
- `bienvenida.html` - Página de bienvenida con licencia
- `admin-licencias.html` - Panel administrativo
- `js/license.js` - Validación de licencias
- `js/license-ui.js` - UI de activación
- `css/license.css` - Estilos de licencias

### **Backend (webhook-server/)**
- `server.py` - Servidor Flask con webhook
- `license_gen.py` - Generador de licencias
- `email_sender.py` - Envío de emails vía Resend
- `requirements.txt` - Dependencias Python

### **Configuración**
- `Dockerfile` - Configuración de Railway
- `.gitignore` - Archivos ignorados

---

## 🔐 Variables de Entorno (Railway)

```bash
RESEND_API_KEY=re_fV3u7RNF_4FPgHCE6ND8UxBK9fCZeZXUU
SENDER_EMAIL=hola@tuadministrativa.es
SENDER_NAME=Tu Administrativa
PORT=8080  # Automático en Railway
```

---

## 🧪 Cómo Probar el Sistema

### **1. Generar Licencia Manual**

```
https://finanzas.tuadministrativa.es/admin-licencias.html
```

1. Introduce un email y nombre
2. Clic en "Generar y Enviar Licencia"
3. Revisa tu inbox (y spam)
4. Sigue el flujo completo

### **2. Probar Webhook (Gumroad Ping)**

En Gumroad:
1. Ve a tu producto → Edit → Advanced
2. Webhook URL: `https://finanzas.tuadministrativa.es/webhook/gumroad`
3. Eventos: ☑️ sale
4. Clic en "Send test ping to URL"

### **3. Simular Venta con cURL**

```bash
curl -X POST https://finanzas.tuadministrativa.es/webhook/gumroad \
  -H "Content-Type: application/json" \
  -d '{
    "sale_id": "TEST_001",
    "email": "comprador@example.com",
    "full_name": "Cliente Prueba",
    "product_name": "Tu Dinero Claro",
    "order_id": "ORDER_001",
    "price": "47",
    "currency": "EUR"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "license_key": "TDC-2025-XXXXX",
  "email_sent": true,
  "message": "License generated and email sent successfully"
}
```

---

## 📝 Formato de Licencia

**Patrón:** `TDC-2025-XXXXX`

- **TDC** = Tu Dinero Claro
- **2025** = Año
- **XXXXX** = 4 caracteres aleatorios + 1 checksum

**Ejemplo:** `TDC-2025-A3G7H`

### Validación:
1. Formato correcto (regex)
2. Checksum válido (último carácter)
3. Almacenada en localStorage del navegador

---

## 🚨 Solución de Problemas

### **El email no llega**
✅ **Verificar:**
1. Dominio verificado en Resend: https://resend.com/domains
2. Variable `SENDER_EMAIL=hola@tuadministrativa.es`
3. Variable `RESEND_API_KEY` configurada
4. Logs de Railway: buscar "Email enviado"

### **La licencia no se activa**
✅ **Verificar:**
1. Formato: `TDC-2025-XXXXX`
2. Copiar/pegar sin espacios extra
3. Abrir consola del navegador (F12) → buscar errores
4. Borrar localStorage y probar de nuevo:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### **Webhook no funciona**
✅ **Verificar:**
1. URL correcta en Gumroad
2. Evento "sale" activado
3. Railway deployment "Live"
4. Logs de Railway: buscar "Webhook recibido"

---

## 📦 Actualizar el Sistema

### **Modificar el Email**

Edita `webhook-server/email_sender.py`:
- Método `_create_email_body()` → HTML del email
- Método `_create_text_body()` → Versión texto plano

Luego:
```bash
git add webhook-server/email_sender.py
git commit -m "Update email template"
git push origin main
```

Railway recompila automáticamente (1-2 min).

### **Modificar la Página de Bienvenida**

Edita `bienvenida.html` y sube a GitHub.

---

## 🎨 Personalización

### **Colores de la Marca**
- Morado principal: `#7c3aed`
- Morado claro: `#a855f7`
- Verde éxito: `#10b981`

### **Fuentes**
- Principal: `Inter` (Google Fonts)
- Licencia: `Courier New` (monospace)

---

## 📊 Estadísticas (Panel Admin)

El panel admin muestra:
- ✅ Total de licencias generadas
- ✅ Emails enviados con éxito
- ✅ Emails fallidos
- ✅ Últimas 10 licencias generadas
- ✅ Generación manual de licencias

---

## ✅ Checklist Final

- [x] Servidor Flask funcionando en Railway
- [x] Dominio `finanzas.tuadministrativa.es` configurado
- [x] Resend API configurada y verificada
- [x] Emails se envían correctamente
- [x] Página de bienvenida creada
- [x] Licencias se generan con checksum válido
- [x] Validación de licencias en frontend
- [x] Panel admin operativo
- [x] Webhook de Gumroad configurado
- [ ] **Pendiente:** Realizar venta de prueba real

---

## 🚀 Siguiente Paso

**Hacer una venta de prueba:**

1. Configura el webhook en Gumroad (si aún no lo hiciste)
2. Haz una compra de prueba (modo prueba de Gumroad)
3. Verifica que llegue el email
4. Sigue el flujo completo hasta activar la licencia
5. ¡Listo para ventas reales!

---

## 📞 Soporte

Si algo falla, revisa:
1. **Logs de Railway** → Railway Dashboard → Deployments → View Logs
2. **Logs de Resend** → https://resend.com/logs
3. **Consola del navegador** → F12 → Console

---

**Última actualización:** 2026-02-17  
**Estado:** ✅ Sistema funcional y listo para producción
