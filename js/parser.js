/**
 * Parser de archivos bancarios CSV y Excel
 */

class BankFileParser {
    constructor() {
        this.supportedFormats = ['.csv', '.xlsx', '.xls'];
    }

    /**
     * Procesa un archivo bancario
     * @param {File} file - Archivo a procesar
     * @returns {Promise<Array>} - Array de transacciones
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
                
                if (values.length < 3) continue; // Línea vacía o incompleta

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
                        cellText: false
                    });
                    
                    // Tomar la primera hoja
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Convertir a array de objetos
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

                    console.log('📊 Datos del Excel:', filteredData.slice(0, 5));
                    
                    // Parsear los datos del Excel
                    const transactions = this.parseExcelData(filteredData);
                    resolve(transactions);
                } catch (error) {
                    console.error('Error parseando Excel:', error);
                    reject(error);
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
            throw new Error('El archivo está vacío o no tiene datos');
        }

        // Buscar la fila de encabezados (puede no ser la primera)
        let headerRowIndex = -1;
        let headers = [];

        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            const rowText = row.join('').toLowerCase();
            
            // Buscar palabras clave que indiquen encabezados
            if (rowText.includes('fecha') || 
                rowText.includes('descripci') || 
                rowText.includes('concepto') ||
                rowText.includes('importe') ||
                rowText.includes('movimiento')) {
                
                headerRowIndex = i;
                headers = row.map(h => (h || '').toString().trim().toLowerCase());
                console.log(`✅ Encabezados encontrados en fila ${i}:`, headers);
                break;
            }
        }

        // Si no se encontraron encabezados, asumir que la primera fila es encabezado
        if (headerRowIndex === -1) {
            headerRowIndex = 0;
            headers = data[0].map(h => (h || '').toString().trim().toLowerCase());
            console.log('⚠️ Asumiendo primera fila como encabezado:', headers);
        }

        // Identificar columnas
        const columns = this.identifyColumns(headers);

        if (!columns.date && !columns.description && !columns.amount) {
            console.error('❌ No se identificaron columnas. Headers:', headers);
            throw new Error('No se pudieron identificar las columnas necesarias (fecha, descripción, importe)');
        }

        console.log('✅ Columnas identificadas:', columns);

        // Parsear datos
        const transactions = [];
        
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            try {
                const values = data[i];
                
                // Saltar filas vacías o muy cortas
                if (!values || values.length < 2) continue;
                
                // Saltar filas que parecen totales o resúmenes
                const firstCell = (values[0] || '').toString().toLowerCase();
                if (firstCell.includes('total') || 
                    firstCell.includes('saldo') || 
                    firstCell.includes('resumen')) {
                    continue;
                }

                const transaction = this.createTransaction(values, columns);
                
                if (transaction) {
                    transactions.push(transaction);
                }
            } catch (error) {
                console.warn(`Error en fila ${i + 1}:`, error.message);
            }
        }

        if (transactions.length === 0) {
            throw new Error('No se pudieron extraer transacciones del archivo. Verifica el formato.');
        }

        console.log(`✅ ${transactions.length} transacciones extraídas`);
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
     */
    identifyColumns(headers) {
        const columns = {};

        // Mapeo de posibles nombres de columnas (más exhaustivo)
        const mappings = {
            date: [
                'fecha', 'date', 'fecha operacion', 'fecha operación', 'fecha valor', 
                'f.valor', 'f.operacion', 'f.operación', 'f. valor', 'f. operación',
                'fec.', 'fecha mov', 'fecha mvto', 'fecha movimiento'
            ],
            description: [
                'descripcion', 'descripción', 'concepto', 'description', 'detalle', 
                'movimiento', 'observaciones', 'desc.', 'concepto/movimiento',
                'concepto movimiento', 'texto', 'información', 'informacion'
            ],
            amount: [
                'importe', 'amount', 'cantidad', 'monto', 'cargo/abono', 'debe/haber',
                'imp.', 'euros', 'eur', 'debe', 'haber', 'cargo', 'abono',
                'import.', 'importe €', 'importe eur'
            ],
            balance: [
                'saldo', 'balance', 'saldo final', 'saldo disponible', 
                'saldo actual', 'sdo.', 'disponible'
            ]
        };

        headers.forEach((header, index) => {
            const cleanHeader = header.toLowerCase().trim();
            
            for (const [key, variations] of Object.entries(mappings)) {
                // Buscar coincidencias exactas primero
                if (variations.includes(cleanHeader)) {
                    if (!columns[key]) { // Solo si no se ha asignado aún
                        columns[key] = index;
                    }
                    break;
                }
                
                // Luego buscar coincidencias parciales
                if (variations.some(v => cleanHeader.includes(v))) {
                    if (!columns[key]) {
                        columns[key] = index;
                    }
                    break;
                }
            }
        });

        // Si no se encontró "amount", buscar columnas numéricas
        if (!columns.amount) {
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i].toLowerCase();
                // Buscar columnas que contengan símbolos monetarios o sean números
                if (header.includes('€') || header.includes('$') || 
                    /\d/.test(header) || header === '') {
                    columns.amount = i;
                    console.log(`ℹ️ Columna de importe detectada por contenido en posición ${i}`);
                    break;
                }
            }
        }

        return columns;
    }

    /**
     * Crea un objeto transacción desde los valores parseados
     */
    createTransaction(values, columns) {
        // Extraer valores con seguridad
        const dateStr = columns.date !== undefined ? values[columns.date] : null;
        const description = columns.description !== undefined ? values[columns.description] : null;
        const amountStr = columns.amount !== undefined ? values[columns.amount] : null;

        // Validar que tenemos los datos mínimos
        if (!dateStr && !description && !amountStr) {
            return null; // Fila completamente vacía
        }

        // Si falta algún campo crítico, intentar recuperar
        if (!dateStr || !description || !amountStr) {
            console.warn('⚠️ Fila incompleta:', { dateStr, description, amountStr });
            return null;
        }

        // Parsear fecha
        const date = this.parseDate(dateStr.toString());
        if (!date || isNaN(date.getTime())) {
            console.warn('⚠️ Fecha inválida:', dateStr);
            return null;
        }

        // Parsear importe
        const amount = this.parseAmount(amountStr.toString());
        if (amount === null || isNaN(amount)) {
            console.warn('⚠️ Importe inválido:', amountStr);
            return null;
        }

        // Limpiar descripción
        const cleanDescription = description.toString().trim();
        if (!cleanDescription) {
            console.warn('⚠️ Descripción vacía');
            return null;
        }

        // Categorizar automáticamente
        const category = categorizeTransaction(cleanDescription);

        // Determinar tipo
        const type = determineTransactionType(amount, category);

        // Determinar fuente de ingreso si es un ingreso
        const incomeSource = type === 'income' ? formatIncomeSource(cleanDescription) : null;

        return {
            id: this.generateTransactionId(),
            date: date,
            description: cleanDescription,
            amount: amount,
            category: category,
            type: type,
            incomeSource: incomeSource,
            balance: columns.balance !== undefined ? this.parseAmount((values[columns.balance] || '').toString()) : null
        };
    }

    /**
     * Parsea una fecha en varios formatos
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Convertir a string
        const str = dateStr.toString().trim();
        if (!str) return null;

        // Si es un número (fecha de Excel - número de días desde 1900)
        const num = parseFloat(str);
        if (!isNaN(num) && str.length <= 6 && num > 0) {
            return this.excelDateToJSDate(num);
        }

        // Si ya es un objeto Date
        if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
            return dateStr;
        }

        // Limpiar la fecha
        let cleaned = str.replace(/\s+/g, ' ').trim();

        // Intentar diferentes formatos
        const formats = [
            // DD/MM/YYYY o DD-MM-YYYY
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
            // DD/MM/YY o DD-MM-YY
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/,
            // YYYY-MM-DD o YYYY/MM/DD
            /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
            // DD mes YYYY (ej: 15 enero 2024)
            /^(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})$/i,
        ];

        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            const match = cleaned.match(format);
            
            if (match) {
                let day, month, year;
                
                if (i === 3) {
                    // Formato con nombre de mes
                    const months = {
                        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
                        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
                        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
                    };
                    day = parseInt(match[1]);
                    month = months[match[2].toLowerCase()];
                    year = parseInt(match[3]);
                } else if (match[1].length === 4) {
                    // YYYY-MM-DD
                    year = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[3]);
                } else {
                    // DD/MM/YYYY o DD/MM/YY
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    year = parseInt(match[3]);
                    
                    // Si el año es de 2 dígitos, convertir
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

        // Intentar con Date.parse como último recurso
        try {
            const date = new Date(cleaned);
            if (!isNaN(date.getTime()) && 
                date.getFullYear() >= 1900 && 
                date.getFullYear() <= 2100) {
                return date;
            }
        } catch (e) {
            // Ignorar error
        }

        return null;
    }

    /**
     * Convierte fecha de Excel a Date de JavaScript
     */
    excelDateToJSDate(excelDate) {
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date;
    }

    /**
     * Parsea un importe en varios formatos
     */
    parseAmount(amountStr) {
        if (!amountStr) return null;

        // Convertir a string
        let str = amountStr.toString().trim();
        if (!str) return null;

        // Si ya es un número válido
        const directNum = parseFloat(amountStr);
        if (!isNaN(directNum) && str.match(/^-?\d+\.?\d*$/)) {
            return directNum;
        }

        // Guardar el signo
        let isNegative = false;
        if (str.startsWith('-') || str.startsWith('(') || str.toLowerCase().includes('debe')) {
            isNegative = true;
        }

        // Limpiar el string
        let cleaned = str
            .replace(/[€$£¥]/g, '') // Símbolos de moneda
            .replace(/[\s]/g, '')    // Espacios
            .replace(/[()]/g, '')    // Paréntesis (formato negativo)
            .replace(/debe|haber|dr|cr/gi, '') // Palabras debe/haber
            .trim();

        // Si está vacío después de limpiar
        if (!cleaned || cleaned === '-') return null;

        // Detectar formato europeo (1.234,56) vs anglosajón (1,234.56)
        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');

        if (hasComma && hasDot) {
            // Ambos presentes: determinar cuál es el decimal
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            const commaPos = cleaned.indexOf(',');
            const dotPos = cleaned.indexOf('.');

            // Verificar cuál es el separador de decimales (último que aparece)
            if (lastComma > lastDot) {
                // Formato europeo: 1.234,56
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                // Formato anglosajón: 1,234.56
                cleaned = cleaned.replace(/,/g, '');
            }
        } else if (hasComma) {
            // Solo coma: verificar si es miles o decimal
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Probablemente decimal europeo: 1234,56
                cleaned = cleaned.replace(',', '.');
            } else {
                // Probablemente separador de miles: 1,234,567
                cleaned = cleaned.replace(/,/g, '');
            }
        }
        // Si solo tiene punto, verificar si es miles o decimal
        else if (hasDot) {
            const parts = cleaned.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Ya está en formato correcto: 1234.56
            } else {
                // Probablemente separador de miles: 1.234.567
                cleaned = cleaned.replace(/\./g, '');
            }
        }

        // Remover cualquier caracter no numérico excepto punto y signo menos
        cleaned = cleaned.replace(/[^\d.-]/g, '');

        // Parsear el número
        let amount = parseFloat(cleaned);

        if (isNaN(amount)) {
            console.warn('⚠️ No se pudo parsear importe:', amountStr);
            return null;
        }

        // Aplicar signo si es negativo
        if (isNegative && amount > 0) {
            amount = -amount;
        }

        return amount;
    }

    /**
     * Genera un ID único para una transacción
     */
    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
