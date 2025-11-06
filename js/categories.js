/**
 * Sistema de Categorización de Transacciones
 * Define categorías y métodos para clasificar automáticamente
 */

const CATEGORIES = {
    // Alimentación y Supermercados
    'Supermercado': {
        icon: 'fa-shopping-cart',
        color: '#48bb78',
        keywords: ['mercadona', 'carrefour', 'dia', 'lidl', 'aldi', 'eroski', 'alcampo', 'hipercor', 'supermercado', 'super', 'consum']
    },
    'Restaurantes': {
        icon: 'fa-utensils',
        color: '#ed8936',
        keywords: ['restaurante', 'bar ', 'cafeteria', 'mcdonalds', 'burger', 'pizza', 'telepizza', 'dominos', 'kfc', 'vips', 'ginos']
    },
    'Comida Rápida': {
        icon: 'fa-hamburger',
        color: '#f56565',
        keywords: ['just eat', 'glovo', 'uber eats', 'deliveroo', 'mcdonalds', 'burger king', 'kebab']
    },

    // Transporte
    'Transporte Público': {
        icon: 'fa-bus',
        color: '#4299e1',
        keywords: ['metro', 'renfe', 'cercanias', 'bus', 'emt', 'tmb', 'abono transporte', 'tarjeta transporte']
    },
    'Gasolina': {
        icon: 'fa-gas-pump',
        color: '#38b2ac',
        keywords: ['repsol', 'cepsa', 'galp', 'bp', 'shell', 'gasolinera', 'combustible', 'gasolina']
    },
    'Taxi': {
        icon: 'fa-taxi',
        color: '#ecc94b',
        keywords: ['taxi', 'cabify', 'uber', 'free now']
    },
    'Parking': {
        icon: 'fa-parking',
        color: '#a0aec0',
        keywords: ['parking', 'aparcamiento', 'parkia', 'saba']
    },

    // Vivienda
    'Alquiler': {
        icon: 'fa-home',
        color: '#667eea',
        keywords: ['alquiler', 'renta', 'arrendamiento', 'inmobiliaria']
    },
    'Hipoteca': {
        icon: 'fa-university',
        color: '#805ad5',
        keywords: ['hipoteca', 'prestamo hipotecario', 'cuota hipoteca']
    },
    'Suministros': {
        icon: 'fa-bolt',
        color: '#ed64a6',
        keywords: ['iberdrola', 'endesa', 'naturgy', 'luz', 'gas', 'agua', 'electricidad', 'suministro']
    },
    'Internet y Teléfono': {
        icon: 'fa-wifi',
        color: '#4299e1',
        keywords: ['movistar', 'vodafone', 'orange', 'jazztel', 'yoigo', 'masmovil', 'fibra', 'adsl', 'telefono', 'movil']
    },
    'Comunidad': {
        icon: 'fa-building',
        color: '#718096',
        keywords: ['comunidad', 'gastos comunes', 'administrador', 'finca']
    },

    // Compras
    'Ropa y Calzado': {
        icon: 'fa-tshirt',
        color: '#ed8936',
        keywords: ['zara', 'h&m', 'mango', 'pull&bear', 'bershka', 'stradivarius', 'massimo dutti', 'primark', 'decathlon', 'nike', 'adidas', 'ropa', 'calzado']
    },
    'Hogar y Muebles': {
        icon: 'fa-couch',
        color: '#9f7aea',
        keywords: ['ikea', 'leroy merlin', 'aki', 'bricomart', 'brico depot', 'muebles', 'hogar', 'decoracion']
    },
    'Tecnología': {
        icon: 'fa-laptop',
        color: '#4299e1',
        keywords: ['amazon', 'fnac', 'mediamarkt', 'pccomponentes', 'apple', 'samsung', 'tecnologia', 'electronica']
    },
    'Farmacia': {
        icon: 'fa-pills',
        color: '#48bb78',
        keywords: ['farmacia', 'parafarmacia', 'medicamento']
    },

    // Salud y Cuidado Personal
    'Salud': {
        icon: 'fa-heartbeat',
        color: '#f56565',
        keywords: ['medico', 'hospital', 'clinica', 'dentista', 'odontologo', 'seguro medico', 'sanitas', 'adeslas', 'asisa']
    },
    'Gimnasio': {
        icon: 'fa-dumbbell',
        color: '#ed8936',
        keywords: ['gimnasio', 'gym', 'fitness', 'sport', 'deportivo', 'piscina']
    },
    'Peluquería': {
        icon: 'fa-cut',
        color: '#9f7aea',
        keywords: ['peluqueria', 'barberia', 'salon', 'estetica']
    },

    // Entretenimiento
    'Ocio': {
        icon: 'fa-film',
        color: '#f687b3',
        keywords: ['cine', 'teatro', 'museo', 'concierto', 'entrada', 'ocio']
    },
    'Streaming': {
        icon: 'fa-play-circle',
        color: '#e53e3e',
        keywords: ['netflix', 'hbo', 'amazon prime', 'disney', 'spotify', 'youtube premium', 'dazn', 'movistar+']
    },
    'Viajes': {
        icon: 'fa-plane',
        color: '#38b2ac',
        keywords: ['hotel', 'booking', 'airbnb', 'vuelo', 'ryanair', 'vueling', 'iberia', 'viaje', 'hostal']
    },
    'Libros': {
        icon: 'fa-book',
        color: '#805ad5',
        keywords: ['libreria', 'casa del libro', 'libro', 'fnac']
    },

    // Seguros
    'Seguros': {
        icon: 'fa-shield-alt',
        color: '#4299e1',
        keywords: ['seguro', 'mapfre', 'mutua', 'axa', 'allianz', 'generali', 'santalucia']
    },
    'Seguro Coche': {
        icon: 'fa-car',
        color: '#4299e1',
        keywords: ['seguro coche', 'seguro vehiculo', 'seguro auto']
    },

    // Educación
    'Educación': {
        icon: 'fa-graduation-cap',
        color: '#9f7aea',
        keywords: ['colegio', 'universidad', 'academia', 'curso', 'formacion', 'matricula', 'educacion']
    },

    // Mascotas
    'Mascotas': {
        icon: 'fa-paw',
        color: '#ed8936',
        keywords: ['veterinario', 'mascota', 'kiwoko', 'tiendanimal', 'pienso', 'perro', 'gato']
    },

    // Impuestos y Tasas
    'Impuestos': {
        icon: 'fa-file-invoice-dollar',
        color: '#e53e3e',
        keywords: ['hacienda', 'agencia tributaria', 'impuesto', 'iva', 'irpf', 'tasa', 'multa']
    },

    // Ahorro e Inversión
    'Ahorro': {
        icon: 'fa-piggy-bank',
        color: '#48bb78',
        keywords: ['ahorro', 'deposito', 'inversion', 'fondo']
    },
    'Transferencia': {
        icon: 'fa-exchange-alt',
        color: '#4299e1',
        keywords: ['transferencia', 'bizum', 'traspaso']
    },

    // Nómina e Ingresos
    'Nómina': {
        icon: 'fa-money-bill-wave',
        color: '#48bb78',
        keywords: ['nomina', 'salario', 'sueldo', 'paga']
    },
    'Venta': {
        icon: 'fa-hand-holding-usd',
        color: '#38b2ac',
        keywords: ['venta', 'ingreso venta', 'wallapop', 'vinted']
    },
    'Reembolso': {
        icon: 'fa-undo',
        color: '#4299e1',
        keywords: ['devolucion', 'reembolso', 'reintegro']
    },

    // Préstamos
    'Préstamos': {
        icon: 'fa-hand-holding-usd',
        color: '#ed8936',
        keywords: ['prestamo', 'credito', 'financiacion']
    },

    // Donaciones
    'Donaciones': {
        icon: 'fa-donate',
        color: '#ed64a6',
        keywords: ['donacion', 'caridad', 'ong', 'unicef', 'cruz roja']
    },

    // Suscripciones
    'Suscripciones': {
        icon: 'fa-sync-alt',
        color: '#9f7aea',
        keywords: ['suscripcion', 'mensualidad', 'cuota']
    },

    // Otros
    'Cajero': {
        icon: 'fa-credit-card',
        color: '#718096',
        keywords: ['cajero', 'retirada', 'efectivo']
    },
    'Comisiones': {
        icon: 'fa-percent',
        color: '#e53e3e',
        keywords: ['comision', 'cargo', 'mantenimiento cuenta']
    },
    'Otros': {
        icon: 'fa-question-circle',
        color: '#a0aec0',
        keywords: []
    }
};

/**
 * Categoriza automáticamente una transacción basándose en su descripción
 */
function categorizeTransaction(description) {
    const desc = description.toLowerCase();
    
    for (const [categoryName, categoryData] of Object.entries(CATEGORIES)) {
        for (const keyword of categoryData.keywords) {
            if (desc.includes(keyword.toLowerCase())) {
                return categoryName;
            }
        }
    }
    
    return 'Otros';
}

/**
 * Obtiene la información de una categoría
 */
function getCategoryInfo(categoryName) {
    return CATEGORIES[categoryName] || CATEGORIES['Otros'];
}

/**
 * Obtiene todas las categorías ordenadas alfabéticamente
 */
function getAllCategories() {
    return Object.keys(CATEGORIES).sort();
}

/**
 * Obtiene todas las categorías con su información
 */
function getAllCategoriesWithInfo() {
    return Object.entries(CATEGORIES).map(([name, info]) => ({
        name,
        ...info
    })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Determina si una transacción es ingreso o gasto basándose en el importe y categoría
 */
function determineTransactionType(amount, category) {
    const incomeCategories = ['Nómina', 'Venta', 'Reembolso', 'Ahorro'];
    
    if (amount > 0) {
        return 'income';
    } else if (amount < 0) {
        return 'expense';
    } else {
        // Si el importe es 0, determinar por categoría
        return incomeCategories.includes(category) ? 'income' : 'expense';
    }
}

/**
 * Formatea el nombre de una fuente de ingreso
 */
function formatIncomeSource(description) {
    // Intentar identificar fuentes comunes
    const desc = description.toLowerCase();
    
    if (desc.includes('nomina') || desc.includes('salario')) {
        return 'Nómina';
    } else if (desc.includes('bizum') && !desc.includes('pago')) {
        return 'Transferencias Bizum';
    } else if (desc.includes('transferencia')) {
        return 'Transferencias';
    } else if (desc.includes('venta')) {
        return 'Ventas';
    } else if (desc.includes('devolucion') || desc.includes('reembolso')) {
        return 'Devoluciones';
    } else if (desc.includes('intereses')) {
        return 'Intereses';
    }
    
    // Si no se identifica, usar una versión limpia de la descripción
    return description
        .replace(/\d+/g, '') // Quitar números
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50) || 'Otros Ingresos';
}
