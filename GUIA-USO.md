# 📘 Guía de Uso Detallada

## Primeros Pasos

### 1. Abrir la Aplicación
1. Abre el archivo `index.html` en tu navegador
2. No necesitas instalación ni configuración
3. Todo funciona directamente en tu navegador

### 2. Probar con Datos de Ejemplo
1. Usa el archivo `ejemplo-movimientos.csv` incluido
2. Arrastralo a la zona de carga o selecciónalo con el botón
3. Verás 48 transacciones de ejemplo cargadas
4. Explora las diferentes pestañas para ver la aplicación en acción

## Uso Avanzado

### Categorización Manual

#### ¿Cuándo usarla?
- La categoría automática no es correcta
- Quieres agrupar transacciones similares
- Necesitas crear reglas personalizadas

#### Pasos:
1. Ve a **Transacciones**
2. Localiza la transacción a categorizar
3. Haz clic en la etiqueta de categoría actual
4. Se abrirá un popup con todas las categorías
5. Selecciona la nueva categoría
6. ✨ Se crea automáticamente una regla

#### Resultado:
- La transacción cambia de categoría inmediatamente
- Se crea una regla para esa descripción
- Futuras transacciones similares se categorizarán automáticamente

### Sistema de Reglas

#### ¿Qué son las reglas?
Las reglas son patrones que asocian descripciones de transacciones con categorías específicas.

#### Ejemplo:
```
Descripción: "Mercadona Compra"
Categoría: "Supermercado"
→ Todas las transacciones de Mercadona se categorizarán como Supermercado
```

#### Gestión de Reglas:
1. Ve a la pestaña **Reglas**
2. Visualiza todas tus reglas activas
3. Ve cuántas veces se ha aplicado cada regla
4. Elimina reglas que ya no necesites

#### Aplicar Reglas Manualmente:
1. Botón "Aplicar Reglas a Todas las Transacciones"
2. Útil después de crear varias reglas nuevas
3. Recategoriza todas las transacciones existentes

### Análisis de Ingresos

#### Vista de Ingresos:
1. Ve a la pestaña **Ingresos**
2. Ve el total de ingresos y número de fuentes
3. Gráfico circular muestra distribución por fuente
4. Gráfico de línea muestra evolución mensual

#### Tabla Detallada:
- **Fuente**: Origen del ingreso (Nómina, Transferencias, etc.)
- **Total**: Suma de todos los ingresos de esa fuente
- **Transacciones**: Número de ingresos de esa fuente
- **Promedio**: Importe promedio por transacción
- **Última Fecha**: Fecha del último ingreso

#### Fuentes Reconocidas Automáticamente:
- Nómina
- Transferencias Bizum
- Transferencias bancarias
- Ventas (Wallapop, Vinted)
- Devoluciones y reembolsos
- Intereses

### Análisis de Gastos

#### Vista de Gastos:
1. Ve a la pestaña **Gastos**
2. Total de gastos y número de categorías activas
3. Gráfico circular por categoría
4. Evolución mensual de gastos

#### Tabla por Categoría:
- **Categoría**: Nombre con icono
- **Total**: Suma de gastos en esa categoría
- **Transacciones**: Número de transacciones
- **Promedio**: Gasto promedio por transacción
- **% del Total**: Porcentaje del gasto total

#### Identificar Áreas de Mejora:
- Observa las categorías con mayor porcentaje
- Compara con meses anteriores
- Identifica gastos innecesarios

### Balance Mensual

#### Navegación:
1. Ve a la pestaña **Balance Mensual**
2. Usa los selectores de mes y año
3. Botones de flechas para navegación rápida

#### Resumen del Mes:
- **Ingresos del Mes**: Total de ingresos
- **Gastos del Mes**: Total de gastos
- **Balance Neto**: Diferencia (ingresos - gastos)
- **Transacciones**: Número total del mes

#### Gráfico de Evolución:
- Barras para ingresos y gastos
- Línea para balance neto
- Vista completa de todos los meses

#### Tabla Comparativa:
- Todos los meses listados
- Columnas: Ingresos, Gastos, Balance, Transacciones
- **Ahorro %**: Porcentaje de ingresos ahorrados
  - Verde: Balance positivo
  - Rojo: Balance negativo

### Búsqueda y Filtros

#### Búsqueda:
1. Escribe en el campo de búsqueda
2. Busca por descripción o importe
3. Resultados en tiempo real

#### Filtros:
- **Por Categoría**: Selecciona una categoría específica
- **Por Tipo**: Filtra solo ingresos o solo gastos
- **Combinados**: Usa múltiples filtros simultáneamente

#### Ordenación:
- Haz clic en cualquier columna para ordenar
- Primera vez: Orden descendente
- Segunda vez: Orden ascendente
- Icono indica la ordenación actual

#### Exportación:
1. Aplica los filtros deseados
2. Click en "Exportar CSV"
3. Se descarga un archivo con los resultados filtrados

## Casos de Uso

### Caso 1: Análisis Mensual
**Objetivo**: Saber cuánto gasté este mes

1. Ve a **Balance Mensual**
2. Selecciona el mes actual
3. Observa el balance neto
4. Revisa la tabla de categorías en **Gastos**

### Caso 2: Reducir Gastos
**Objetivo**: Identificar dónde gastar menos

1. Ve a **Gastos**
2. Mira el gráfico circular
3. Identifica las categorías más grandes
4. Ve a **Transacciones**
5. Filtra por esa categoría
6. Analiza transacciones individuales

### Caso 3: Organizar Ingresos
**Objetivo**: Ver de dónde viene el dinero

1. Ve a **Ingresos**
2. Revisa el gráfico por fuente
3. Comprueba la tabla detallada
4. Si hay transacciones mal clasificadas:
   - Ve a **Transacciones**
   - Filtra por "Ingresos"
   - Recategoriza si es necesario

### Caso 4: Múltiples Bancos
**Objetivo**: Consolidar cuentas de varios bancos

1. Exporta movimientos del Banco A
2. Exporta movimientos del Banco B
3. En **Dashboard**, carga ambos archivos
4. Se procesan y mezclan automáticamente
5. Análisis consolidado de todas las cuentas

### Caso 5: Preparar Declaración
**Objetivo**: Exportar datos para contabilidad

1. Ve a **Transacciones**
2. Filtra por fechas (si necesario, ajusta búsqueda)
3. Filtra por categorías relevantes
4. Click "Exportar CSV"
5. Abre el CSV en Excel o similar

## Consejos y Mejores Prácticas

### Categorización
✅ **Hacer**:
- Categoriza manualmente las transacciones importantes
- Crea reglas para comercios frecuentes
- Revisa nuevas transacciones regularmente

❌ **Evitar**:
- No categorizar nunca manualmente
- Dejar muchas transacciones en "Otros"

### Carga de Archivos
✅ **Hacer**:
- Carga archivos mensualmente
- Usa nombres descriptivos al exportar
- Mantén un respaldo de tus archivos originales

❌ **Evitar**:
- Cargar archivos con formato incorrecto
- Cargar el mismo archivo múltiples veces

### Análisis
✅ **Hacer**:
- Revisa el balance mensual regularmente
- Compara mes con mes
- Establece metas basadas en datos

❌ **Evitar**:
- Solo mirar el total sin analizar categorías
- Ignorar tendencias negativas

### Mantenimiento
✅ **Hacer**:
- Exporta tus datos regularmente
- Limpia reglas obsoletas
- Revisa categorías cada mes

❌ **Evitar**:
- Confiar solo en localStorage (haz backups)
- Acumular demasiadas reglas sin uso

## Solución Rápida de Problemas

### Problema: "Categoría incorrecta"
**Solución**: 
1. Click en la categoría
2. Selecciona la correcta
3. Se crea regla automáticamente

### Problema: "No aparece mi banco"
**Solución**:
- La app funciona con cualquier banco
- Solo necesita: Fecha, Descripción, Importe
- Formatos: CSV o Excel

### Problema: "Gráficos vacíos"
**Solución**:
1. Verifica que hay transacciones cargadas
2. Recarga la página (F5)
3. Prueba con el archivo de ejemplo

### Problema: "Reglas no se aplican"
**Solución**:
1. Ve a **Reglas**
2. Click "Aplicar Reglas a Todas las Transacciones"
3. Las reglas se aplicarán inmediatamente

### Problema: "Datos perdidos"
**Solución**:
- Los datos están en localStorage del navegador
- No borres caché/cookies
- Exporta regularmente como backup

## Atajos de Teclado

Aunque no hay atajos específicos implementados, puedes usar:
- `Ctrl + F` → Buscar en la página
- `F5` → Recargar aplicación
- `F12` → Abrir consola (para debugging)

## Glosario

- **Balance**: Diferencia entre ingresos y gastos
- **Categoría**: Clasificación de una transacción
- **Regla**: Patrón que automatiza la categorización
- **Fuente**: Origen de un ingreso
- **localStorage**: Almacenamiento local del navegador

## Preguntas Frecuentes

**P: ¿Es seguro?**
R: Sí, todo se procesa localmente en tu navegador. Nada se envía a internet.

**P: ¿Funciona offline?**
R: Sí, una vez cargada la página no necesita conexión.

**P: ¿Cuántas transacciones soporta?**
R: Miles. Limitado por localStorage (~5-10MB).

**P: ¿Puedo usar en móvil?**
R: Sí, es totalmente responsive.

**P: ¿Necesito instalar algo?**
R: No, solo un navegador moderno.

**P: ¿Cuesta dinero?**
R: No, es completamente gratuito.

**P: ¿Puedo compartir con mi familia?**
R: Sí, comparte los archivos HTML. Cada navegador tendrá sus propios datos.

---

**¿Necesitas más ayuda?** Consulta el README.md o la documentación técnica.
