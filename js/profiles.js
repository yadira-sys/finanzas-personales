/**
 * Sistema de Perfiles con PIN
 * Permite múltiples usuarios con datos separados y protegidos
 */

class ProfileManager {
    constructor() {
        this.currentProfile = null;
        this.storageKey = 'finance_profiles';
        this.currentProfileKey = 'current_profile';
        this.init();
    }

    /**
     * Inicializa el sistema de perfiles
     */
    init() {
        this.loadCurrentProfile();
    }

    /**
     * Obtiene todos los perfiles almacenados
     */
    getAllProfiles() {
        try {
            const profiles = localStorage.getItem(this.storageKey);
            return profiles ? JSON.parse(profiles) : [];
        } catch (error) {
            console.error('Error cargando perfiles:', error);
            return [];
        }
    }

    /**
     * Guarda la lista de perfiles
     */
    saveProfiles(profiles) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(profiles));
            return true;
        } catch (error) {
            console.error('Error guardando perfiles:', error);
            return false;
        }
    }

    /**
     * Crea un nuevo perfil
     */
    createProfile(name, pin, recoveryWord = '') {
        // Validaciones
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del perfil no puede estar vacío');
        }

        if (!pin || pin.length < 4) {
            throw new Error('El PIN debe tener al menos 4 dígitos');
        }

        const profiles = this.getAllProfiles();

        // LÍMITE DE PERFILES (Anti-piratería)
        const MAX_PROFILES = 3;
        if (profiles.length >= MAX_PROFILES) {
            throw new Error(`Límite alcanzado: Solo puedes crear ${MAX_PROFILES} perfiles por instalación. Esta limitación previene el uso compartido no autorizado.`);
        }

        // Verificar si ya existe un perfil con ese nombre
        if (profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Ya existe un perfil con ese nombre');
        }

        // Crear nuevo perfil
        const profile = {
            id: this.generateProfileId(),
            name: name.trim(),
            pin: this.hashPin(pin),
            recoveryWord: recoveryWord ? this.hashPin(recoveryWord.toLowerCase().trim()) : null,
            createdAt: new Date().toISOString(),
            lastAccess: new Date().toISOString()
        };

        profiles.push(profile);
        this.saveProfiles(profiles);

        return profile;
    }

    /**
     * Verifica el PIN de un perfil
     */
    verifyPin(profileId, pin) {
        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            return false;
        }

        return profile.pin === this.hashPin(pin);
    }

    /**
     * Inicia sesión en un perfil
     */
    loginProfile(profileId, pin) {
        if (!this.verifyPin(profileId, pin)) {
            throw new Error('PIN incorrecto');
        }

        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            throw new Error('Perfil no encontrado');
        }

        // Actualizar último acceso
        profile.lastAccess = new Date().toISOString();
        this.saveProfiles(profiles);

        // Establecer perfil actual
        this.currentProfile = profile;
        localStorage.setItem(this.currentProfileKey, profile.id);

        return profile;
    }

    /**
     * Cierra sesión del perfil actual
     */
    logoutProfile() {
        this.currentProfile = null;
        localStorage.removeItem(this.currentProfileKey);
    }

    /**
     * Carga el perfil actual desde localStorage
     */
    loadCurrentProfile() {
        const profileId = localStorage.getItem(this.currentProfileKey);
        
        if (profileId) {
            const profiles = this.getAllProfiles();
            const profile = profiles.find(p => p.id === profileId);
            
            if (profile) {
                this.currentProfile = profile;
            } else {
                // Perfil no encontrado, limpiar
                localStorage.removeItem(this.currentProfileKey);
            }
        }
    }

    /**
     * Obtiene el perfil actual
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Verifica si hay un perfil activo
     */
    isLoggedIn() {
        return this.currentProfile !== null;
    }

    /**
     * Elimina un perfil
     */
    deleteProfile(profileId, pin) {
        if (!this.verifyPin(profileId, pin)) {
            throw new Error('PIN incorrecto');
        }

        const profiles = this.getAllProfiles();
        const filteredProfiles = profiles.filter(p => p.id !== profileId);
        
        this.saveProfiles(filteredProfiles);

        // Si es el perfil actual, cerrar sesión
        if (this.currentProfile && this.currentProfile.id === profileId) {
            this.logoutProfile();
        }

        // Eliminar datos del perfil
        this.deleteProfileData(profileId);

        return true;
    }

    /**
     * Cambia el PIN de un perfil
     */
    changePin(profileId, oldPin, newPin) {
        if (!this.verifyPin(profileId, oldPin)) {
            throw new Error('PIN actual incorrecto');
        }

        if (!newPin || newPin.length < 4) {
            throw new Error('El nuevo PIN debe tener al menos 4 dígitos');
        }

        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            throw new Error('Perfil no encontrado');
        }

        profile.pin = this.hashPin(newPin);
        this.saveProfiles(profiles);

        return true;
    }

    /**
     * Recuperar acceso con palabra secreta
     */
    recoverWithSecretWord(profileId, recoveryWord) {
        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            throw new Error('Perfil no encontrado');
        }

        if (!profile.recoveryWord) {
            throw new Error('Este perfil no tiene palabra de recuperación configurada');
        }

        const hashedWord = this.hashPin(recoveryWord.toLowerCase().trim());
        
        if (profile.recoveryWord !== hashedWord) {
            throw new Error('Palabra de recuperación incorrecta');
        }

        // Retornar true si la palabra es correcta
        // El usuario podrá crear un nuevo PIN
        return true;
    }

    /**
     * Genera un ID único para el perfil
     */
    generateProfileId() {
        return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Hash simple para el PIN (en producción usar bcrypt o similar)
     */
    hashPin(pin) {
        // Hash simple usando btoa (en producción, usar una librería de hashing segura)
        let hash = 0;
        const str = pin + 'salt_finance_app'; // Agregar salt
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString(36);
    }

    /**
     * Obtiene la clave de almacenamiento para los datos del perfil
     */
    getProfileDataKey(profileId) {
        return `profile_data_${profileId}`;
    }

    /**
     * Guarda datos del perfil actual
     */
    saveProfileData(data) {
        if (!this.currentProfile) {
            throw new Error('No hay perfil activo');
        }

        const key = this.getProfileDataKey(this.currentProfile.id);
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos del perfil:', error);
            return false;
        }
    }

    /**
     * Carga datos del perfil actual
     */
    loadProfileData() {
        if (!this.currentProfile) {
            return null;
        }

        const key = this.getProfileDataKey(this.currentProfile.id);
        
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error cargando datos del perfil:', error);
            return null;
        }
    }

    /**
     * Elimina todos los datos de un perfil
     */
    deleteProfileData(profileId) {
        const key = this.getProfileDataKey(profileId);
        localStorage.removeItem(key);
    }

    /**
     * Obtiene estadísticas del perfil
     */
    getProfileStats(profileId) {
        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            return null;
        }

        const dataKey = this.getProfileDataKey(profileId);
        const data = localStorage.getItem(dataKey);
        
        let transactionCount = 0;
        if (data) {
            try {
                const parsed = JSON.parse(data);
                transactionCount = parsed.transactions ? parsed.transactions.length : 0;
            } catch (e) {
                // Ignorar error
            }
        }

        return {
            name: profile.name,
            createdAt: profile.createdAt,
            lastAccess: profile.lastAccess,
            transactionCount: transactionCount
        };
    }
}

// Exportar para uso global
window.ProfileManager = ProfileManager;
