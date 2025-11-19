import { useState } from 'react';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function Planner() {
    const { data, updateSection } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!data.settings.apiKey) {
            setError('Please set your Gemini API Key in Settings first.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const newSchedule = await geminiService.generateSchedule(data.user);
            updateSection('schedule', newSchedule);
        } catch (err) {
            setError('Failed to generate schedule. Try again.');
        } finally {
            setLoading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar className="text-primary" /> Weekly Planner
                </h1>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(255, 85, 0, 0.3)'
                    }}
                >
                    <Sparkles size={18} /> {loading ? 'Generating...' : 'Generate (AI)'}
                </button>
            </div>

            {error && (
                <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {!data.schedule && !loading && (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No schedule found.</p>
                    <p>Click "Generate" to create a personalized plan based on your profile.</p>
                </div>
            )}

            {data.schedule && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,85,0,0.05)', border: '1px solid rgba(255,85,0,0.2)' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>Focus: {data.schedule.weekFocus}</h2>
                    </div>

                    {data.schedule.days.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{day.day}</h3>
                                <span style={{
                                    background: day.type === 'Rest' ? 'rgba(255,255,255,0.1)' : 'rgba(255, 85, 0, 0.2)',
                                    color: day.type === 'Rest' ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }}>
                                    {day.type}
                                </span>
                            </div>

                            {day.type !== 'Rest' && (
                                <>
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{day.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Clock size={14} /> {day.duration}
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {day.exercises?.map((ex, i) => (
                                            <div key={i} style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{ex.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{ex.notes}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                                                    <div>{ex.sets} x {ex.reps}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
