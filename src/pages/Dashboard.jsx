import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { geminiService } from '../services/gemini';
import { motion } from 'framer-motion';
import { Activity, Droplets, Flame, Brain, ChevronRight, Calendar, Moon, Zap } from 'lucide-react';

export function Dashboard() {
    const { data } = useData();
    const [hints, setHints] = useState([]);
    const [loadingHints, setLoadingHints] = useState(false);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = data.schedule?.days?.find(d => d.day === today);

    const lastSleep = data.logs.sleep?.slice(-1)[0];
    const currentEnergy = data.logs.energy?.slice(-1)[0];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const todayWater = data.logs.water
        .filter(l => l.timestamp.startsWith(new Date().toISOString().split('T')[0]))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const todayCalories = data.logs.nutrition
        .filter(l => l.date.startsWith(new Date().toISOString().split('T')[0]))
        .reduce((acc, curr) => acc + (curr.calories || 0), 0);

    // Calculate Weekly Volume (Last 7 Days)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
        }
        return days;
    };

    const last7Days = getLast7Days();
    const volumeData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const volume = data.logs.workouts
            ? data.logs.workouts.filter(l => l.timestamp.startsWith(dateStr)).length
            : 0;
        return { name: dayName, volume };
    });

    useEffect(() => {
        const generateHints = async () => {
            if (!data.settings.apiKey || hints.length > 0) return;

            setLoadingHints(true);
            try {
                const newHints = await geminiService.generateHints(data.logs);
                setHints(newHints);
                setLoadingHints(false);
            } catch (e) {
                console.error(e);
                setHints(["Could not generate hints. Check API Key."]);
                setLoadingHints(false);
            }
        };
        generateHints();
    }, [data.settings.apiKey]);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="container"
            style={{ paddingBottom: '6rem' }}
        >
            {/* Hero Section */}
            <motion.div
                variants={itemVariants}
                style={{
                    position: 'relative',
                    height: '250px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
            >
                <img
                    src="/pegasus/img/dashboard.png"
                    alt="Dashboard Hero"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.7)'
                    }}
                    onError={(e) => e.target.src = '/img/dashboard.png'} // Fallback for local dev
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        Hello, <span className="text-primary">{data.user.name || 'Athlete'}</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                        <Calendar size={16} /> {today} <span style={{ opacity: 0.5 }}>|</span> {data.user.climbingGrade}
                    </p>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255, 85, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 15px rgba(255, 85, 0, 0.4)',
                    border: '2px solid rgba(255,255,255,0.2)'
                }}>
                    {data.user.name ? data.user.name[0].toUpperCase() : 'U'}
                </div>
            </motion.div>

            {/* AI Coach Hints */}
            <motion.section variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(0,0,0,0.2))', border: '1px solid rgba(255,85,0,0.2)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)' }}>
                        <Brain size={20} /> AI Coach Insights
                    </h2>
                    {loadingHints ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>Analyzing your recent performance...</p>
                    ) : (
                        <ul style={{ paddingLeft: '20px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
                            {hints.map((hint, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{hint}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.section>

            {/* Today's Plan */}
            <motion.section variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Today's Plan</h2>
                {todaySchedule ? (
                    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: todaySchedule.type === 'Rest' ? 'gray' : 'var(--color-primary)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '600' }}>{todaySchedule.title}</h3>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', background: 'rgba(255,85,0,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                {todaySchedule.duration}
                            </span>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{todaySchedule.type}</p>
                        {todaySchedule.type !== 'Rest' && (
                            <Link to="/tracker" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                width: '100%',
                                transition: 'transform 0.2s'
                            }}>
                                Start Workout <ChevronRight size={18} />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>No workout scheduled for today.</p>
                        <Link to="/planner" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Go to Planner</Link>
                    </div>
                )}
            </motion.section>

            {/* Wellness Section */}
            <motion.section variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Wellness & Recovery</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#a855f7' }}>
                            <Moon size={20} /> <span style={{ fontWeight: 'bold' }}>Sleep</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {lastSleep ? `${lastSleep.duration}h` : '--'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {lastSleep ? `Quality: ${lastSleep.quality}/10` : 'No data'}
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#eab308' }}>
                            <Zap size={20} /> <span style={{ fontWeight: 'bold' }}>Energy</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {currentEnergy ? `${currentEnergy.level}/10` : '--'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {currentEnergy ? new Date(currentEnergy.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No data'}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Performance Section */}
            <motion.section variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Performance</h2>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Weekly Volume</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="volume" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.section>

            {/* Nutrition & Hydration */}
            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Droplets size={16} color="#0096FF" /> Hydration
                    </h3>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{todayWater} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#888' }}>ml</span></div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((todayWater / 2500) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: '100%', background: '#0096FF' }}
                        />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Flame size={16} color="var(--color-success)" /> Calories
                    </h3>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{todayCalories} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#888' }}>kcal</span></div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((todayCalories / 2500) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: '100%', background: 'var(--color-success)' }}
                        />
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}
