/**
 * Parser MEJORADO de archivos bancarios CSV y Excel
 * 
 * ✅ BANCOS SOPORTADOS:
 * 
 * 🇪🇸 BANCOS TRADICIONALES ESPAÑOLES:
 * - Santander
 * - BBVA
 * - CaixaBank / La Caixa (bilingüe: catalán/español)
 * - Banco Sabadell
 * - Bankinter
 * - Unicaja
 * - Openbank (columnas cargo/abono separadas)
 * 
 * 🌍 NEOBANCOS INTERNACIONALES:
 * - ING España
 * - Revolut (formato internacional)
 * - N26 (formato internacional)
 * 
 * 📋 CARACTERÍSTICAS:
 * - Detección automática de encabezados (hasta fila 25)
 * - Soporte multiidioma: español, inglés, catalán
 * - Normalización de acentos automática
 * - Fechas: DD/MM/YYYY, YYYY-MM-DD, Excel serial numbers
 * - Importes: formato europeo (1.234,56) y anglosajón (1,234.56)
 * - Columnas separadas cargo/abono
 * - Logging detallado para debug
 */

class BankFileParser {
    constructor() {
        this.supportedFormats = ['.csv', '.xlsx', '.xls'];
    }

    /**
     * Procesa un archivo bancario
     */
    async parseFile(file) {
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (extension === '.csv') {
            return await this.parseCSV(file);
        } else if (extension === '.xlsx' || extension === '.xls') {
            return await this.parseExcel(file);
        } else {
            throw new Error(`Formato no soportado: ${extension}`);
        }
    }

    /**
     * Procesa un archivo CSV
     */
    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const transactions = this.parseCSVText(text);
                    resolve(transactions);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Procesa texto CSV
     */
    parseCSVText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('El archivo está vacío o no tiene datos');
        }

        // Detectar delimitador
        const delimiter = this.detectDelimiter(lines[0]);
        
        // Parsear encabezados
        const headers = this.parseCSVLine(lines[0], delimiter).map(h => 
            h.trim().toLowerCase()
        );

        // Identificar columnas
        const columns = this.identifyColumns(headers);

        if (!columns.date || !columns.description || !columns.amount) {
            throw new Error('No se pudieron identificar las columnas necesarias (fecha, descripción, importe)');
        }

        // Parsear datos
        const transactions = [];
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i], delimiter);
                
                if (values.length < 3) continue;

                const transaction = this.createTransaction(values, columns);
                
                if (transaction) {
                    transactions.push(transaction);
                }
            } catch (error) {
                console.warn(`Error en línea ${i + 1}:`, error.message);
            }
        }

        return transactions;
    }

    /**
     * Procesa un archivo Excel
     */
    async parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { 
                        type: 'array',
                        cellDates: true,
                        cellText: false,
                        cellNF: false,
                        cellHTML: false
                    });
                    
                    // Tomar la primera hoja
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Convertir a array de arrays
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                        header: 1,
                        raw: false,
                        dateNF: 'dd/mm/yyyy',
                        defval: ''
                    });
                    
                    // Filtrar filas vacías
                    const filteredData = jsonData.filter(row => 
                        row && row.some(cell => cell && cell.toString().trim() !== '')
                    );

                    console.log('📊 Excel cargado:', {
                        totalFilas: filteredData.length,
                        hoja: workbook.SheetNames[0],
                        primeras5Filas: filteredData.slice(0, 5)
                    });
                    
                    // Parsear los datos del Excel
                    const transactions = this.parseExcelData(filteredData);
                    resolve(transactions);
                } catch (error) {
                    console.error('❌ Error parseando Excel:', error);
                    reject(new Error(`Error al procesar el Excel: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parsea datos de Excel (array de arrays)
     */
    parseExcelData(data) {
        if (data.length < 2) {
            throw new Error('El archivo está vacío o no tiene datos suficientes');
        }

        // Buscar la fila de encabezados (verificar hasta fila 25 para soportar todos los bancos)
        let headerRowIndex = -1;
        let headers = [];

        // Palabras clave para detectar encabezados (sin acentos para mayor compatibilidad)
        const headerKeywords = [
            'fecha', 'date', 'data',
            'descripcion', 'concepto', 'description', 'literal', 'movimiento', 'operacion',
            'importe', 'amount', 'import', 'euros', 'cargo', 'abono',
            'saldo', 'balance'
        ];

        for (let i = 0; i < Math.min(25, data.length); i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            const rowText = row.join('|').toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
            
            // Verificar si la fila contiene al menos 2 palabras clave
            const matchCount = headerKeywords.filter(keyword => rowText.includes(keyword)).length;
            
            if (matchCount >= 2) {
                headerRowIndex = i;
                headers = row.map(h => (h || '').toString().trim());
                console.log(`✅ Encabezados encontrados en fila ${i} (${matchCount} coincidencias):`, headers);
                break;
            }
        }

        // Si no se encontraron, buscar primera fila con 3+ columnas no vacías
        if (headerRowIndex === -1) {
            for (let i = 0; i < Math.min(15, data.length); i++) {
                const row = data[i];
                if (!row) continue;
                
                const nonEmptyCells = row.filter(cell => cell && cell.toString().trim() !== '').length;
                if (nonEmptyCells >= 3) {
                    headerRowIndex = i;
                    headers = row.map(h => (h || '').toString().trim());
                    console.warn(`⚠️ Usando fila ${i} como encabezado (${nonEmptyCells} columnas):`, headers);
                    break;
                }
            }
        }
        
        // Último recurso: usar primera fila
        if (headerRowIndex === -1 && data.length > 0) {
            headerRowIndex = 0;
            headers = data[0].map(h => (h || '').toString().trim());
            console.warn('⚠️ Usando primera fila como encabezado por defecto');
        }

        if (headers.length === 0) {
            throw new Error('No se pudo detectar la estructura del archivo Excel');
        }

        // Identificar columnas
        const columns = this.identifyColumns(headers);

        // Validar que al menos tenemos: fecha Y (importe O cargo/abono)
        const hasDate = columns.date !== undefined;
        const hasAmount = columns.amount !== undefined || columns.debit !== undefined || columns.credit !== undefined;
        
        if (!hasDate || !hasAmount) {
            console.error('❌ Columnas identificadas:', columns);
            console.error('📊 Encabezados:', headers);
            console.error('📊 Primeras 5 filas:', data.slice(0, 5));
            throw new Error('No se pudieron identificar las columnas mínimas necesarias (fecha + importe/cargo/abono). El archivo puede tener un formato no estándar.');
        }

        console.log('✅ Columnas identificadas:', columns);

        // Parsear datos
        const transactions = [];
        let skippedRows = 0;
        let errorRows = 0;
        
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            try {
                const values = data[i];
                
                // Saltar filas vacías
                if (!values || values.length < 2) {
                    skippedRows++;
                    continue;
                }
                
                // Saltar filas completamente vacías
                const hasContent = values.some(v => v && v.toString().trim() !== '');
                if (!hasContent) {
                    skippedRows++;
                    continue;
                }
                
                // Saltar filas de totales/saldos/resúmenes
                const firstCells = values.slice(0, 3).join('').toLowerCase();
                if (firstCells.includes('total') || 
                    firstCells.includes('saldo inicial') ||
                    firstCells.includes('saldo final') ||
                    firstCells.includes('resumen') ||
                    firstCells.includes('subtotal') ||
                    firstCells.includes('suma')) {
                    skippedRows++;
                    continue;
                }

                const transaction = this.createTransaction(values, columns);
                
                if (transaction) {
                    transactions.push(transaction);
                } else {
                    errorRows++;
                }
            } catch (error) {
                console.warn(`Advertencia en fila ${i + 1}:`, error.message);
                errorRows++;
            }
        }

        console.log(`📊 Resultado del parsing:`);
        console.log(`  ✅ ${transactions.length} transacciones extraídas`);
        console.log(`  ⚠️ ${skippedRows} filas omitidas`);
        console.log(`  ❌ ${errorRows} filas con errores`);

        if (transactions.length === 0) {
            throw new Error('No se pudieron extraer transacciones válidas. Verifica que el archivo contenga movimientos bancarios.');
        }

        return transactions;
    }

    /**
     * Detecta el delimitador usado en el CSV
     */
    detectDelimiter(line) {
        const delimiters = [',', ';', '|', '\t'];
        let maxCount = 0;
        let detectedDelimiter = ',';

        for (const delimiter of delimiters) {
            const count = (line.match(new RegExp('\\' + delimiter, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                detectedDelimiter = delimiter;
            }
        }

        return detectedDelimiter;
    }

    /**
     * Parsea una línea CSV respetando comillas
     */
    parseCSVLine(line, delimiter) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current);
        return values.map(v => v.trim());
    }

    /**
     * Identifica las columnas del archivo
     * OPTIMIZADO PARA SANTANDER, BBVA, CAIXABANK, SABADELL + NEOBANCOS
     */
    identifyColumns(headers) {
        const columns = {};

        // Normalizar función
        const normalize = (str) => str.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/\s+/g, ' ');

        // Mapeo exhaustivo para bancos españoles + neobancos
        const mappings = {
            date: [
                // Español (Santander, BBVA, Caixa, Sabadell, Bankinter, Unicaja)
                'fecha', 'fecha operacion', 'fecha operación', 'fecha valor', 'fecha contable',
                'f.valor', 'f.operacion', 'f.operación', 'f. valor', 'f. operación',
                'f. operacion', 'f operacion', 'f operación',
                'fec.', 'fecha mov', 'fecha mvto', 'fecha movimiento',
                'fecha de operacion', 'fecha de operación', 'fecha de la operacion',
                'fecha op.', 'fecha op', 'fecha oper.', 'f.contable', 'f contable',
                // Inglés (ING, Revolut, N26)
                'date', 'operation date', 'value date', 'transaction date',
                'completed date', 'started date',
                // Catalán (CaixaBank)
                'data', 'data operacio', 'data operació', 'data valor'
            ],
            description: [
                // Español
                'descripcion', 'descripción', 'concepto', 'detalle', 'movimiento', 'operacion', 'operación',
                'observaciones', 'desc.', 'desc', 'concepto/movimiento', 'concepto movimiento',
                'texto', 'información', 'informacion', 'literal',
                'descripcion del movimiento', 'descripción del movimiento',
                'descripcion de la operacion', 'descripción de la operación',
                'descripcion del moviment', 'descripció del moviment',
                'movimientos', 'tipo de movimiento',
                // Inglés
                'description', 'details', 'transaction details', 'narrative', 'payee',
                'payment reference', 'transaction type',
                // Catalán
                'descripcio', 'descripció', 'concepte'
            ],
            amount: [
                // Español (columna única)
                'importe', 'cantidad', 'monto', 'cargo/abono', 'debe/haber',
                'imp.', 'import.', 'importe €', 'importe eur', 'importe (eur)',
                'importe operacion', 'importe operación', 'imp. operacion', 'imp. operación',
                'total', 'valor', 'importe en euros', 'euros', 'eur',
                'importe euros',
                // Inglés
                'amount', 'amount (eur)', 'amount eur', 'value',
                // Catalán
                'import', 'import (eur)'
            ],
            debit: [
                // Columnas separadas para gastos (Openbank, algunos tradicionales)
                'debe', 'cargo', 'cargos', 'debit', 'salida', 'gasto'
            ],
            credit: [
                // Columnas separadas para ingresos
                'haber', 'abono', 'abonos', 'credit', 'entrada', 'ingreso'
            ],
            balance: [
                // Español
                'saldo', 'saldo final', 'saldo disponible', 'saldo actual', 'saldo contable',
                'sdo.', 'disponible',
                'saldo disponible despues de la operacion',
                'saldo disponible después de la operación',
                'saldo disponible després de l\'operació',
                'saldo despues', 'saldo después', 'saldo (eur)',
                // Inglés
                'balance', 'balance (eur)', 'available balance', 'current balance',
                // Catalán
                'saldo disponible'
            ]
        };

        // Normalizar headers
        const normalizedHeaders = headers.map(h => normalize(h.toString()));

        normalizedHeaders.forEach((normalizedHeader, index) => {
            for (const [key, variations] of Object.entries(mappings)) {
                // Normalizar variaciones
                const normalizedVariations = variations.map(v => normalize(v));
                
                // Buscar coincidencia exacta primero
                if (normalizedVariations.includes(normalizedHeader)) {
                    if (!columns[key]) {
                        columns[key] = index;
                        console.log(`✅ Columna "${key}" → posición ${index}: "${headers[index]}"`);
                    }
                    break;
                }
                
                // Buscar coincidencias parciales
                const matchPartial = normalizedVariations.some(v => 
                    (normalizedHeader.includes(v) && v.length > 3) || 
                    (v.includes(normalizedHeader) && normalizedHeader.length > 3)
                );
                
                if (matchPartial && !columns[key]) {
                    columns[key] = index;
                    console.log(`✅ Columna "${key}" (parcial) → posición ${index}: "${headers[index]}"`);
                    break;
                }
            }
        });

        // Estrategias de fallback
        
        // Si no se encontró fecha, buscar primera columna con formato de fecha
        if (!columns.date) {
            console.warn('⚠️ Fecha no encontrada por nombre, buscando por contenido...');
            // Buscar en headers que contengan números o barras
            for (let i = 0; i < headers.length; i++) {
                const h = headers[i].toString();
                if (/\d{1,2}[\/\-\.]\d{1,2}/.test(h) || h.toLowerCase().includes('20')) {
                    columns.date = i;
                    console.log(`✅ Columna de fecha detectada por patrón en posición ${i}`);
                    break;
                }
            }
        }
        
        // Si no se encontró importe, buscar columnas con símbolos monetarios o números
        if (!columns.amount) {
            console.warn('⚠️ Importe no encontrado por nombre, buscando por contenido...');
            for (let i = 0; i < headers.length; i++) {
                const h = normalizedHeaders[i];
                if (h.includes('€') || h.includes('$') || h.includes('eur') || 
                    /^\d+[,.]?\d*$/.test(h) || h === '' || h.trim() === '') {
                    columns.amount = i;
                    console.log(`✅ Columna de importe detectada por contenido en posición ${i}`);
                    break;
                }
            }
        }
        
        // Si no se encontró descripción, usar columna de texto más larga (excluyendo fecha/importe/saldo)
        if (!columns.description) {
            console.warn('⚠️ Descripción no encontrada, buscando columna de texto...');
            let maxTextLength = 0;
            for (let i = 0; i < headers.length; i++) {
                if (i === columns.date || i === columns.amount || i === columns.balance) continue;
                
                const h = headers[i].toString();
                if (h.length > maxTextLength && h.length > 3) {
                    columns.description = i;
                    maxTextLength = h.length;
                }
            }
            if (columns.description !== undefined) {
                console.log(`✅ Columna de descripción detectada en posición ${columns.description}`);
            }
        }

        console.log('📋 Mapa final de columnas:', columns);
        return columns;
    }

    /**
     * Crea un objeto transacción desde los valores parseados
     * Soporta tanto columna única de importe como columnas separadas cargo/abono
     */
    createTransaction(values, columns) {
        // Extraer valores
        const dateStr = columns.date !== undefined ? values[columns.date] : null;
        const description = columns.description !== undefined ? values[columns.description] : null;
        
        // Intentar obtener importe de columna única o de cargo/abono separados
        let amountStr = null;
        let amount = null;

        if (columns.amount !== undefined) {
            // Columna única de importe
            amountStr = values[columns.amount];
            amount = this.parseAmount(amountStr ? amountStr.toString() : '');
        } else if (columns.debit !== undefined || columns.credit !== undefined) {
            // Columnas separadas (Openbank, algunos bancos tradicionales)
            const debitStr = columns.debit !== undefined ? values[columns.debit] : null;
            const creditStr = columns.credit !== undefined ? values[columns.credit] : null;
            
            const debitAmount = this.parseAmount(debitStr ? debitStr.toString() : '');
            const creditAmount = this.parseAmount(creditStr ? creditStr.toString() : '');
            
            // Si hay cargo (debe), es negativo
            if (debitAmount !== null && debitAmount !== 0) {
                amount = -Math.abs(debitAmount);
            }
            // Si hay abono (haber), es positivo
            else if (creditAmount !== null && creditAmount !== 0) {
                amount = Math.abs(creditAmount);
            }
        }

        // Si falta fecha O importe, descartar
        if (!dateStr || amount === null || amount === 0) {
            return null;
        }

        // Si falta descripción, usar placeholder
        const finalDescription = description && description.toString().trim() ? 
            description.toString().trim() : 
            'Movimiento bancario';

        // Parsear fecha
        const date = this.parseDate(dateStr.toString());
        if (!date || isNaN(date.getTime())) {
            console.warn('⚠️ Fecha inválida:', dateStr);
            return null;
        }

        // Validar importe
        if (isNaN(amount)) {
            console.warn('⚠️ Importe inválido:', amountStr);
            return null;
        }

        // Categorizar automáticamente
        const category = categorizeTransaction(finalDescription);

        // Determinar tipo
        const type = determineTransactionType(amount, category);

        // Determinar fuente de ingreso
        const incomeSource = type === 'income' ? formatIncomeSource(finalDescription) : null;

        return {
            id: this.generateTransactionId(),
            date: date,
            description: finalDescription,
            amount: amount,
            category: category,
            type: type,
            incomeSource: incomeSource,
            balance: columns.balance !== undefined ? this.parseAmount((values[columns.balance] || '').toString()) : null
        };
    }

    /**
     * Parsea una fecha en varios formatos
     * Soporta: DD/MM/YYYY, YYYY-MM-DD, fechas Excel, DD mes YYYY, etc.
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        const str = dateStr.toString().trim();
        if (!str) return null;

        // Si es un número de Excel (días desde 1900-01-01)
        const num = parseFloat(str);
        if (!isNaN(num) && num > 25000 && num < 65000) {
            const date = new Date((num - 25569) * 86400 * 1000);
            return date;
        }

        // Si ya es un objeto Date
        if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
            return dateStr;
        }

        // Limpiar (mantener espacios para "15 enero 2024")
        let cleaned = str.replace(/\s+/g, ' ').trim();

        // Formatos comunes (ordenados por especificidad)
        const formats = [
            // ISO con hora: 2026-02-14 14:32:00 (Revolut, N26)
            /^(\d{4})-(\d{1,2})-(\d{1,2})\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/,
            // ISO: YYYY-MM-DD (ING, neobancos)
            /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
            // Europeo: DD/MM/YYYY (mayoría de bancos españoles)
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
            // Europeo corto: DD/MM/YY
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/,
            // Con nombre de mes: 15 enero 2024
            /^(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})$/i,
            // Sin año: DD/MM (usar año actual)
            /^(\d{1,2})[\/\-\.](\d{1,2})$/
        ];

        for (let i = 0; i < formats.length; i++) {
            const match = cleaned.match(formats[i]);
            
            if (match) {
                let day, month, year;
                
                if (i === 0) {
                    // ISO con hora: tomar solo la fecha
                    year = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[3]);
                } else if (i === 1) {
                    // YYYY-MM-DD
                    year = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[3]);
                } else if (i === 4) {
                    // Nombre de mes
                    const months = {
                        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
                        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
                        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
                    };
                    day = parseInt(match[1]);
                    month = months[match[2].toLowerCase()];
                    year = parseInt(match[3]);
                } else if (i === 5) {
                    // Sin año
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    year = new Date().getFullYear();
                } else {
                    // DD/MM/YYYY o DD/MM/YY
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    year = parseInt(match[3]);
                    
                    if (year < 100) {
                        year += (year < 50) ? 2000 : 1900;
                    }
                }

                const date = new Date(year, month, day);
                
                if (!isNaN(date.getTime()) && 
                    date.getFullYear() >= 1900 && 
                    date.getFullYear() <= 2100) {
                    return date;
                }
            }
        }

        // Último recurso: Date.parse
        try {
            const date = new Date(cleaned);
            if (!isNaN(date.getTime()) && 
                date.getFullYear() >= 1900 && 
                date.getFullYear() <= 2100) {
                return date;
            }
        } catch (e) {
            // Ignorar
        }

        return null;
    }

    /**
     * Parsea un importe en varios formatos
     */
    parseAmount(amountStr) {
        if (!amountStr) return null;

        let str = amountStr.toString().trim();
        if (!str) return null;

        // Si ya es un número válido
        const directNum = parseFloat(amountStr);
        if (!isNaN(directNum) && str.match(/^-?\d+\.?\d*$/)) {
            return directNum;
        }

        // Detectar signo
        let isNegative = false;
        if (str.startsWith('-') || str.startsWith('(') || str.toLowerCase().includes('debe')) {
            isNegative = true;
        }

        // Limpiar
        let cleaned = str
            .replace(/[€$£¥]/g, '')
            .replace(/[\s]/g, '')
            .replace(/[()]/g, '')
            .replace(/debe|haber|dr|cr/gi, '')
            .trim();

        if (!cleaned || cleaned === '-') return null;

        // Detectar formato
        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');

        if (hasComma && hasDot) {
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            
            if (lastComma > lastDot) {
                // Europeo: 1.234,56
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                // Anglosajón: 1,234.56
                cleaned = cleaned.replace(/,/g, '');
            }
        } else if (hasComma) {
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Decimal europeo
                cleaned = cleaned.replace(',', '.');
            } else {
                // Separador de miles
                cleaned = cleaned.replace(/,/g, '');
            }
        } else if (hasDot) {
            const parts = cleaned.split('.');
            if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
                // Separador de miles
                cleaned = cleaned.replace(/\./g, '');
            }
        }

        // Limpiar caracteres no numéricos
        cleaned = cleaned.replace(/[^\d.-]/g, '');

        let amount = parseFloat(cleaned);

        if (isNaN(amount)) {
            return null;
        }

        if (isNegative && amount > 0) {
            amount = -amount;
        }

        return amount;
    }

    /**
     * Genera un ID único
     */
    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Genera hash para detectar duplicados
     */
    generateTransactionHash(transaction) {
        const dateStr = transaction.date instanceof Date ? 
            transaction.date.toISOString().split('T')[0] : 
            transaction.date;
        const amount = Math.abs(transaction.amount).toFixed(2);
        const desc = transaction.description.substring(0, 50).toLowerCase().trim();
        
        return `${dateStr}|${amount}|${desc}`;
    }

    /**
     * Filtra duplicados
     */
    filterDuplicates(newTransactions, existingTransactions) {
        const existingHashes = new Set();
        existingTransactions.forEach(txn => {
            existingHashes.add(this.generateTransactionHash(txn));
        });

        const unique = [];
        const duplicates = [];

        newTransactions.forEach(txn => {
            const hash = this.generateTransactionHash(txn);
            if (existingHashes.has(hash)) {
                duplicates.push(txn);
            } else {
                unique.push(txn);
                existingHashes.add(hash);
            }
        });

        return { unique, duplicates };
    }
}
