
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, Settings, Dumbbell, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';

export function Layout({ children }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/planner', icon: Calendar, label: 'Plan' },
        { path: '/tracker', icon: Activity, label: 'Track' },
        { path: '/projects', icon: Mountain, label: 'Projects' },
        { path: '/equipment', icon: Dumbbell, label: 'Gear' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1, paddingBottom: '100px' }}>
                {children}
            </main>

            <nav className="glass-panel" style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '95%',
                maxWidth: '500px',
                zIndex: 1000,
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(10, 10, 10, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {navItems.map(({ path, icon: Icon, label }) => (
                    <Link key={path} to={path} style={{
                        position: 'relative',
                        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        gap: '4px',
                        width: '50px'
                    }}>
                        {isActive(path) && (
                            <motion.div
                                layoutId="nav-active"
                                style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    width: '30px',
                                    height: '2px',
                                    background: 'var(--color-primary)',
                                    borderRadius: '2px',
                                    boxShadow: '0 0 10px var(--color-primary)'
                                }}
                            />
                        )}
                        <Icon size={24} strokeWidth={isActive(path) ? 2.5 : 2} />
                        <span style={{ fontWeight: isActive(path) ? '600' : '400' }}>{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
