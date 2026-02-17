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
        this.profileManager = new ProfileManager();
        this.licenseManager = new LicenseManager();
        this.licenseUI = null;
        this.profileUI = null;
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.currentTab = 'dashboard';
        this.currentEditingTransaction = null;
        
        this.init();
    }

    init() {
        if (!this.licenseManager.isActivated()) {
            this.showLicenseScreen();
            return;
        }

        this.profileUI = new ProfileUI(this.profileManager, () => {
            this.onProfileLogin();
        });

        if (this.profileManager.isLoggedIn()) {
            this.loadFromStorage();
            this.setupEventListeners();
            this.updateUI();
        } else {
            this.setupEventListeners();
        }
    }

    showLicenseScreen() {
        const licenseScreen = document.getElementById('licenseScreen');
        if (!licenseScreen) {
            console.error('No se encontró #licenseScreen');
            return;
        }

        const profileScreen = document.getElementById('profileScreen');
        const appScreen = document.getElementById('app');
        
        if (profileScreen) profileScreen.style.display = 'none';
        if (appScreen) appScreen.style.display = 'none';

        licenseScreen.style.display = 'flex';

        this.licenseUI = new LicenseUI(this.licenseManager);
        this.licenseUI.onActivated = () => {
            this.onLicenseActivated();
        };
        this.licenseUI.renderActivationScreen();
    }

    onLicenseActivated() {
        document.getElementById('licenseScreen').style.display = 'none';

        this.profileUI = new ProfileUI(this.profileManager, () => {
            this.onProfileLogin();
        });

        this.setupEventListeners();
    }

    onProfileLogin() {
        this.loadFromStorage();
        this.updateUI();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');

        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

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

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTransactions();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.querySelectorAll('#transactionsTable th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTransactions(column);
            });
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeCategoryEditor();
        });

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

        document.getElementById('applyRulesBtn').addEventListener('click', () => {
            this.applyRulesToAll();
        });

        document.getElementById('clearRulesBtn').addEventListener('click', () => {
            this.clearAllRules();
        });

        document.getElementById('dashboardMonthFilter').addEventListener('change', (e) => {
            this.filterDashboardByMonth(e.target.value);
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });

        this.currentTab = tabName;

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

    async handleFiles(files) {
        if (!files || files.length === 0) return;

        this.showNotification('📂 Procesando archivos...', 'info');

        let totalParsed = 0;
        let totalDuplicates = 0;
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
                
                const duplicateCheck = this.parser.filterDuplicates(transactions, this.transactions);
                const uniqueTransactions = duplicateCheck.unique;
                const duplicateTransactions = duplicateCheck.duplicates;

                console.log(`🔍 Duplicados: ${duplicateTransactions.length} | Únicos: ${uniqueTransactions.length}`);
                
                const rulesResult = this.rulesManager.applyRulesToTransactions(uniqueTransactions);
                
                this.transactions.push(...uniqueTransactions);
                totalParsed += uniqueTransactions.length;
                totalDuplicates += duplicateTransactions.length;
                filesProcessed++;

                let importMsg = `📊 ${file.name}:\n`;
                importMsg += `✅ ${uniqueTransactions.length} nuevas\n`;
                
                if (duplicateTransactions.length > 0) {
                    importMsg += `⚠️ ${duplicateTransactions.length} duplicadas (ignoradas)`;
                }

                if (rulesResult.applied ><span class="cursor">█</span>
