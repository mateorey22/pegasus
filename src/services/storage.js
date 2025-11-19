const STORAGE_KEY = 'pegasus_data_v1';

export const storageService = {
    save: (data) => {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    },

    load: () => {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return null;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    },

    exportData: () => {
        const data = storageService.load();
        if (!data) return null;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `pegasus_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },

    importData: async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);

                    // Schema Validation
                    if (!json || typeof json !== 'object') {
                        throw new Error('Invalid data format');
                    }

                    const requiredKeys = ['user', 'logs', 'settings'];
                    const missingKeys = requiredKeys.filter(key => !json[key]);

                    if (missingKeys.length > 0) {
                        throw new Error(`Missing required sections: ${missingKeys.join(', ')}`);
                    }

                    // Ensure logs structure exists
                    if (!json.logs.workouts) json.logs.workouts = [];
                    if (!json.logs.nutrition) json.logs.nutrition = [];
                    if (!json.logs.water) json.logs.water = [];

                    resolve(json);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};
