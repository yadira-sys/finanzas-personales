# 💰 Analizador de Finanzas Personales

Una aplicación web completa y avanzada para analizar tus finanzas personales con múltiples bancos, categorización automática inteligente y visualizaciones detalladas.

## 🌟 Características Principales

### 📊 Sistema de Pestañas Organizado
- **Dashboard**: Vista general con métricas clave y gráficos principales
- **Ingresos**: Análisis detallado de fuentes de ingreso
- **Gastos**: Desglose de gastos por categoría
- **Balance Mensual**: Comparativas mes a mes
- **Reglas**: Gestión de categorización automática
- **Transacciones**: Tabla completa con búsqueda y filtros

### 🎯 Categorización Inteligente
- **40+ categorías** predefinidas adaptadas al mercado español
- **Categorización automática** basada en palabras clave
- **Categorización manual** con editor inline intuitivo
- **Sistema de reglas** que memoriza tus categorizaciones
- **Aplicación automática** de reglas a nuevas transacciones

### 📈 Visualizaciones Avanzadas
- Ingresos vs Gastos mensuales
- Distribución de gastos por categoría
- Tendencia de balance acumulado
- Top 10 categorías de gasto
- Ingresos por fuente con gráfico circular
- Evolución mensual de ingresos y gastos
- Comparativa mensual con línea de balance

### 💡 Gestión de Ingresos
- **Agrupación por fuente**: Identifica de dónde vienen tus ingresos
- **Análisis detallado**: Tabla con totales, promedios y última fecha
- **Gráficos dedicados**: Visualiza tus fuentes de ingreso
- **Promedio mensual**: Calcula automáticamente ingresos promedio

### 📅 Balance Mensual
- **Selector de mes/año**: Navega fácilmente entre meses
- **Resumen del mes**: Ingresos, gastos, balance neto
- **Tabla comparativa**: Todos los meses con porcentaje de ahorro
- **Gráfico de evolución**: Visualiza la tendencia de tus finanzas

### ⚙️ Sistema de Reglas Automáticas
- **Creación automática**: Se generan al categorizar manualmente
- **Persistencia**: Se guardan en localStorage
- **Gestión completa**: Ver, editar, eliminar reglas
- **Estadísticas**: Contador de aplicaciones por regla
- **Reaplicación**: Recategoriza todas las transacciones

### 🔍 Búsqueda y Filtros Avanzados
- Búsqueda en tiempo real por descripción o importe
- Filtro por categoría
- Filtro por tipo (ingresos/gastos)
- Ordenación por cualquier columna
- Contador de resultados filtrados

### 📤 Importación y Exportación
- **Multi-formato**: CSV, Excel (.xlsx, .xls)
- **Multi-banco**: Carga archivos de diferentes bancos
- **Detección automática**: Identifica delimitadores y formatos
- **Exportación CSV**: Descarga tus datos procesados
- **Drag & drop**: Arrastra archivos para cargarlos

### 🔔 Sistema de Notificaciones
- Notificaciones visuales elegantes
- Feedback inmediato de acciones
- Notifica reglas aplicadas automáticamente
- Mensajes de éxito, error, advertencia e información

### 🔒 Privacidad Total
- **100% local**: Todo se procesa en tu navegador
- **Sin servidores**: No se envía nada a internet
- **localStorage**: Tus datos permanecen en tu dispositivo
- **Control total**: Exporta o borra cuando quieras

## 📁 Estructura del Proyecto

```
finance-analyzer/
├── index.html              # Estructura HTML con pestañas
├── css/
│   └── style.css          # Estilos completos responsive
├── js/
│   ├── app.js             # Lógica principal de la aplicación
│   ├── categories.js      # Sistema de categorías (40+)
│   ├── parser.js          # Parser CSV/Excel inteligente
│   ├── charts.js          # Gestión de gráficos Chart.js
│   └── rules.js           # Sistema de reglas automáticas
└── README.md              # Esta documentación
```

## 🚀 Cómo Usar

### 1. Carga de Archivos

1. Ve a la pestaña **Dashboard**
2. Arrastra tus archivos CSV o Excel o haz clic en "Seleccionar Archivos"
3. Puedes cargar múltiples archivos de diferentes bancos
4. La aplicación detectará automáticamente el formato

### 2. Categorización de Transacciones

#### Automática
- Al cargar archivos, se categorizan automáticamente usando 40+ categorías
- Las reglas previas se aplican automáticamente

#### Manual
1. Ve a la pestaña **Transacciones**
2. Haz clic en la categoría de cualquier transacción
3. Selecciona la nueva categoría en el popup
4. Se crea automáticamente una regla para esa descripción

### 3. Gestión de Reglas

1. Ve a la pestaña **Reglas**
2. Visualiza todas las reglas activas
3. Ve estadísticas de uso de cada regla
4. Elimina reglas individuales o todas a la vez
5. Reaplica reglas a todas las transacciones

### 4. Análisis de Datos

#### Dashboard
- Vista general con 4 tarjetas de métricas
- 4 gráficos principales de análisis

#### Ingresos
- Total de ingresos y número de fuentes
- Gráfico circular por fuente
- Evolución mensual
- Tabla detallada con promedios

#### Gastos
- Total de gastos y categorías activas
- Gráfico circular por categoría
- Evolución mensual
- Tabla con porcentajes

#### Balance Mensual
- Selector para navegar entre meses
- Resumen del mes seleccionado
- Gráfico de evolución completa
- Tabla comparativa de todos los meses

### 5. Búsqueda y Filtros

1. Ve a la pestaña **Transacciones**
2. Usa el buscador para encontrar transacciones
3. Filtra por categoría o tipo
4. Ordena haciendo clic en las columnas
5. Exporta los resultados filtrados

## 💾 Exportación de Datos Bancarios

### Bancos Españoles Principales

#### BBVA
1. Accede a tu banca online
2. Menú → Cuentas → Selecciona cuenta
3. Movimientos → Exportar
4. Formato: CSV o Excel
5. Selecciona rango de fechas

#### Santander
1. Entra en la cuenta
2. Movimientos y extractos
3. Exportar movimientos
4. Formato recomendado: Excel

#### CaixaBank
1. Posición global → Cuenta
2. Movimientos
3. Descargar → Excel/CSV

#### ING
1. Extractos y documentos
2. Movimientos
3. Descargar CSV

#### Bankinter
1. Mis cuentas → Detalle
2. Movimientos
3. Descargar Excel

### Formatos Soportados

La aplicación detecta automáticamente:
- **Delimitadores**: `,` `;` `|` `\t`
- **Fechas**: DD/MM/YYYY, YYYY-MM-DD, fechas Excel
- **Importes**: Formato europeo (1.234,56) y anglosajón (1,234.56)
- **Columnas**: Fecha, Descripción, Importe, Balance

## 📊 Categorías Disponibles

### Alimentación
- Supermercado, Restaurantes, Comida Rápida

### Transporte
- Transporte Público, Gasolina, Taxi, Parking

### Vivienda
- Alquiler, Hipoteca, Suministros, Internet y Teléfono, Comunidad

### Compras
- Ropa y Calzado, Hogar y Muebles, Tecnología, Farmacia

### Salud
- Salud, Gimnasio, Peluquería

### Entretenimiento
- Ocio, Streaming, Viajes, Libros

### Financiero
- Seguros, Seguro Coche, Ahorro, Transferencia, Préstamos

### Otros
- Educación, Mascotas, Impuestos, Donaciones, Suscripciones, Cajero, Comisiones

### Ingresos
- Nómina, Venta, Reembolso

## 🎨 Tecnologías Utilizadas

- **HTML5**: Estructura semántica moderna
- **CSS3**: Diseño responsive con gradientes
- **JavaScript ES6+**: Lógica de aplicación
- **Chart.js 4.4**: Gráficos interactivos
- **SheetJS (XLSX)**: Procesamiento de Excel
- **Font Awesome 6.4**: Iconos
- **Google Fonts (Inter)**: Tipografía

## ⚡ Características Técnicas

### Rendimiento
- Procesamiento local ultrarrápido
- Sin dependencias de red
- Almacenamiento eficiente con localStorage
- Gráficos optimizados con Chart.js

### Compatibilidad
- Todos los navegadores modernos
- Chrome, Firefox, Safari, Edge
- Responsive: Desktop, Tablet, Mobile

### Persistencia
- Transacciones en localStorage
- Reglas en localStorage
- Recuperación automática al recargar

## 🔧 Gestión de Datos

### Borrar Datos
- Botón "Borrar Datos" en el header
- Confirmación antes de eliminar
- Borra transacciones (mantiene reglas)

### Borrar Reglas
- Botón en pestaña "Reglas"
- Eliminar reglas individuales
- Borrar todas las reglas a la vez

### Exportar
- Exporta transacciones filtradas a CSV
- Incluye todas las columnas procesadas
- Nombre automático con fecha

## 📱 Responsive Design

- **Desktop**: Vista completa con todos los gráficos
- **Tablet**: Diseño adaptado optimizado
- **Mobile**: 
  - Pestañas con solo iconos
  - Gráficos apilados verticalmente
  - Tablas con scroll horizontal
  - Botones optimizados

## 🆘 Solución de Problemas

### Los archivos no se cargan
- Verifica que el formato sea CSV o Excel
- Asegúrate de que tenga columnas de fecha, descripción e importe
- Prueba con el archivo de ejemplo incluido

### Las categorías no son correctas
- Usa la categorización manual
- Se creará una regla automáticamente
- Aplica las reglas a todas las transacciones

### Los gráficos no se muestran
- Verifica que haya transacciones cargadas
- Comprueba la consola del navegador (F12)
- Recarga la página

### Se perdieron los datos
- Los datos se guardan en localStorage
- No borres el caché del navegador
- Exporta regularmente tus datos

## 🎯 Roadmap Futuro

### Funcionalidades Planeadas
- [ ] Presupuestos por categoría
- [ ] Metas de ahorro
- [ ] Alertas personalizables
- [ ] Comparación año sobre año
- [ ] Proyecciones futuras
- [ ] Importación de reglas
- [ ] Temas de color personalizables
- [ ] Múltiples cuentas bancarias
- [ ] Exportación a PDF

### Mejoras Técnicas
- [ ] Progressive Web App (PWA)
- [ ] Modo offline completo
- [ ] Sincronización en la nube (opcional)
- [ ] Encriptación de datos

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
- Abre un issue en GitHub
- Incluye capturas de pantalla si es posible
- Describe los pasos para reproducir el problema

## 🙏 Agradecimientos

- Chart.js por los gráficos increíbles
- SheetJS por el procesamiento de Excel
- Font Awesome por los iconos
- La comunidad de desarrolladores web

---

## 🏁 Estado del Proyecto

### ✅ Completado

1. ✅ Sistema de pestañas completo (6 pestañas)
2. ✅ Categorización automática (40+ categorías)
3. ✅ Categorización manual con editor inline
4. ✅ Sistema de reglas con memoria
5. ✅ Agrupación de ingresos por fuente
6. ✅ Balance mensual con selector
7. ✅ Gráficos avanzados (9 tipos)
8. ✅ Búsqueda y filtros en tiempo real
9. ✅ Exportación a CSV
10. ✅ Sistema de notificaciones
11. ✅ Responsive design completo
12. ✅ Persistencia en localStorage
13. ✅ Parser multi-formato (CSV, Excel)
14. ✅ Documentación completa

### 🎉 Listo para Usar

La aplicación está **100% funcional** y lista para analizar tus finanzas personales. Solo abre `index.html` en tu navegador y comienza a cargar tus datos bancarios.

**¡Toma el control de tus finanzas hoy mismo!** 💪💰
