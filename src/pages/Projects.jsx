import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Plus, Trophy, Star, TrendingUp, Camera, Check, X, ChevronRight } from 'lucide-react';

export function Projects() {
    const { data, addLog, updateSection } = useData();
    const [view, setView] = useState('grid'); // 'grid', 'detail', 'new'
    const [selectedProject, setSelectedProject] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recommendation, setRecommendation] = useState(null);

    // New Project Form
    const [newProject, setNewProject] = useState({
        name: '',
        grade: '',
        image: null,
        description: '',
        status: 'Project' // 'Project', 'Sent', 'Flash'
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, we'd upload this. For now, we'll use a local URL or base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewProject({ ...newProject, image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const saveProject = () => {
        if (!newProject.name || !newProject.grade) {
            alert('Name and Grade are required');
            return;
        }
        const project = {
            id: Date.now(),
            ...newProject,
            attempts: [],
            createdAt: new Date().toISOString()
        };

        const updatedProjects = [...(data.projects || []), project];
        updateSection('projects', updatedProjects);

        setView('grid');
        setNewProject({ name: '', grade: '', image: null, description: '', status: 'Project' });
    };

    const getAIRecommendation = async () => {
        setIsAnalyzing(true);
        try {
            // Mocking AI recommendation for now, or call geminiService if implemented
            // const rec = await geminiService.recommendProject(data.projects, data.logs);
            // setRecommendation(rec);

            // Placeholder logic until geminiService is updated
            const projects = data.projects || [];
            if (projects.length > 0) {
                setRecommendation(projects[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (data.projects?.length > 0) {
            getAIRecommendation();
        }
    }, [data.projects]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container"
            style={{ paddingTop: '2rem', paddingBottom: '6rem' }}
        >
            {view === 'grid' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>Climbing Projects</h2>
                        <button
                            onClick={() => setView('new')}
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 85, 0, 0.4)'
                            }}
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {(data.projects || []).map(project => (
                            <motion.div
                                key={project.id}
                                layoutId={`project-${project.id}`}
                                onClick={() => { setSelectedProject(project); setView('detail'); }}
                                className="glass-panel"
                                style={{
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    border: recommendation === project.id ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {recommendation === project.id && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderBottomLeftRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Star size={12} fill="white" /> Top Pick
                                    </div>
                                )}

                                {project.image ? (
                                    <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                                        <img src={project.image} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                        <Mountain size={40} style={{ opacity: 0.3 }} />
                                    </div>
                                )}

                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{project.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{project.grade}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{project.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {(data.projects || []).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            <Mountain size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No projects yet. Add one to start crushing!</p>
                        </div>
                    )}
                </>
            )}

            {view === 'new' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>New Project</h2>
                        <button onClick={() => setView('grid')} style={{ background: 'transparent', border: 'none', color: 'white' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <label style={{
                            height: '200px',
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: newProject.image ? `url(${newProject.image}) center/cover` : 'rgba(0,0,0,0.2)'
                        }}>
                            {!newProject.image && (
                                <>
                                    <Camera size={32} style={{ marginBottom: '10px', opacity: 0.7 }} />
                                    <span>Add Route Photo</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>

                        <input
                            placeholder="Route Name"
                            value={newProject.name}
                            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                            className="glass-panel"
                            style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)' }}
                        />

                        <input
                            placeholder="Grade (e.g., 7a, V5)"
                            value={newProject.grade}
                            onChange={e => setNewProject({ ...newProject, grade: e.target.value })}
                            className="glass-panel"
                            style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)' }}
                        />

                        <textarea
                            placeholder="Notes / Beta"
                            value={newProject.description}
                            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                            className="glass-panel"
                            style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', minHeight: '100px' }}
                        />

                        <button
                            onClick={saveProject}
                            style={{
                                padding: '15px',
                                background: 'var(--color-primary)',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                marginTop: '1rem'
                            }}
                        >
                            Save Project
                        </button>
                    </div>
                </motion.div>
            )}

            {view === 'detail' && selectedProject && (
                <ProjectDetail
                    project={selectedProject}
                    onBack={() => setView('grid')}
                    onUpdate={(updated) => {
                        const newProjects = data.projects.map(p => p.id === updated.id ? updated : p);
                        updateSection('projects', newProjects);
                        setSelectedProject(updated);
                    }}
                />
            )}
        </motion.div>
    );
}

function ProjectDetail({ project, onBack, onUpdate }) {
    const [progress, setProgress] = useState(0); // 0-100

    const logAttempt = () => {
        const attempt = {
            date: new Date().toISOString(),
            percentage: progress,
            notes: `Reached ${progress}%`
        };
        const updatedProject = {
            ...project,
            attempts: [...(project.attempts || []), attempt]
        };
        onUpdate(updatedProject);
        alert('Attempt logged!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
            style={{ padding: '0', overflow: 'hidden', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ position: 'relative', height: '40vh' }}>
                <img
                    src={project.image || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2003&auto=format&fit=crop'}
                    alt={project.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{project.name}</h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ background: 'var(--color-primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>{project.grade}</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{project.attempts?.length || 0} Attempts</span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '2rem', flex: 1 }}>
                <h3 style={{ marginBottom: '1rem' }}>Log Attempt</h3>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>Drag the slider to mark your high point.</p>

                <div style={{ position: 'relative', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                    {/* Visual representation of the route */}
                    <div style={{
                        width: '100%',
                        height: `${progress}%`,
                        background: 'linear-gradient(to top, var(--color-primary), rgba(255, 85, 0, 0.2))',
                        transition: 'height 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        borderTop: '2px solid var(--color-primary)'
                    }}>
                        <div style={{ background: 'white', color: 'black', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '-12px' }}>
                            {progress}%
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value))}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            right: '20px',
                            width: 'calc(100% - 40px)',
                            accentColor: 'var(--color-primary)'
                        }}
                    />
                </div>

                <button
                    onClick={logAttempt}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: 'white',
                        color: 'black',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        marginTop: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <TrendingUp size={20} /> Log Progress
                </button>
            </div>
        </motion.div>
    );
}
