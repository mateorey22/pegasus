import { useState } from 'react';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';

export function Planner() {
    const { data, updateSection } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('short'); // 'short' or 'long'
    const [expandedDay, setExpandedDay] = useState(null);
    const [newGoal, setNewGoal] = useState('');

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

    const toggleDay = (index) => {
        setExpandedDay(expandedDay === index ? null : index);
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;
        const updatedGoals = [...(data.user.goals || []), newGoal];
        updateSection('user', { goals: updatedGoals });
        setNewGoal('');
    };

    const removeGoal = (index) => {
        const updatedGoals = (data.user.goals || []).filter((_, i) => i !== index);
        updateSection('user', { goals: updatedGoals });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container"
            style={{ paddingTop: '2rem', paddingBottom: '6rem' }}
        >
            {/* Header with Image */}
            <div style={{
                position: 'relative',
                height: '200px',
                borderRadius: '24px',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <img
                    src="/pegasus/img/planner.png"
                    alt="Planner"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.6)'
                    }}
                    onError={(e) => e.target.src = '/img/planner.png'}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        <Calendar className="text-primary" size={32} /> Planning
                    </h1>

                    {activeTab === 'short' && (
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
                                boxShadow: '0 4px 15px rgba(255, 85, 0, 0.3)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Sparkles size={18} /> {loading ? 'Generating...' : 'Generate Week'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('short')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background: activeTab === 'short' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Short Term (Weekly)
                </button>
                <button
                    onClick={() => setActiveTab('long')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background: activeTab === 'long' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Long Term (Goals)
                </button>
            </div>

            {error && (
                <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* Short Term View */}
            {activeTab === 'short' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!data.schedule && !loading && (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No schedule found.</p>
                            <p>Click "Generate Week" to create a personalized plan.</p>
                        </div>
                    )}

                    {data.schedule && (
                        <>
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
                                    style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => toggleDay(index)}
                                >
                                    <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{day.day}</h3>
                                            {day.type !== 'Rest' && (
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                    {day.title} • {day.duration}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                            {/* Chevron icon could go here */}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedDay === index && day.type !== 'Rest' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}
                                            >
                                                <div style={{ padding: '1.5rem', paddingTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {day.exercises?.map((ex, i) => (
                                                            <div key={i} style={{
                                                                background: 'rgba(255,255,255,0.03)',
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
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Long Term View */}
            {activeTab === 'long' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Long Term Goals</h2>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <input
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                placeholder="Add a new goal..."
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                            />
                            <button
                                onClick={addGoal}
                                style={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0 20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(data.user.goals || []).length === 0 && (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No long term goals set yet.</p>
                            )}
                            {(data.user.goals || []).map((goal, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>{goal}</span>
                                    <button
                                        onClick={() => removeGoal(index)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
