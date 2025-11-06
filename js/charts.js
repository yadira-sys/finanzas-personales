/**
 * Gestión de gráficos con Chart.js
 */

class FinanceCharts {
    constructor() {
        this.charts = {};
        this.defaultColors = {
            income: '#48bb78',
            expense: '#f56565',
            balance: '#667eea'
        };
        this.categoryColors = this.generateCategoryColors();
    }

    /**
     * Genera colores para categorías
     */
    generateCategoryColors() {
        return [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#fee140', '#30cfd0',
            '#a8edea', '#fed6e3', '#ffecd2', '#fcb69f',
            '#ff9a9e', '#fad0c4', '#ffecd2', '#fcb69f',
            '#ff6a88', '#fbc2eb', '#a6c1ee', '#fbc7d4',
            '#9795f0', '#fbc8d4', '#e0c3fc', '#8ec5fc',
            '#f093fb', '#f5576c', '#4facfe', '#00f2fe'
        ];
    }

    /**
     * Destruye un gráfico existente
     */
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    /**
     * Actualiza el gráfico de ingresos vs gastos mensuales
     */
    updateMonthlyChart(transactions) {
        const chartId = 'monthlyChart';
        this.destroyChart(chartId);

        const monthlyData = this.getMonthlyIncomeExpense(transactions);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: monthlyData.income,
                        backgroundColor: this.defaultColors.income,
                        borderColor: this.defaultColors.income,
                        borderWidth: 1
                    },
                    {
                        label: 'Gastos',
                        data: monthlyData.expense,
                        backgroundColor: this.defaultColors.expense,
                        borderColor: this.defaultColors.expense,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de gastos por categoría (circular)
     */
    updateCategoryChart(transactions) {
        const chartId = 'categoryChart';
        this.destroyChart(chartId);

        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryData = this.getCategoryTotals(expenses);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: this.categoryColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed) + 
                                    ` (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de tendencia de balance
     */
    updateBalanceChart(transactions) {
        const chartId = 'balanceChart';
        this.destroyChart(chartId);

        const balanceData = this.getBalanceTrend(transactions);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: balanceData.labels,
                datasets: [{
                    label: 'Balance Acumulado',
                    data: balanceData.values,
                    borderColor: this.defaultColors.balance,
                    backgroundColor: this.hexToRgba(this.defaultColors.balance, 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Balance: ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de top 10 categorías
     */
    updateTopCategoriesChart(transactions) {
        const chartId = 'topCategoriesChart';
        this.destroyChart(chartId);

        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryData = this.getCategoryTotals(expenses);

        // Tomar solo top 10
        const top10Labels = categoryData.labels.slice(0, 10);
        const top10Values = categoryData.values.slice(0, 10);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10Labels,
                datasets: [{
                    label: 'Gasto Total',
                    data: top10Values,
                    backgroundColor: this.categoryColors.slice(0, 10),
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.x);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de ingresos por fuente
     */
    updateIncomeSourcesChart(incomes) {
        const chartId = 'incomeSourcesChart';
        this.destroyChart(chartId);

        const sourceData = this.getIncomeSourceTotals(incomes);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sourceData.labels,
                datasets: [{
                    data: sourceData.values,
                    backgroundColor: this.categoryColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed) + 
                                    ` (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de evolución de ingresos
     */
    updateIncomeEvolutionChart(incomes) {
        const chartId = 'incomeEvolutionChart';
        this.destroyChart(chartId);

        const monthlyData = this.getMonthlyTotals(incomes);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Ingresos Mensuales',
                    data: monthlyData.values,
                    borderColor: this.defaultColors.income,
                    backgroundColor: this.hexToRgba(this.defaultColors.income, 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de gastos por categoría (para pestaña gastos)
     */
    updateExpensesCategoryChart(expenses) {
        const chartId = 'expensesCategoryChart';
        this.destroyChart(chartId);

        const categoryData = this.getCategoryTotals(expenses);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: this.categoryColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed) + 
                                    ` (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de evolución de gastos
     */
    updateExpensesEvolutionChart(expenses) {
        const chartId = 'expensesEvolutionChart';
        this.destroyChart(chartId);

        const monthlyData = this.getMonthlyTotals(expenses);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Gastos Mensuales',
                    data: monthlyData.values,
                    borderColor: this.defaultColors.expense,
                    backgroundColor: this.hexToRgba(this.defaultColors.expense, 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Actualiza el gráfico de evolución mensual (balance)
     */
    updateMonthlyEvolutionChart(transactions) {
        const chartId = 'monthlyEvolutionChart';
        this.destroyChart(chartId);

        const monthlyData = this.getMonthlyIncomeExpenseBalance(transactions);

        const ctx = document.getElementById(chartId).getContext('2d');
        this.charts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: monthlyData.income,
                        backgroundColor: this.defaultColors.income,
                        borderWidth: 0,
                        order: 2
                    },
                    {
                        label: 'Gastos',
                        data: monthlyData.expense,
                        backgroundColor: this.defaultColors.expense,
                        borderWidth: 0,
                        order: 2
                    },
                    {
                        label: 'Balance',
                        data: monthlyData.balance,
                        type: 'line',
                        borderColor: this.defaultColors.balance,
                        backgroundColor: this.hexToRgba(this.defaultColors.balance, 0.1),
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                    new Intl.NumberFormat('es-ES', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Obtiene datos mensuales de ingresos y gastos
     */
    getMonthlyIncomeExpense(transactions) {
        const monthlyMap = {};

        transactions.forEach(txn => {
            const date = new Date(txn.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap[key]) {
                monthlyMap[key] = { income: 0, expense: 0 };
            }

            if (txn.type === 'income') {
                monthlyMap[key].income += Math.abs(txn.amount);
            } else {
                monthlyMap[key].expense += Math.abs(txn.amount);
            }
        });

        const sorted = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0]));

        return {
            labels: sorted.map(([key]) => this.formatMonthLabel(key)),
            income: sorted.map(([, data]) => data.income),
            expense: sorted.map(([, data]) => data.expense)
        };
    }

    /**
     * Obtiene datos mensuales con balance
     */
    getMonthlyIncomeExpenseBalance(transactions) {
        const data = this.getMonthlyIncomeExpense(transactions);
        
        return {
            ...data,
            balance: data.income.map((inc, i) => inc - data.expense[i])
        };
    }

    /**
     * Obtiene totales por categoría
     */
    getCategoryTotals(transactions) {
        const categoryMap = {};

        transactions.forEach(txn => {
            if (!categoryMap[txn.category]) {
                categoryMap[txn.category] = 0;
            }
            categoryMap[txn.category] += Math.abs(txn.amount);
        });

        const sorted = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1]);

        return {
            labels: sorted.map(([cat]) => cat),
            values: sorted.map(([, val]) => val)
        };
    }

    /**
     * Obtiene totales por fuente de ingreso
     */
    getIncomeSourceTotals(incomes) {
        const sourceMap = {};

        incomes.forEach(txn => {
            const source = txn.incomeSource || 'Otros';
            if (!sourceMap[source]) {
                sourceMap[source] = 0;
            }
            sourceMap[source] += Math.abs(txn.amount);
        });

        const sorted = Object.entries(sourceMap)
            .sort((a, b) => b[1] - a[1]);

        return {
            labels: sorted.map(([source]) => source),
            values: sorted.map(([, val]) => val)
        };
    }

    /**
     * Obtiene totales mensuales
     */
    getMonthlyTotals(transactions) {
        const monthlyMap = {};

        transactions.forEach(txn => {
            const date = new Date(txn.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap[key]) {
                monthlyMap[key] = 0;
            }
            monthlyMap[key] += Math.abs(txn.amount);
        });

        const sorted = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0]));

        return {
            labels: sorted.map(([key]) => this.formatMonthLabel(key)),
            values: sorted.map(([, val]) => val)
        };
    }

    /**
     * Obtiene tendencia de balance acumulado
     */
    getBalanceTrend(transactions) {
        const sorted = [...transactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        let balance = 0;
        const balances = [];
        const labels = [];

        // Agrupar por mes
        const monthlyMap = {};
        sorted.forEach(txn => {
            const date = new Date(txn.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyMap[key]) {
                monthlyMap[key] = 0;
            }

            const amount = txn.type === 'income' 
                ? Math.abs(txn.amount) 
                : -Math.abs(txn.amount);
            
            monthlyMap[key] += amount;
        });

        const sortedMonths = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0]));

        sortedMonths.forEach(([key, amount]) => {
            balance += amount;
            labels.push(this.formatMonthLabel(key));
            balances.push(balance);
        });

        return {
            labels,
            values: balances
        };
    }

    /**
     * Formatea una clave de mes (YYYY-MM) a formato legible
     */
    formatMonthLabel(key) {
        const [year, month] = key.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { 
            month: 'short', 
            year: '2-digit' 
        });
    }

    /**
     * Convierte hex a rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
