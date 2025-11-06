# 🔧 Solución de Problemas - Carga de Archivos

## 🚨 "El archivo no se carga" o "No se encontraron transacciones"

Si tu archivo bancario no se carga correctamente, sigue estos pasos:

### 1️⃣ Verifica el Formato del Archivo

#### Formatos Aceptados
- ✅ **CSV** (`.csv`)
- ✅ **Excel** (`.xls`, `.xlsx`)

#### Estructura Requerida
Tu archivo DEBE tener al menos estas 3 columnas:

1. **Fecha** (puede llamarse: Fecha, Date, Fecha Operación, F.Valor, etc.)
2. **Descripción** (puede llamarse: Descripción, Concepto, Detalle, Movimiento, etc.)
3. **Importe** (puede llamarse: Importe, Amount, Cantidad, Cargo/Abono, etc.)

### 2️⃣ Abre tu Archivo en Excel

1. **Abre** el archivo con Excel o LibreOffice
2. **Verifica** que tenga datos
3. **Identifica** las columnas de Fecha, Descripción e Importe
4. **Elimina** filas vacías al principio si las hay
5. **Asegúrate** de que la primera fila con datos sea el encabezado

### 3️⃣ Formato de Ejemplo

Tu archivo debería verse así:

```
| Fecha      | Descripción           | Importe  |
|------------|-----------------------|----------|
| 01/01/2024 | Supermercado Día      | -45.50   |
| 02/01/2024 | Nómina Empresa        | 2500.00  |
| 03/01/2024 | Restaurante Central   | -35.80   |
```

### 4️⃣ Problemas Comunes y Soluciones

#### ❌ Problema: "No se pudieron identificar las columnas"

**Causa**: Los nombres de las columnas no son reconocidos

**Solución**:
1. Abre el archivo en Excel
2. Renombra los encabezados a nombres simples:
   - `Fecha` para la columna de fechas
   - `Descripción` o `Concepto` para descripciones
   - `Importe` para los importes
3. Guarda y vuelve a intentar

#### ❌ Problema: "El archivo está vacío"

**Causa**: No hay datos después del encabezado

**Solución**:
1. Verifica que haya filas con transacciones
2. Elimina filas totalmente vacías
3. Asegúrate de que las celdas no estén en blanco

#### ❌ Problema: "Error al leer el archivo"

**Causa**: Archivo corrupto o formato no estándar

**Solución**:
1. Abre el archivo en Excel
2. Guárdalo como **CSV** (Archivo → Guardar como → CSV UTF-8)
3. Intenta cargar el nuevo archivo CSV

#### ❌ Problema: Fechas incorrectas

**Causa**: Formato de fecha no reconocido

**Solución**:
Formatos de fecha soportados:
- `DD/MM/YYYY` (15/01/2024)
- `DD-MM-YYYY` (15-01-2024)
- `YYYY-MM-DD` (2024-01-15)
- Números de Excel (automático)

Si tu fecha no está en estos formatos:
1. Abre en Excel
2. Formatea la columna de fecha como `DD/MM/YYYY`
3. Guarda y recarga

#### ❌ Problema: Importes no se leen

**Causa**: Formato de número no reconocido

**Solución**:
Formatos de importe soportados:
- `1234.56` (punto decimal)
- `1234,56` (coma decimal europeo)
- `-1234.56` (negativos con signo)
- `(1234.56)` (negativos con paréntesis)
- `1.234,56` (con separador de miles)

Si tus importes tienen formato especial:
1. Formatea la columna como Número en Excel
2. Asegúrate de que los negativos tengan signo `-`

### 5️⃣ Método Alternativo: Convertir a CSV

Si nada funciona, convierte tu archivo a CSV manualmente:

1. **Abre** tu archivo Excel
2. **Archivo** → **Guardar como**
3. **Tipo**: Selecciona `CSV (separado por comas) (*.csv)` o `CSV UTF-8`
4. **Guardar**
5. Intenta cargar el archivo CSV en la aplicación

### 6️⃣ Ver los Errores en Detalle

Para ver exactamente qué está fallando:

1. **Presiona F12** en tu navegador (abre la consola)
2. Ve a la pestaña **Console**
3. Intenta cargar el archivo de nuevo
4. Lee los mensajes que aparecen en rojo

Los mensajes te dirán:
- ✅ Qué columnas se identificaron
- ❌ Qué filas tienen errores
- ⚠️ Qué campos no se pudieron parsear

### 7️⃣ Ejemplo de Archivo Correcto

Descarga y compara con el archivo de ejemplo incluido: `ejemplo-movimientos.csv`

Este archivo funciona perfectamente. Compara su estructura con la de tu archivo.

### 8️⃣ Exportar desde tu Banco

#### BBVA
1. Accede a Movimientos
2. Selecciona rango de fechas
3. **Descargar** → **Excel** o **CSV**

#### Santander
1. Movimientos y extractos
2. Selecciona período
3. **Exportar** → **Excel**

#### CaixaBank
1. Posición global → Cuenta
2. Movimientos → Descargar
3. Formato: **Excel**

#### ING
1. Extractos y documentos
2. Movimientos
3. **Descargar CSV**

#### Bankinter
1. Mis cuentas → Detalle
2. Movimientos
3. **Descargar Excel**

### 9️⃣ Formato Manual de CSV

Si quieres crear un CSV manualmente, el formato es:

```csv
Fecha,Descripción,Importe
15/01/2024,Mercadona Compra,-85.50
16/01/2024,Nómina Empresa,2500.00
17/01/2024,Gasolina Repsol,-65.00
```

**Importante**:
- Primera fila = encabezados
- Separador = coma (`,`)
- Fecha en formato DD/MM/YYYY
- Importes negativos con signo menos
- Sin espacios extra

### 🔟 Últimas Opciones

#### Opción A: Simplifica el Archivo
1. Crea un nuevo Excel
2. Copia SOLO 3 columnas: Fecha, Descripción, Importe
3. Pega solo los valores (sin fórmulas)
4. Guarda como CSV
5. Intenta cargar

#### Opción B: Prueba con Pocas Filas
1. Copia solo 5-10 transacciones
2. Pégalas en un nuevo archivo
3. Si esto funciona, el problema está en alguna fila específica
4. Ve añadiendo más filas para encontrar la problemática

#### Opción C: Comparte el Formato
Si nada funciona, el problema puede ser un formato muy específico de tu banco.

**¿Qué hacer?**
1. Abre F12 → Console
2. Copia los mensajes de error
3. Toma una captura del Excel (sin datos sensibles)
4. Comparte el formato para que podamos ayudarte

## 📝 Checklist Rápido

Antes de cargar el archivo, verifica:

- [ ] ¿El archivo es CSV o Excel?
- [ ] ¿Tiene columnas de Fecha, Descripción, Importe?
- [ ] ¿Los encabezados están en la primera fila?
- [ ] ¿Hay al menos 2-3 transacciones?
- [ ] ¿Las fechas tienen formato DD/MM/YYYY?
- [ ] ¿Los importes son números?
- [ ] ¿No hay filas completamente vacías entre los datos?
- [ ] ¿El archivo se abre correctamente en Excel?

Si todas las respuestas son SÍ, el archivo debería cargarse correctamente.

## 🆘 Soporte

### Mensajes de Error Comunes

#### "No se pudieron identificar las columnas necesarias"
→ Renombra las columnas a: `Fecha`, `Descripción`, `Importe`

#### "No se encontraron transacciones en el archivo"
→ Verifica que haya datos después del encabezado

#### "Error al leer el archivo"
→ Intenta guardarlo como CSV UTF-8

#### "Fecha inválida"
→ Usa formato DD/MM/YYYY

#### "Importe inválido"
→ Asegúrate de que sean números con signo

### Debug Avanzado

Abre la consola del navegador (F12) y busca estos mensajes:

- `📊 Datos del Excel:` → Muestra las primeras filas detectadas
- `✅ Encabezados encontrados en fila X:` → Confirma dónde están los encabezados
- `✅ Columnas identificadas:` → Muestra qué columnas se reconocieron
- `⚠️ Fila incompleta:` → Indica filas con datos faltantes
- `✅ X transacciones extraídas` → Confirmación de éxito

## 💡 Tips Adicionales

### Para Archivos Grandes
- Si tu archivo tiene más de 1000 transacciones, puede tardar unos segundos
- Sé paciente, verás el progreso en las notificaciones

### Para Múltiples Bancos
- Puedes cargar archivos de diferentes bancos
- Se procesarán todos juntos
- Cada uno puede tener formato diferente

### Para Archivos Viejos
- Archivos Excel muy antiguos (.xls) pueden tener problemas
- Intenta abrirlos en Excel y guardarlos como .xlsx nuevo

---

## ✅ ¿Todo Listo?

Si seguiste estos pasos y el archivo aún no carga:

1. Prueba con el archivo de ejemplo incluido
2. Si el ejemplo funciona, el problema está en tu archivo
3. Compara tu archivo con el ejemplo
4. Aplica las correcciones necesarias

**¡El 99% de los problemas se solucionan siguiendo estos pasos!** 🎉
