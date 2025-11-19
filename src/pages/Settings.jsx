import { useState } from 'react';
import { useData } from '../context/DataContext';
import { notificationService } from '../services/notifications';
import { motion } from 'framer-motion';
import { Save, Upload, Download, Trash2, Key, Database, AlertTriangle, Settings as SettingsIcon, Bell } from 'lucide-react';

export function Settings() {
    const { data, updateSection, exportData, importBackup, resetData } = useData();
    const [apiKey, setApiKey] = useState(data.settings.apiKey);

    const handleSaveKey = () => {
        updateSection('settings', { apiKey });
        alert('API Key saved!');
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const success = await importBackup(file);
            if (success) alert('Data imported successfully!');
            else alert('Failed to import data.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container"
            style={{ paddingTop: '2rem' }}
        >
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SettingsIcon className="text-primary" /> Settings
            </h1>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Key size={20} className="text-primary" /> Gemini API Key
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Required for AI features like workout generation and photo analysis. Your key is stored locally on your device.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSaveKey}
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '0 20px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Save size={18} /> Save
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={20} className="text-primary" /> Notifications
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enable notifications to get alerts for rest timers and workout reminders.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={async () => {
                            const granted = await notificationService.requestPermission();
                            if (granted) alert('Notifications enabled!');
                            else alert('Notifications denied. Please check your browser settings.');
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Enable Notifications
                    </button>
                    <button
                        onClick={() => notificationService.send('Pegasus Fitness', { body: 'This is a test notification!' })}
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Test Notification
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Database size={20} className="text-primary" /> Data Management
                </h2>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={exportData}
                        style={{
                            border: '1px solid var(--color-primary)',
                            background: 'rgba(255, 85, 0, 0.1)',
                            color: 'var(--color-primary)',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={18} /> Export Data (JSON)
                    </button>

                    <label style={{
                        border: '1px solid var(--color-text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--color-text-muted)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}>
                        <Upload size={18} /> Import Data
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderColor: 'rgba(255, 59, 48, 0.3)', background: 'rgba(255, 59, 48, 0.05)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} /> Danger Zone
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    This action cannot be undone. All your logs, schedule, and settings will be permanently deleted.
                </p>
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                            resetData();
                        }
                    }}
                    style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid var(--color-danger)',
                        color: 'var(--color-danger)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    <Trash2 size={18} /> Reset All Data
                </button>
            </div>
        </motion.div>
    );
}
