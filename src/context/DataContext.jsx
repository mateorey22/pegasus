import { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storage';

const DataContext = createContext(null);

const INITIAL_STATE = {
    user: {
        name: '',
        age: '',
        height: '',
        weight: '',
        gender: '',
        fitnessLevel: 'beginner',
        climbingGrade: 'V0',
        goals: [],
        equipment: [],
        availability: {
            daysPerWeek: 3,
            minutesPerSession: 60
        },
        injuries: ''
    },
    logs: {
        workouts: [],
        nutrition: [],
        water: [],
        sleep: [], // { date, duration, quality }
        energy: [], // { date, level, time }
        measurements: []
    },
    projects: [], // { id, name, grade, image, description, attempts: [], status }
    settings: {
        apiKey: '',
        theme: 'dark',
        notifications: true
    },
    onboardingCompleted: false
};

export function DataProvider({ children }) {
    const [data, setData] = useState(() => {
        const saved = storageService.load();
        return saved || INITIAL_STATE;
    });

    // Auto-save whenever data changes
    useEffect(() => {
        storageService.save(data);
    }, [data]);

    const updateSection = (section, payload) => {
        setData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...payload }
        }));
    };

    const addLog = (type, entry) => {
        setData(prev => ({
            ...prev,
            logs: {
                ...prev.logs,
                [type]: [...(prev.logs[type] || []), { ...entry, id: Date.now(), timestamp: new Date().toISOString() }]
            }
        }));
    };

    const importBackup = async (file) => {
        try {
            const importedData = await storageService.importData(file);
            // Smart merge could go here. For now, we overwrite or merge top-level.
            // Let's do a shallow merge for safety, preferring imported data.
            setData(prev => ({ ...prev, ...importedData }));
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    };

    const resetData = () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            setData(INITIAL_STATE);
        }
    };

    const value = {
        data,
        updateSection,
        addLog,
        importBackup,
        resetData,
        exportData: storageService.exportData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
