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

    init() {
        this.loadCurrentProfile();
    }

    getAllProfiles() {
        try {
            const profiles = localStorage.getItem(this.storageKey);
            return profiles ? JSON.parse(profiles) : [];
        } catch (error) {
            console.error('Error cargando perfiles:', error);
            return [];
        }
    }

    saveProfiles(profiles) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(profiles));
            return true;
        } catch (error) {
            console.error('Error guardando perfiles:', error);
            return false;
        }
    }

    createProfile(name, pin, recoveryWord = '') {
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del perfil no puede estar vacío');
        }

        if (!pin || pin.length < 4) {
            throw new Error('El PIN debe tener al menos 4 dígitos');
        }

        const profiles = this.getAllProfiles();

        const MAX_PROFILES = 3;
        if (profiles.length >= MAX_PROFILES) {
            throw new Error(`Límite alcanzado: Solo puedes crear ${MAX_PROFILES} perfiles por instalación. Esta limitación previene el uso compartido no autorizado.`);
        }

        if (profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Ya existe un perfil con ese nombre');
        }

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

    verifyPin(profileId, pin) {
        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            return false;
        }

        return profile.pin === this.hashPin(pin);
    }

    loginProfile(profileId, pin) {
        if (!this.verifyPin(profileId, pin)) {
            throw new Error('PIN incorrecto');
        }

        const profiles = this.getAllProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) {
            throw new Error('Perfil no encontrado');
        }

        profile.lastAccess = new Date().toISOString();
        this.saveProfiles(profiles);

        this.currentProfile = profile;
        localStorage.setItem(this.currentProfileKey, profile.id);

        return profile;
    }

    logoutProfile() {
        this.currentProfile = null;
        localStorage.removeItem(this.currentProfileKey);
    }

    loadCurrentProfile() {
        const profileId = localStorage.getItem(this.currentProfileKey);
        
        if (profileId) {
            const profiles = this.getAllProfiles();
            const profile = profiles.find(p => p.id === profileId);
            
            if (profile) {
                this.currentProfile = profile;
            } else {
                localStorage.removeItem(this.currentProfileKey);
            }
        }
    }

    getCurrentProfile() {
        return this.currentProfile;
    }

    isLoggedIn() {
        return this.currentProfile !== null;
    }

    deleteProfile(profileId, pin) {
        if (!this.verifyPin(profileId, pin)) {
            throw new Error('PIN incorrecto');
        }

        const profiles = this.getAllProfiles();
        const filteredProfiles = profiles.filter(p => p.id !== profileId);
        
        this.saveProfiles(filteredProfiles);

        if (this.currentProfile && this.currentProfile.id === profileId) {
            this.logoutProfile();
        }

        this.deleteProfileData(profileId);

        return true;
    }

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

        return true;
    }

    generateProfileId() {
        return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    hashPin(pin) {
        let hash = 0;
        const str = pin + 'salt_finance_app';
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return hash.toString(36);
    }

    getProfileDataKey(profileId) {
        return `profile_data_${profileId}`;
    }

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

    deleteProfileData(profileId) {
        const key = this.getProfileDataKey(profileId);
        localStorage.removeItem(key);
    }

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

window.ProfileManager = ProfileManager;
