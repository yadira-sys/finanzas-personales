/**
 * Sistema de Reglas de Categorización Automática
 * Gestiona reglas que memorizan las categorizaciones del usuario
 */

class RulesManager {
    constructor() {
        this.rules = [];
        this.storageKey = 'finance_rules';
        this.loadRules();
    }

    /**
     * Carga las reglas desde localStorage
     */
    loadRules() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.rules = JSON.parse(stored);
                console.log(`✅ Cargadas ${this.rules.length} reglas`);
            }
        } catch (error) {
            console.error('Error al cargar reglas:', error);
            this.rules = [];
        }
    }

    /**
     * Guarda las reglas en localStorage
     */
    saveRules() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.rules));
            console.log(`💾 Guardadas ${this.rules.length} reglas`);
        } catch (error) {
            console.error('Error al guardar reglas:', error);
        }
    }

    /**
     * Crea o actualiza una regla basada en una transacción
     * @param {Object} transaction - Transacción base
     * @param {string} category - Categoría asignada
     */
    createOrUpdateRule(transaction, category) {
        const pattern = this.normalizePattern(transaction.description);
        
        // Buscar si ya existe una regla para este patrón
        const existingRuleIndex = this.rules.findIndex(rule => 
            rule.pattern.toLowerCase() === pattern.toLowerCase()
        );

        if (existingRuleIndex >= 0) {
            // Actualizar regla existente
            this.rules[existingRuleIndex].category = category;
            this.rules[existingRuleIndex].updatedAt = Date.now();
            this.rules[existingRuleIndex].applications++;
            console.log(`🔄 Regla actualizada: "${pattern}" → ${category}`);
        } else {
            // Crear nueva regla
            const newRule = {
                id: this.generateRuleId(),
                pattern: pattern,
                category: category,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                applications: 1
            };
            this.rules.push(newRule);
            console.log(`✨ Nueva regla creada: "${pattern}" → ${category}`);
        }

        this.saveRules();
    }

    /**
     * Normaliza un patrón de descripción
     * Elimina espacios extras, números de transacción, etc.
     */
    normalizePattern(description) {
        return description
            .trim()
            .replace(/\s+/g, ' ')
            .substring(0, 100); // Limitar longitud
    }

    /**
     * Aplica reglas a una transacción
     * @param {Object} transaction - Transacción a categorizar
     * @returns {Object|null} - Regla aplicada o null
     */
    applyRules(transaction) {
        const normalizedDesc = this.normalizePattern(transaction.description);
        
        // Buscar coincidencia exacta primero
        let matchedRule = this.rules.find(rule => 
            normalizedDesc.toLowerCase() === rule.pattern.toLowerCase()
        );

        // Si no hay coincidencia exacta, buscar coincidencia parcial
        if (!matchedRule) {
            matchedRule = this.rules.find(rule => 
                normalizedDesc.toLowerCase().includes(rule.pattern.toLowerCase()) ||
                rule.pattern.toLowerCase().includes(normalizedDesc.toLowerCase())
            );
        }

        if (matchedRule) {
            return {
                category: matchedRule.category,
                rule: matchedRule
            };
        }

        return null;
    }

    /**
     * Aplica reglas a un conjunto de transacciones
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Estadísticas de aplicación
     */
    applyRulesToTransactions(transactions) {
        let applied = 0;
        let skipped = 0;

        transactions.forEach(transaction => {
            const result = this.applyRules(transaction);
            if (result) {
                transaction.category = result.category;
                applied++;
            } else {
                skipped++;
            }
        });

        return {
            applied,
            skipped,
            total: transactions.length
        };
    }

    /**
     * Obtiene todas las reglas
     */
    getAllRules() {
        return [...this.rules].sort((a, b) => b.applications - a.applications);
    }

    /**
     * Obtiene una regla por ID
     */
    getRuleById(id) {
        return this.rules.find(rule => rule.id === id);
    }

    /**
     * Actualiza una regla existente
     */
    updateRule(id, updates) {
        const ruleIndex = this.rules.findIndex(rule => rule.id === id);
        if (ruleIndex >= 0) {
            this.rules[ruleIndex] = {
                ...this.rules[ruleIndex],
                ...updates,
                updatedAt: Date.now()
            };
            this.saveRules();
            return true;
        }
        return false;
    }

    /**
     * Elimina una regla
     */
    deleteRule(id) {
        const ruleIndex = this.rules.findIndex(rule => rule.id === id);
        if (ruleIndex >= 0) {
            const deletedRule = this.rules.splice(ruleIndex, 1)[0];
            this.saveRules();
            console.log(`🗑️ Regla eliminada: "${deletedRule.pattern}"`);
            return true;
        }
        return false;
    }

    /**
     * Elimina todas las reglas
     */
    clearAllRules() {
        const count = this.rules.length;
        this.rules = [];
        this.saveRules();
        console.log(`🗑️ Eliminadas ${count} reglas`);
        return count;
    }

    /**
     * Obtiene estadísticas de las reglas
     */
    getStatistics() {
        const totalRules = this.rules.length;
        const totalApplications = this.rules.reduce((sum, rule) => sum + rule.applications, 0);
        const lastUpdate = this.rules.length > 0 
            ? Math.max(...this.rules.map(r => r.updatedAt))
            : null;

        return {
            totalRules,
            totalApplications,
            lastUpdate,
            averageApplications: totalRules > 0 ? (totalApplications / totalRules).toFixed(1) : 0
        };
    }

    /**
     * Genera un ID único para una regla
     */
    generateRuleId() {
        return 'rule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Exporta reglas a JSON
     */
    exportRules() {
        return JSON.stringify(this.rules, null, 2);
    }

    /**
     * Importa reglas desde JSON
     */
    importRules(jsonString) {
        try {
            const importedRules = JSON.parse(jsonString);
            if (Array.isArray(importedRules)) {
                this.rules = importedRules;
                this.saveRules();
                return true;
            }
        } catch (error) {
            console.error('Error al importar reglas:', error);
        }
        return false;
    }

    /**
     * Busca reglas por categoría
     */
    getRulesByCategory(category) {
        return this.rules.filter(rule => rule.category === category);
    }

    /**
     * Busca reglas por patrón (búsqueda parcial)
     */
    searchRules(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.rules.filter(rule => 
            rule.pattern.toLowerCase().includes(term) ||
            rule.category.toLowerCase().includes(term)
        );
    }

    /**
     * Fusiona reglas duplicadas
     */
    mergeDuplicateRules() {
        const merged = new Map();
        
        this.rules.forEach(rule => {
            const key = rule.pattern.toLowerCase();
            if (merged.has(key)) {
                const existing = merged.get(key);
                existing.applications += rule.applications;
                existing.updatedAt = Math.max(existing.updatedAt, rule.updatedAt);
            } else {
                merged.set(key, { ...rule });
            }
        });

        const beforeCount = this.rules.length;
        this.rules = Array.from(merged.values());
        const afterCount = this.rules.length;
        
        if (beforeCount > afterCount) {
            this.saveRules();
            console.log(`🔀 Fusionadas ${beforeCount - afterCount} reglas duplicadas`);
        }

        return beforeCount - afterCount;
    }

    /**
     * Limpia reglas sin uso (0 aplicaciones)
     */
    cleanUnusedRules() {
        const beforeCount = this.rules.length;
        this.rules = this.rules.filter(rule => rule.applications > 0);
        const afterCount = this.rules.length;
        
        if (beforeCount > afterCount) {
            this.saveRules();
            console.log(`🧹 Eliminadas ${beforeCount - afterCount} reglas sin uso`);
        }

        return beforeCount - afterCount;
    }
}
