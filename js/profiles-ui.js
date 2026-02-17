/**
 * UI del Sistema de Perfiles
 * Gestiona la interacción del usuario con los perfiles
 */

class ProfileUI {
    constructor(profileManager, onProfileLogin) {
        this.profileManager = profileManager;
        this.onProfileLogin = onProfileLogin;
        this.selectedProfileId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        // Botón crear perfil
        document.getElementById('createProfileBtn').addEventListener('click', () => {
            this.showCreateProfileModal();
        });

        // Modal crear perfil
        document.getElementById('closeCreateProfileModal').addEventListener('click', () => {
            this.hideCreateProfileModal();
        });

        document.getElementById('cancelCreateProfileBtn').addEventListener('click', () => {
            this.hideCreateProfileModal();
        });

        document.getElementById('confirmCreateProfileBtn').addEventListener('click', () => {
            this.handleCreateProfile();
        });

        // Modal PIN
        document.getElementById('closePinModal').addEventListener('click', () => {
            this.hidePinModal();
        });

        document.getElementById('cancelPinBtn').addEventListener('click', () => {
            this.hidePinModal();
        });

        document.getElementById('confirmPinBtn').addEventListener('click', () => {
            this.handlePinSubmit();
        });

        // Enter en inputs
        document.getElementById('pinInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePinSubmit();
            }
        });

        document.getElementById('profilePinConfirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCreateProfile();
            }
        });

        // Botón cerrar sesión
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    checkLoginStatus() {
        if (this.profileManager.isLoggedIn()) {
            // Usuario ya tiene sesión activa
            this.hideProfileScreen();
            this.updateHeaderProfile();
            if (this.onProfileLogin) {
                this.onProfileLogin();
            }
        } else {
            // Mostrar pantalla de perfiles
            this.showProfileScreen();
        }
    }

    showProfileScreen() {
        document.getElementById('profileScreen').style.display = 'flex';
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.tabs-navigation').style.display = 'none';
        document.querySelector('.main-content').style.display = 'none';
        document.querySelector('.footer').style.display = 'none';
        
        this.renderProfiles();
    }

    hideProfileScreen() {
        document.getElementById('profileScreen').style.display = 'none';
        document.querySelector('.header').style.display = 'block';
        document.querySelector('.tabs-navigation').style.display = 'block';
        document.querySelector('.main-content').style.display = 'block';
        document.querySelector('.footer').style.display = 'block';
    }

    renderProfiles() {
        const profiles = this.profileManager.getAllProfiles();
        const profileList = document.getElementById('profileList');
        const createBtn = document.getElementById('createProfileBtn');
        const MAX_PROFILES = 3;

        if (profiles.length === 0) {
            profileList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-user-plus" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 16px;">No hay perfiles creados aún</p>
                    <p style="font-size: 14px;">Crea tu primer perfil para empezar</p>
                </div>
            `;
            createBtn.disabled = false;
            createBtn.style.opacity = '1';
            return;
        }

        profileList.innerHTML = profiles.map(profile => {
            const initial = profile.name.charAt(0).toUpperCase();
            const stats = this.profileManager.getProfileStats(profile.id);
            const lastAccessDate = new Date(profile.lastAccess);
            const lastAccessText = this.formatLastAccess(lastAccessDate);

            return `
                <div class="profile-card" data-profile-id="${profile.id}">
                    <div class="profile-card-info">
                        <div class="profile-avatar">${initial}</div>
                        <div class="profile-details">
                            <h3>${this.escapeHtml(profile.name)}</h3>
                            <p>${stats.transactionCount} transacciones • ${lastAccessText}</p>
                        </div>
                    </div>
                    <div class="profile-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `;
        }).join('');

        // Gestionar límite de perfiles
        if (profiles.length >= MAX_PROFILES) {
            createBtn.disabled = true;
            createBtn.style.opacity = '0.5';
            createBtn.title = `Límite alcanzado (${MAX_PROFILES} perfiles máximo)`;
            
            // Agregar mensaje de límite
            profileList.innerHTML += `
                <div style="text-align: center; padding: 20px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #f56565; margin-top: 16px;">
                    <i class="fas fa-info-circle" style="color: #f56565; font-size: 20px; margin-bottom: 8px;"></i>
                    <p style="font-size: 14px; color: #721c24; margin: 0;">
                        <strong>Límite alcanzado:</strong> ${MAX_PROFILES} perfiles máximo por instalación.
                        <br>Esta limitación previene el uso compartido no autorizado.
                    </p>
                </div>
            `;
        } else {
            createBtn.disabled = false;
            createBtn.style.opacity = '1';
            createBtn.title = `Crear Nuevo Perfil (${profiles.length}/${MAX_PROFILES})`;
        }

        // Agregar event listeners a las tarjetas
        profileList.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', () => {
                const profileId = card.dataset.profileId;
                this.handleProfileSelect(profileId);
            });
        });
    }

    formatLastAccess(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) return 'Ahora mismo';
        if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleProfileSelect(profileId) {
        this.selectedProfileId = profileId;
        const profiles = this.profileManager.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (profile) {
            this.showPinModal(profile.name);
        }
    }

    showCreateProfileModal() {
        document.getElementById('createProfileModal').style.display = 'flex';
        document.getElementById('profileName').value = '';
        document.getElementById('profilePin').value = '';
        document.getElementById('profilePinConfirm').value = '';
        document.getElementById('profileRecoveryWord').value = '';
        document.getElementById('profileName').focus();
    }

    hideCreateProfileModal() {
        document.getElementById('createProfileModal').style.display = 'none';
    }

    handleCreateProfile() {
        const name = document.getElementById('profileName').value.trim();
        const pin = document.getElementById('profilePin').value;
        const pinConfirm = document.getElementById('profilePinConfirm').value;
        const recoveryWord = document.getElementById('profileRecoveryWord').value.trim();

        // Validaciones
        if (!name) {
            alert('⚠️ Por favor ingresa un nombre para el perfil');
            return;
        }

        if (!pin || pin.length < 4) {
            alert('⚠️ El PIN debe tener al menos 4 dígitos');
            return;
        }

        if (!/^\d+$/.test(pin)) {
            alert('⚠️ El PIN debe contener solo números');
            return;
        }

        if (pin !== pinConfirm) {
            alert('⚠️ Los PINs no coinciden');
            return;
        }

        try {
            const profile = this.profileManager.createProfile(name, pin, recoveryWord);
            
            // Hacer login automáticamente con el nuevo perfil
            this.profileManager.loginProfile(profile.id, pin);
            
            this.hideCreateProfileModal();
            this.hideProfileScreen();
            this.updateHeaderProfile();
            
            alert(`✅ Perfil "${name}" creado exitosamente`);
            
            if (this.onProfileLogin) {
                this.onProfileLogin();
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }

    showPinModal(profileName) {
        document.getElementById('pinModalProfileName').textContent = `Perfil: ${profileName}`;
        document.getElementById('pinInput').value = '';
        document.getElementById('pinError').style.display = 'none';
        document.getElementById('pinModal').style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('pinInput').focus();
        }, 100);
    }

    hidePinModal() {
        document.getElementById('pinModal').style.display = 'none';
        this.selectedProfileId = null;
    }

    handlePinSubmit() {
        const pin = document.getElementById('pinInput').value;
        const pinError = document.getElementById('pinError');

        if (!pin) {
            pinError.textContent = 'Ingresa tu PIN';
            pinError.style.display = 'block';
            return;
        }

        try {
            this.profileManager.loginProfile(this.selectedProfileId, pin);
            
            this.hidePinModal();
            this.hideProfileScreen();
            this.updateHeaderProfile();

            if (this.onProfileLogin) {
                this.onProfileLogin();
            }
        } catch (error) {
            pinError.textContent = 'PIN incorrecto';
            pinError.style.display = 'block';
            document.getElementById('pinInput').value = '';
            document.getElementById('pinInput').focus();
        }
    }

    updateHeaderProfile() {
        const profile = this.profileManager.getCurrentProfile();
        
        if (profile) {
            document.getElementById('profileInfo').style.display = 'flex';
            document.getElementById('currentProfileName').textContent = profile.name;
        } else {
            document.getElementById('profileInfo').style.display = 'none';
        }
    }

    handleLogout() {
        if (!confirm('¿Seguro que quieres cerrar sesión?')) {
            return;
        }

        this.profileManager.logoutProfile();
        this.showProfileScreen();
        this.updateHeaderProfile();
    }
}

// Exportar para uso global
window.ProfileUI = ProfileUI;
