import { useState } from 'react';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { motion } from 'framer-motion';
import { Plus, Trash2, Camera, Dumbbell } from 'lucide-react';

export function Equipment() {
    const { data, updateSection } = useData();
    const [analyzing, setAnalyzing] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (!newItem.trim()) return;
        const updatedList = [...new Set([...data.user.equipment, newItem.trim()])];
        updateSection('user', { ...data.user, equipment: updatedList });
        setNewItem('');
    };

    const handleDelete = (item) => {
        const updatedList = data.user.equipment.filter(i => i !== item);
        updateSection('user', { ...data.user, equipment: updatedList });
    };

    const handleScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzing(true);
        try {
            const result = await geminiService.analyzeImage(file, 'equipment');
            if (result && result.equipment) {
                const updatedList = [...new Set([...data.user.equipment, ...result.equipment])];
                updateSection('user', { ...data.user, equipment: updatedList });
                alert(`Added: ${result.equipment.join(', ')}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to analyze photo.');
        } finally {
            setAnalyzing(false);
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
                    src="/pegasus/img/equipment.png"
                    alt="Equipment"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.6)'
                    }}
                    onError={(e) => e.target.src = '/img/equipment.png'}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        <Dumbbell className="text-primary" size={32} /> Equipment
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: '5px 0 0 0', fontSize: '1.1rem' }}>Manage your home gym inventory.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add item manually..."
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'white'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '0 15px',
                            borderRadius: '8px'
                        }}
                    >
                        <Plus />
                    </button>
                </div>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '15px',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: analyzing ? 'rgba(255,85,0,0.1)' : 'transparent',
                    transition: 'all 0.3s ease'
                }}>
                    <Camera color="var(--color-primary)" />
                    <span>{analyzing ? 'Analyzing Photo...' : 'Scan Equipment Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleScan} style={{ display: 'none' }} disabled={analyzing} />
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {data.user.equipment.map((item, index) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(255,85,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Dumbbell size={24} color="var(--color-primary)" />
                        </div>
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{item}</span>
                        <button
                            onClick={() => handleDelete(item)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                color: 'var(--color-text-muted)',
                                opacity: 0.6
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
