/**
 * Aplicación principal de análisis de finanzas personales
 */

class FinanceApp {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.parser = new BankFileParser();
        this.charts = new FinanceCharts();
        this.rulesManager = new RulesManager();
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.currentTab = 'dashboard';
        this.currentEditingTransaction = null;
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');

        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Clear data button
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTransactions();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.filterTransactions();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Table sorting
        document.querySelectorAll('#transactionsTable th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTransactions(column);
            });
        });

        // Category editor
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeCategoryEditor();
        });

        // Month selector
        document.getElementById('monthSelect').addEventListener('change', () => {
            this.updateMonthlyView();
        });

        document.getElementById('yearSelect').addEventListener('change', () => {
            this.updateMonthlyView();
        });

        document.getElementById('prevMonth').addEventListener('click', () => {
            this.navigateMonth(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.navigateMonth(1);
        });

        // Rules management
        document.getElementById('applyRulesBtn').addEventListener('click', () => {
            this.applyRulesToAll();
        });

        document.getElementById('clearRulesBtn').addEventListener('click', () => {
            this.clearAllRules();
        });
    }

    /**
     * Cambia de pestaña
     */
    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });

        this.currentTab = tabName;

        // Actualizar vista específica
        switch (tabName) {
            case 'ingresos':
                this.updateIncomesView();
                break;
            case 'gastos':
                this.updateExpensesView();
                break;
            case 'balance':
                this.updateMonthlyBalanceView();
                break;
            case 'reglas':
                this.updateRulesView();
                break;
            case 'transacciones':
                this.updateTransactionsView();
                break;
            default:
                this.updateDashboardView();
        }
    }

    /**
     * Maneja la carga de archivos
     */
    async handleFiles(files) {
        if (!files || files.length === 0) return;

        this.showNotification('📂 Procesando archivos...', 'info');

        let totalParsed = 0;
        let totalErrors = 0;
        let filesProcessed = 0;

        for (const file of files) {
            try {
                console.log(`📄 Procesando archivo: ${file.name} (${file.type})`);
                
                const transactions = await this.parser.parseFile(file);
                
                if (!transactions || transactions.length === 0) {
                    throw new Error('No se encontraron transacciones en el archivo');
                }

                console.log(`✅ ${transactions.length} transacciones extraídas de ${file.name}`);
                
                // Aplicar reglas automáticas
                const rulesResult = this.rulesManager.applyRulesToTransactions(transactions);
                
                this.transactions.push(...transactions);
                totalParsed += transactions.length;
                filesProcessed++;

                if (rulesResult.applied > 0) {
                    this.showNotification(
                        `✨ ${rulesResult.applied} transacciones categorizadas automáticamente en ${file.name}`,
                        'success'
                    );
                }
            } catch (error) {
                console.error('❌ Error procesando archivo:', file.name, error);
                totalErrors++;
                
                let errorMsg = `Error en ${file.name}: ${error.message}`;
                
                // Mensajes de error más descriptivos
                if (error.message.includes('columnas')) {
                    errorMsg += '\n\n💡 Sugerencia: Verifica que el archivo tenga columnas de Fecha, Descripción e Importe';
                } else if (error.message.includes('vacío')) {
                    errorMsg += '\n\n💡 El archivo parece estar vacío o tener un formato incorrecto';
                } else if (error.message.includes('transacciones')) {
                    errorMsg += '\n\n💡 No se pudieron extraer transacciones. Verifica el formato del archivo';
                }
                
                this.showNotification(errorMsg, 'error');
            }
        }

        if (totalParsed > 0) {
            this.showNotification(
                `✅ ${totalParsed} transacciones cargadas de ${filesProcessed} archivo(s)`,
                'success'
            );
            this.saveToStorage();
            this.updateUI();
        } else if (totalErrors > 0) {
            this.showNotification(
                `❌ No se pudieron cargar transacciones. Revisa la consola (F12) para más detalles.`,
                'error'
            );
        }
    }

    /**
     * Aplica reglas a todas las transacciones
     */
    applyRulesToAll() {
        if (this.transactions.length === 0) {
            this.showNotification('No hay transacciones para procesar', 'warning');
            return;
        }

        const result = this.rulesManager.applyRulesToTransactions(this.transactions);
        
        if (result.applied > 0) {
            this.showNotification(
                `✨ ${result.applied} transacciones recategorizadas con ${this.rulesManager.rules.length} reglas`,
                'success'
            );
            this.saveToStorage();
            this.updateUI();
        } else {
            this.showNotification('No se aplicaron cambios', 'info');
        }
    }

    /**
     * Borra todas las reglas
     */
    clearAllRules() {
        if (!confirm('¿Estás seguro de que quieres borrar todas las reglas? Esta acción no se puede deshacer.')) {
            return;
        }

        const count = this.rulesManager.clearAllRules();
        this.showNotification(`🗑️ ${count} reglas eliminadas`, 'success');
        this.updateRulesView();
    }

    /**
     * Filtra las transacciones según los criterios
     */
    filterTransactions() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        this.filteredTransactions = this.transactions.filter(txn => {
            const matchesSearch = !searchTerm || 
                txn.description.toLowerCase().includes(searchTerm) ||
                txn.amount.toString().includes(searchTerm);

            const matchesCategory = !categoryFilter || txn.category === categoryFilter;
            const matchesType = !typeFilter || txn.type === typeFilter;

            return matchesSearch && matchesCategory && matchesType;
        });

        this.updateTransactionsTable();
    }

    /**
     * Ordena las transacciones por columna
     */
    sortTransactions(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }

        this.filteredTransactions.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (column === 'amount') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.updateTransactionsTable();
    }

    /**
     * Abre el editor de categorías para una transacción
     */
    openCategoryEditor(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        this.currentEditingTransaction = transaction;

        const editor = document.getElementById('categoryEditor');
        const description = document.getElementById('editorDescription');
        const categoriesContainer = document.getElementById('editorCategories');

        description.textContent = transaction.description;
        categoriesContainer.innerHTML = '';

        // Crear botones de categorías
        const categories = getAllCategoriesWithInfo();
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'editor-category-btn';
            btn.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.name}`;
            btn.onclick = () => this.assignCategory(cat.name);
            categoriesContainer.appendChild(btn);
        });

        editor.style.display = 'flex';
    }

    /**
     * Cierra el editor de categorías
     */
    closeCategoryEditor() {
        document.getElementById('categoryEditor').style.display = 'none';
        this.currentEditingTransaction = null;
    }

    /**
     * Asigna una categoría a la transacción en edición
     */
    assignCategory(category) {
        if (!this.currentEditingTransaction) return;

        const oldCategory = this.currentEditingTransaction.category;
        this.currentEditingTransaction.category = category;

        // Crear o actualizar regla
        this.rulesManager.createOrUpdateRule(this.currentEditingTransaction, category);

        this.showNotification(
            `✅ Categoría cambiada de "${oldCategory}" a "${category}"`,
            'success'
        );

        this.saveToStorage();
        this.closeCategoryEditor();
        this.updateUI();
    }

    /**
     * Borra una regla específica
     */
    deleteRule(ruleId) {
        if (!confirm('¿Eliminar esta regla?')) return;

        if (this.rulesManager.deleteRule(ruleId)) {
            this.showNotification('Regla eliminada', 'success');
            this.updateRulesView();
        }
    }

    /**
     * Exporta transacciones a CSV
     */
    exportToCSV() {
        if (this.filteredTransactions.length === 0) {
            this.showNotification('No hay transacciones para exportar', 'warning');
            return;
        }

        const headers = ['Fecha', 'Descripción', 'Categoría', 'Importe', 'Tipo'];
        const rows = this.filteredTransactions.map(txn => [
            this.formatDate(txn.date),
            txn.description,
            txn.category,
            txn.amount.toFixed(2),
            txn.type === 'income' ? 'Ingreso' : 'Gasto'
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.showNotification('✅ Archivo exportado', 'success');
    }

    /**
     * Borra todos los datos
     */
    clearAllData() {
        if (!confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
            return;
        }

        this.transactions = [];
        this.filteredTransactions = [];
        this.saveToStorage();
        this.updateUI();
        this.showNotification('🗑️ Todos los datos han sido eliminados', 'success');
    }

    /**
     * Actualiza toda la interfaz
     */
    updateUI() {
        this.filteredTransactions = [...this.transactions];
        
        switch (this.currentTab) {
            case 'dashboard':
                this.updateDashboardView();
                break;
            case 'ingresos':
                this.updateIncomesView();
                break;
            case 'gastos':
                this.updateExpensesView();
                break;
            case 'balance':
                this.updateMonthlyBalanceView();
                break;
            case 'reglas':
                this.updateRulesView();
                break;
            case 'transacciones':
                this.updateTransactionsView();
                break;
        }
    }

    /**
     * Actualiza la vista del dashboard
     */
    updateDashboardView() {
        this.updateSummaryCards();
        this.updateCharts();
    }

    /**
     * Actualiza las tarjetas de resumen
     */
    updateSummaryCards() {
        const stats = this.calculateStatistics();

        document.getElementById('totalBalance').textContent = this.formatCurrency(stats.balance);
        document.getElementById('totalIncome').textContent = this.formatCurrency(stats.totalIncome);
        document.getElementById('totalExpense').textContent = this.formatCurrency(Math.abs(stats.totalExpense));
        document.getElementById('totalTransactions').textContent = stats.totalTransactions;
    }

    /**
     * Calcula estadísticas generales
     */
    calculateStatistics() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const balance = totalIncome - totalExpense;

        return {
            totalIncome,
            totalExpense,
            balance,
            totalTransactions: this.transactions.length
        };
    }

    /**
     * Actualiza los gráficos del dashboard
     */
    updateCharts() {
        this.charts.updateMonthlyChart(this.transactions);
        this.charts.updateCategoryChart(this.transactions);
        this.charts.updateBalanceChart(this.transactions);
        this.charts.updateTopCategoriesChart(this.transactions);
    }

    /**
     * Actualiza la vista de ingresos
     */
    updateIncomesView() {
        const incomes = this.transactions.filter(t => t.type === 'income');
        
        // Calcular estadísticas
        const totalIncome = incomes.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const sources = new Set(incomes.map(t => t.incomeSource || 'Otros')).size;
        
        // Calcular promedio mensual
        const months = this.getUniqueMonths(incomes);
        const averageMonthly = months.length > 0 ? totalIncome / months.length : 0;

        document.getElementById('incomeTotal').textContent = this.formatCurrency(totalIncome);
        document.getElementById('incomeSources').textContent = sources;
        document.getElementById('incomeAverage').textContent = this.formatCurrency(averageMonthly);

        // Actualizar gráficos
        this.charts.updateIncomeSourcesChart(incomes);
        this.charts.updateIncomeEvolutionChart(incomes);

        // Actualizar tablas
        this.updateIncomeSourcesTable(incomes);
        this.updateAllIncomeTransactionsTable(incomes);
    }

    /**
     * Actualiza la tabla de fuentes de ingreso
     */
    updateIncomeSourcesTable(incomes) {
        const tbody = document.querySelector('#incomeSourcesTable tbody');
        
        if (incomes.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No hay datos de ingresos</td></tr>';
            return;
        }

        // Agrupar por fuente
        const sourceStats = {};
        incomes.forEach(txn => {
            const source = txn.incomeSource || 'Otros';
            if (!sourceStats[source]) {
                sourceStats[source] = {
                    total: 0,
                    count: 0,
                    lastDate: txn.date
                };
            }
            sourceStats[source].total += Math.abs(txn.amount);
            sourceStats[source].count++;
            if (new Date(txn.date) > new Date(sourceStats[source].lastDate)) {
                sourceStats[source].lastDate = txn.date;
            }
        });

        // Convertir a array y ordenar
        const sources = Object.entries(sourceStats)
            .map(([source, stats]) => ({ source, ...stats }))
            .sort((a, b) => b.total - a.total);

        tbody.innerHTML = sources.map(item => `
            <tr>
                <td><strong>${item.source}</strong></td>
                <td class="amount-income">${this.formatCurrency(item.total)}</td>
                <td>${item.count}</td>
                <td>${this.formatCurrency(item.total / item.count)}</td>
                <td>${this.formatDate(item.lastDate)}</td>
            </tr>
        `).join('');
    }

    /**
     * Actualiza la tabla de todas las transacciones de ingresos
     */
    updateAllIncomeTransactionsTable(incomes) {
        const tbody = document.querySelector('#allIncomeTransactionsTable tbody');
        
        if (incomes.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No hay transacciones de ingresos</td></tr>';
            return;
        }

        // Ordenar por fecha descendente
        const sortedIncomes = [...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedIncomes.map(txn => {
            const categoryInfo = getCategoryInfo(txn.category);
            
            return `
                <tr>
                    <td>${this.formatDate(txn.date)}</td>
                    <td>${txn.description}</td>
                    <td>
                        <span class="category-badge" onclick="app.openCategoryEditor('${txn.id}')" title="Clic para cambiar">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${txn.category}
                        </span>
                    </td>
                    <td class="amount-income">
                        +${this.formatCurrency(Math.abs(txn.amount))}
                    </td>
                    <td>
                        <button class="action-btn" onclick="app.openCategoryEditor('${txn.id}')" title="Recategorizar">
                            <i class="fas fa-tag"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Actualiza la vista de gastos
     */
    updateExpensesView() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        // Calcular estadísticas
        const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const categories = new Set(expenses.map(t => t.category)).size;
        
        // Calcular promedio mensual
        const months = this.getUniqueMonths(expenses);
        const averageMonthly = months.length > 0 ? totalExpense / months.length : 0;

        document.getElementById('expensesTotal').textContent = this.formatCurrency(totalExpense);
        document.getElementById('expensesCategories').textContent = categories;
        document.getElementById('expensesAverage').textContent = this.formatCurrency(averageMonthly);

        // Actualizar gráficos
        this.charts.updateExpensesCategoryChart(expenses);
        this.charts.updateExpensesEvolutionChart(expenses);

        // Actualizar tablas
        this.updateExpensesCategoriesTable(expenses);
        this.updateAllExpenseTransactionsTable(expenses);
    }

    /**
     * Actualiza la tabla de categorías de gastos
     */
    updateExpensesCategoriesTable(expenses) {
        const tbody = document.querySelector('#expensesCategoriesTable tbody');
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No hay datos de gastos</td></tr>';
            return;
        }

        const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Agrupar por categoría
        const categoryStats = {};
        expenses.forEach(txn => {
            if (!categoryStats[txn.category]) {
                categoryStats[txn.category] = {
                    total: 0,
                    count: 0
                };
            }
            categoryStats[txn.category].total += Math.abs(txn.amount);
            categoryStats[txn.category].count++;
        });

        // Convertir a array y ordenar
        const categories = Object.entries(categoryStats)
            .map(([category, stats]) => ({ category, ...stats }))
            .sort((a, b) => b.total - a.total);

        tbody.innerHTML = categories.map(item => {
            const categoryInfo = getCategoryInfo(item.category);
            const percentage = (item.total / total * 100).toFixed(1);
            
            return `
                <tr>
                    <td>
                        <span class="category-badge">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${item.category}
                        </span>
                    </td>
                    <td class="amount-expense">${this.formatCurrency(item.total)}</td>
                    <td>${item.count}</td>
                    <td>${this.formatCurrency(item.total / item.count)}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Actualiza la tabla de todas las transacciones de gastos
     */
    updateAllExpenseTransactionsTable(expenses) {
        const tbody = document.querySelector('#allExpenseTransactionsTable tbody');
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No hay transacciones de gastos</td></tr>';
            return;
        }

        // Ordenar por fecha descendente
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedExpenses.map(txn => {
            const categoryInfo = getCategoryInfo(txn.category);
            
            return `
                <tr>
                    <td>${this.formatDate(txn.date)}</td>
                    <td>${txn.description}</td>
                    <td>
                        <span class="category-badge" onclick="app.openCategoryEditor('${txn.id}')" title="Clic para cambiar">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${txn.category}
                        </span>
                    </td>
                    <td class="amount-expense">
                        -${this.formatCurrency(Math.abs(txn.amount))}
                    </td>
                    <td>
                        <button class="action-btn" onclick="app.openCategoryEditor('${txn.id}')" title="Recategorizar">
                            <i class="fas fa-tag"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Actualiza la vista de balance mensual
     */
    updateMonthlyBalanceView() {
        this.populateMonthYearSelectors();
        this.updateMonthlyView();
    }

    /**
     * Pobla los selectores de mes y año
     */
    populateMonthYearSelectors() {
        if (this.transactions.length === 0) return;

        const dates = this.transactions.map(t => new Date(t.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');

        // Poblar años
        const years = [];
        for (let year = minDate.getFullYear(); year <= maxDate.getFullYear(); year++) {
            years.push(year);
        }

        yearSelect.innerHTML = years.map(year => 
            `<option value="${year}">${year}</option>`
        ).join('');

        // Seleccionar año más reciente
        yearSelect.value = maxDate.getFullYear();

        // Poblar meses
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        monthSelect.innerHTML = months.map((month, index) => 
            `<option value="${index}">${month}</option>`
        ).join('');

        // Seleccionar mes más reciente
        monthSelect.value = maxDate.getMonth();
    }

    /**
     * Actualiza la vista del mes seleccionado
     */
    updateMonthlyView() {
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');

        if (!monthSelect.value || !yearSelect.value) return;

        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);

        const monthTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        const incomes = monthTransactions.filter(t => t.type === 'income');
        const expenses = monthTransactions.filter(t => t.type === 'expense');

        const totalIncome = incomes.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const balance = totalIncome - totalExpense;

        document.getElementById('monthIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('monthExpense').textContent = this.formatCurrency(totalExpense);
        document.getElementById('monthBalance').textContent = this.formatCurrency(balance);
        document.getElementById('monthTransactions').textContent = monthTransactions.length;

        // Actualizar gráfico de evolución
        this.charts.updateMonthlyEvolutionChart(this.transactions);

        // Actualizar tabla de todos los meses
        this.updateAllMonthsTable();
    }

    /**
     * Navega entre meses
     */
    navigateMonth(direction) {
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');

        let month = parseInt(monthSelect.value);
        let year = parseInt(yearSelect.value);

        month += direction;

        if (month < 0) {
            month = 11;
            year--;
        } else if (month > 11) {
            month = 0;
            year++;
        }

        // Verificar que el año existe en el selector
        const yearOption = Array.from(yearSelect.options).find(opt => opt.value == year);
        if (!yearOption) return;

        monthSelect.value = month;
        yearSelect.value = year;

        this.updateMonthlyView();
    }

    /**
     * Actualiza la tabla de todos los meses
     */
    updateAllMonthsTable() {
        const tbody = document.querySelector('#allMonthsTable tbody');
        
        if (this.transactions.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No hay datos mensuales</td></tr>';
            return;
        }

        const monthlyData = this.getMonthlyData();
        
        tbody.innerHTML = monthlyData.map(item => {
            const savingsRate = item.income > 0 
                ? ((item.balance / item.income) * 100).toFixed(1)
                : '0.0';
            
            return `
                <tr>
                    <td><strong>${item.month}</strong></td>
                    <td class="amount-income">${this.formatCurrency(item.income)}</td>
                    <td class="amount-expense">${this.formatCurrency(item.expense)}</td>
                    <td class="${item.balance >= 0 ? 'amount-income' : 'amount-expense'}">
                        ${this.formatCurrency(item.balance)}
                    </td>
                    <td>${item.transactions}</td>
                    <td>${savingsRate}%</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Obtiene datos agrupados por mes
     */
    getMonthlyData() {
        const monthlyMap = {};

        this.transactions.forEach(txn => {
            const date = new Date(txn.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap[key]) {
                monthlyMap[key] = {
                    month: this.formatMonthYear(date),
                    income: 0,
                    expense: 0,
                    transactions: 0
                };
            }

            if (txn.type === 'income') {
                monthlyMap[key].income += Math.abs(txn.amount);
            } else {
                monthlyMap[key].expense += Math.abs(txn.amount);
            }
            monthlyMap[key].transactions++;
        });

        return Object.values(monthlyMap)
            .map(item => ({
                ...item,
                balance: item.income - item.expense
            }))
            .sort((a, b) => b.month.localeCompare(a.month));
    }

    /**
     * Actualiza la vista de reglas
     */
    updateRulesView() {
        const stats = this.rulesManager.getStatistics();

        document.getElementById('activeRulesCount').textContent = stats.totalRules;
        document.getElementById('rulesApplications').textContent = stats.totalApplications;
        document.getElementById('lastRuleUpdate').textContent = stats.lastUpdate 
            ? this.formatDate(new Date(stats.lastUpdate))
            : '-';

        this.updateRulesTable();
    }

    /**
     * Actualiza la tabla de reglas
     */
    updateRulesTable() {
        const tbody = document.querySelector('#rulesTable tbody');
        const rules = this.rulesManager.getAllRules();

        if (rules.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">
                        No hay reglas configuradas. 
                        <br>
                        <small>Las reglas se crean automáticamente cuando categorizas transacciones en la pestaña de Transacciones.</small>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rules.map(rule => {
            const categoryInfo = getCategoryInfo(rule.category);
            
            return `
                <tr>
                    <td><strong>${rule.pattern}</strong></td>
                    <td>
                        <span class="category-badge">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${rule.category}
                        </span>
                    </td>
                    <td>${this.formatDate(new Date(rule.createdAt))}</td>
                    <td>${rule.applications}</td>
                    <td>
                        <button class="action-btn delete" onclick="app.deleteRule('${rule.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Actualiza la vista de transacciones
     */
    updateTransactionsView() {
        this.populateCategoryFilter();
        this.filterTransactions();
    }

    /**
     * Pobla el filtro de categorías
     */
    populateCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        const categories = [...new Set(this.transactions.map(t => t.category))].sort();

        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    }

    /**
     * Actualiza la tabla de transacciones
     */
    updateTransactionsTable() {
        const tbody = document.querySelector('#transactionsTable tbody');
        
        document.getElementById('filterInfo').textContent = 
            `Mostrando ${this.filteredTransactions.length} de ${this.transactions.length} transacciones`;

        if (this.filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No hay transacciones. Carga archivos en la pestaña Dashboard.</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredTransactions.map(txn => {
            const categoryInfo = getCategoryInfo(txn.category);
            const amountClass = txn.type === 'income' ? 'amount-income' : 'amount-expense';
            const sign = txn.type === 'income' ? '+' : '-';

            return `
                <tr>
                    <td>${this.formatDate(txn.date)}</td>
                    <td>${txn.description}</td>
                    <td>
                        <span class="category-badge" onclick="app.openCategoryEditor('${txn.id}')" title="Clic para cambiar">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${txn.category}
                        </span>
                    </td>
                    <td class="${amountClass}">
                        ${sign}${this.formatCurrency(Math.abs(txn.amount))}
                    </td>
                    <td>
                        <button class="action-btn" onclick="app.openCategoryEditor('${txn.id}')" title="Categorizar">
                            <i class="fas fa-tag"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Actualizar iconos de ordenación
        document.querySelectorAll('#transactionsTable th[data-sort] i').forEach(icon => {
            const th = icon.parentElement;
            const column = th.dataset.sort;
            
            if (column === this.sortColumn) {
                icon.className = this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    }

    /**
     * Obtiene los meses únicos de un conjunto de transacciones
     */
    getUniqueMonths(transactions) {
        const months = new Set();
        transactions.forEach(txn => {
            const date = new Date(txn.date);
            months.add(`${date.getFullYear()}-${date.getMonth()}`);
        });
        return Array.from(months);
    }

    /**
     * Muestra una notificación
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Guarda datos en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('finance_transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showNotification('Error al guardar datos', 'error');
        }
    }

    /**
     * Carga datos desde localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('finance_transactions');
            if (stored) {
                this.transactions = JSON.parse(stored);
                console.log(`✅ Cargadas ${this.transactions.length} transacciones`);
            }
        } catch (error) {
            console.error('Error al cargar:', error);
            this.transactions = [];
        }
    }

    /**
     * Formatea una fecha
     */
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    /**
     * Formatea mes y año
     */
    formatMonthYear(date) {
        return date.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    /**
     * Formatea un importe como moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
});
