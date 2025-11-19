
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { notificationService } from '../services/notifications';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Camera, Check, X, Droplets, Dumbbell, Utensils, Timer, Moon, Zap } from 'lucide-react';

export function Tracker() {
    const { data, addLog, updateSection } = useData();
    const [activeTab, setActiveTab] = useState('workout');
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Rest Timer State
    const [restTimer, setRestTimer] = useState(0);
    const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

    // Nutrition State
    const [analyzingFood, setAnalyzingFood] = useState(false);
    const [foodResult, setFoodResult] = useState(null);

    // Wellness State
    const [sleepDuration, setSleepDuration] = useState('');
    const [energyLevel, setEnergyLevel] = useState(5);

    // Hydration State
    const todayWater = data.logs.water
        .filter(l => l.timestamp.startsWith(new Date().toISOString().split('T')[0]))
        .reduce((acc, curr) => acc + curr.amount, 0);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Rest Timer Effect
    useEffect(() => {
        let interval;
        if (isRestTimerRunning && restTimer > 0) {
            interval = setInterval(() => {
                setRestTimer(prev => {
                    if (prev <= 1) {
                        setIsRestTimerRunning(false);
                        notificationService.send('Rest Finished!', { body: 'Time to crush your next set!' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRestTimerRunning, restTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')} `;
    };

    const handleFoodUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingFood(true);
        try {
            const result = await geminiService.analyzeImage(file, 'food');
            setFoodResult(result);
        } catch (err) {
            alert('Failed to analyze food.');
        } finally {
            setAnalyzingFood(false);
        }
    };

    const saveFoodLog = () => {
        if (foodResult) {
            addLog('nutrition', { ...foodResult, date: new Date().toISOString() });
            setFoodResult(null);
            alert('Meal logged!');
        }
    };

    const addWater = (amount) => {
        addLog('water', { amount, date: new Date().toISOString() });
    };

    const handleLogSleep = () => {
        if (!sleepDuration) return;
        addLog('sleep', { duration: parseFloat(sleepDuration), date: new Date().toISOString() });
        setSleepDuration('');
        alert('Sleep logged!');
    };

    const handleLogEnergy = () => {
        addLog('energy', { level: energyLevel, date: new Date().toISOString() });
        alert('Energy level logged!');
    };

    const tabs = [
        { id: 'workout', icon: Dumbbell, label: 'Workout' },
        { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
        { id: 'hydration', icon: Droplets, label: 'Water' },
        { id: 'wellness', icon: Zap, label: 'Wellness' },
    ];


    const [workoutForm, setWorkoutForm] = useState({ exercise: '', weight: '', reps: '' });

    const handleLogSet = () => {
        if (!workoutForm.exercise || !workoutForm.weight || !workoutForm.reps) {
            alert('Please fill in all fields');
            return;
        }

        addLog('workouts', {
            ...workoutForm,
            duration: timer, // Optional: save current timer value with the set
            date: new Date().toISOString()
        });

        setWorkoutForm({ exercise: '', weight: '', reps: '' });
        alert('Set logged!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container"
            style={{ paddingTop: '2rem' }}
        >
            {/* ... tabs ... */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '5px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '20px',
                            background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'workout' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', textAlign: 'center' }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>Active Session</h2>
                    <div style={{ fontSize: '5rem', fontFamily: 'monospace', marginBottom: '2rem', fontWeight: 'bold', letterSpacing: '-2px' }}>
                        {formatTime(timer)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            style={{
                                background: isTimerRunning ? 'var(--color-danger)' : 'var(--color-success)',
                                color: 'white',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                        >
                            {isTimerRunning ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                        </button>
                        <button
                            onClick={() => { setIsTimerRunning(false); setTimer(0); }}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <RotateCcw size={24} />
                        </button>
                    </div>
                    <div style={{ marginTop: '3rem', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3>Log Set</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            <input
                                placeholder="Exercise"
                                value={workoutForm.exercise}
                                onChange={e => setWorkoutForm({ ...workoutForm, exercise: e.target.value })}
                                className="glass-panel"
                                style={{ padding: '12px', color: 'white', background: 'rgba(0,0,0,0.3)' }}
                            />
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="number"
                                    placeholder="Kg"
                                    value={workoutForm.weight}
                                    onChange={e => setWorkoutForm({ ...workoutForm, weight: e.target.value })}
                                    className="glass-panel"
                                    style={{ padding: '12px', color: 'white', width: '100%', background: 'rgba(0,0,0,0.3)' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={workoutForm.reps}
                                    onChange={e => setWorkoutForm({ ...workoutForm, reps: e.target.value })}
                                    className="glass-panel"
                                    style={{ padding: '12px', color: 'white', width: '100%', background: 'rgba(0,0,0,0.3)' }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleLogSet}
                            style={{ width: '100%', marginTop: '15px', padding: '12px', background: 'var(--color-primary)', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}
                        >
                            Log Set
                        </button>

                        {/* Rest Timer Section */}
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                <Timer size={18} className="text-primary" /> Rest Timer
                            </h3>

                            {isRestTimerRunning ? (
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 85, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-primary)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                        {formatTime(restTimer)}
                                    </div>
                                    <button
                                        onClick={() => { setIsRestTimerRunning(false); setRestTimer(0); }}
                                        style={{ marginTop: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                    {[30, 60, 90, 120].map(seconds => (
                                        <button
                                            key={seconds}
                                            onClick={() => { setRestTimer(seconds); setIsRestTimerRunning(true); }}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                border: '1px solid var(--glass-border)',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {seconds}s
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'nutrition' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>Food Tracker</h2>

                    {!foodResult && (
                        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Take a photo of your meal to analyze calories.</p>
                            <label style={{
                                background: 'var(--color-primary)',
                                padding: '12px 24px',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: 'bold'
                            }}>
                                {analyzingFood ? 'Analyzing...' : <><Camera size={20} /> Scan Meal</>}
                                <input type="file" accept="image/*" onChange={handleFoodUpload} style={{ display: 'none' }} disabled={analyzingFood} />
                            </label>
                        </div>
                    )}

                    {foodResult && (
                        <div className="animate-fade-in">
                            <h3>Analysis Result</h3>
                            <div style={{ margin: '1rem 0', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{foodResult.name}</p>
                                <p style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{foodResult.calories} kcal</p>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    <span>P: {foodResult.protein}g</span>
                                    <span>C: {foodResult.carbs}g</span>
                                    <span>F: {foodResult.fat}g</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={saveFoodLog} style={{ flex: 1, background: 'var(--color-success)', padding: '12px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    <Check size={18} /> Save
                                </button>
                                <button onClick={() => setFoodResult(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    <X size={18} /> Discard
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'hydration' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', textAlign: 'center' }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>Hydration</h2>
                    <div style={{ fontSize: '4rem', color: '#0096FF', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        {todayWater} <span style={{ fontSize: '1.5rem', color: 'white' }}>ml</span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Daily Goal: 2500 ml</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button onClick={() => addWater(250)} style={{ padding: '20px', background: 'rgba(0, 150, 255, 0.15)', borderRadius: '16px', color: '#0096FF', fontWeight: 'bold', border: '1px solid rgba(0, 150, 255, 0.3)' }}>
                            + 250ml
                        </button>
                        <button onClick={() => addWater(500)} style={{ padding: '20px', background: 'rgba(0, 150, 255, 0.25)', borderRadius: '16px', color: 'white', fontWeight: 'bold', border: '1px solid rgba(0, 150, 255, 0.5)' }}>
                            + 500ml
                        </button>
                    </div>
                </motion.div>
            )}

            {activeTab === 'wellness' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Wellness Tracker</h2>

                    {/* Sleep Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Moon size={20} className="text-primary" /> Sleep Duration
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Hours"
                                value={sleepDuration}
                                onChange={(e) => setSleepDuration(e.target.value)}
                                className="glass-panel"
                                style={{ flex: 1, padding: '15px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)' }}
                            />
                            <button
                                onClick={handleLogSleep}
                                style={{
                                    padding: '0 25px',
                                    background: 'var(--color-primary)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Log
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                            Log your sleep duration from last night.
                        </p>
                    </div>

                    {/* Energy Section */}
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Zap size={20} className="text-primary" /> Energy Level
                        </h3>
                        <div style={{ padding: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Low</span>
                                <span className="text-primary">{energyLevel} / 10</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>High</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)', height: '6px', borderRadius: '3px' }}
                            />
                            <button
                                onClick={handleLogEnergy}
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '15px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                Log Energy
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
