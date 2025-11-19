import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Activity, Dumbbell, Camera, Check, ChevronRight, Loader2 } from 'lucide-react';

export function Onboarding() {
    const { updateSection } = useData();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight: '',
        climbingGrade: '6a',
        fitnessStats: {
            pullUps: '',
            cardioTime: ''
        },
        equipment: [],
        availability: {
            daysPerWeek: 3,
            minutesPerSession: 60
        },
        injuries: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.fitnessStats) {
            setFormData(prev => ({
                ...prev,
                fitnessStats: { ...prev.fitnessStats, [name]: value }
            }));
        } else if (name === 'daysPerWeek' || name === 'minutesPerSession') {
            setFormData(prev => ({
                ...prev,
                availability: { ...prev.availability, [name]: parseInt(value) }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEquipmentToggle = (item) => {
        setFormData(prev => {
            const list = prev.equipment.includes(item)
                ? prev.equipment.filter(i => i !== item)
                : [...prev.equipment, item];
            return { ...prev, equipment: list };
        });
    };

    const handleEquipmentScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        try {
            const result = await geminiService.analyzeImage(file, 'equipment');
            if (result && result.equipment) {
                setFormData(prev => ({
                    ...prev,
                    equipment: [...new Set([...prev.equipment, ...result.equipment])]
                }));
                alert(`Detected: ${result.equipment.join(', ')}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to analyze equipment photo.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFinish = () => {
        updateSection('user', formData);
        updateSection('onboardingCompleted', true);
        navigate('/');
    };

    const frenchGrades = ['4a', '4b', '4c', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '9a'];

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.3)',
        color: 'white',
        outline: 'none',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem'
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', paddingBottom: '0' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}
            >
                {/* Progress Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                        animate={{ width: `${(step / 5) * 100}%` }}
                        style={{ height: '100%', background: 'var(--color-primary)' }}
                    />
                </div>

                <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: '800' }}>
                    <span className="text-primary">Pegasus</span> Setup
                </h1>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User className="text-primary" /> About You
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input name="name" placeholder="e.g. Alex Honnold" value={formData.name} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Age</label>
                                        <input name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Weight (kg)</label>
                                        <input name="weight" type="number" placeholder="70" value={formData.weight} onChange={handleChange} style={inputStyle} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    style={{
                                        background: 'var(--color-primary)',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        marginTop: '1rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    Next Step <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity className="text-primary" /> Fitness Profile
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Climbing Grade (French)</label>
                                    <select name="climbingGrade" value={formData.climbingGrade} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                                        {frenchGrades.map(g => (
                                            <option key={g} value={g} style={{ color: 'black' }}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>Max Pull-ups</label>
                                    <input name="pullUps" type="number" placeholder="e.g. 10" value={formData.fitnessStats.pullUps} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>5k Run Time (mins)</label>
                                    <input name="cardioTime" type="number" placeholder="e.g. 25" value={formData.fitnessStats.cardioTime} onChange={handleChange} style={inputStyle} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            marginTop: '1rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        style={{
                                            background: 'var(--color-primary)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            marginTop: '1rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Next Step <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Dumbbell className="text-primary" /> Equipment
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                Select what you have available or scan a photo of your home gym.
                            </p>

                            <label style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px',
                                border: '2px dashed var(--color-primary)',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                cursor: 'pointer',
                                background: analyzing ? 'rgba(255,85,0,0.1)' : 'rgba(255,85,0,0.05)',
                                transition: 'all 0.3s ease'
                            }}>
                                {analyzing ? (
                                    <>
                                        <Loader2 className="animate-spin text-primary" size={32} style={{ marginBottom: '10px' }} />
                                        <span className="text-primary">Analyzing Photo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Camera size={32} className="text-primary" style={{ marginBottom: '10px' }} />
                                        <span style={{ fontWeight: 'bold' }}>Scan Equipment Photo</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Upload an image to auto-detect items</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleEquipmentScan} style={{ display: 'none' }} disabled={analyzing} />
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
                                {['Pull-up Bar', 'Dumbbells', 'Hangboard', 'Rings', 'Yoga Mat', 'Campus Board', 'Kettlebell', 'Bench'].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleEquipmentToggle(item)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: `1px solid ${formData.equipment.includes(item) ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                            background: formData.equipment.includes(item) ? 'rgba(255, 85, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {formData.equipment.includes(item) && <Check size={14} />} {item}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setStep(2)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(4)}
                                    style={{
                                        background: 'var(--color-primary)',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    Next Step <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity className="text-primary" /> Availability
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Days per Week: <span className="text-primary">{formData.availability.daysPerWeek}</span></label>
                                    <input
                                        name="daysPerWeek"
                                        type="range"
                                        min="1"
                                        max="7"
                                        value={formData.availability.daysPerWeek}
                                        onChange={handleChange}
                                        style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                        <span>1 Day</span>
                                        <span>7 Days</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Minutes per Session: <span className="text-primary">{formData.availability.minutesPerSession} min</span></label>
                                    <input
                                        name="minutesPerSession"
                                        type="range"
                                        min="30"
                                        max="180"
                                        step="15"
                                        value={formData.availability.minutesPerSession}
                                        onChange={handleChange}
                                        style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>
                                        <span>30m</span>
                                        <span>3h</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setStep(3)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(5)}
                                        style={{
                                            background: 'var(--color-primary)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Next Step <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity className="text-primary" /> Injuries & Limits
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Any injuries or limitations?</label>
                                    <textarea
                                        name="injuries"
                                        placeholder="e.g. Left shoulder pain, recovering from ankle sprain..."
                                        value={formData.injuries}
                                        onChange={handleChange}
                                        style={{ ...inputStyle, minHeight: '120px', resize: 'none' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                                        The AI coach will adjust your workout intensity and exercise selection based on this.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setStep(4)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinish}
                                        style={{
                                            background: 'var(--color-primary)',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(255, 85, 0, 0.3)'
                                        }}
                                    >
                                        Finish Setup <Check size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
