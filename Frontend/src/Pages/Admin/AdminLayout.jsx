import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/lessons', label: 'Lessons', icon: '📚' },
    { path: '/admin/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={styles.root}>
            <style>{`
                @media (max-width: 768px) {
                    .admin-sidebar {
                        position: fixed !important;
                        left: ${sidebarOpen ? '0' : '-260px'} !important;
                        width: 260px !important;
                        transition: left 0.3s cubic-bezier(.4,0,.2,1) !important;
                        z-index: 1000 !important;
                    }
                    .admin-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                    .admin-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(4px);
                        z-index: 950;
                        display: block !important;
                    }
                    .hamburger-btn {
                        display: flex !important;
                    }
                    /* Compact Table layout adjustments for smaller viewports */
                    th, td {
                        padding: 8px 8px !important;
                        font-size: 11.5px !important;
                    }
                }
                @media (min-width: 769px) {
                    .hamburger-btn {
                        display: none !important;
                    }
                    .admin-backdrop {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Backdrop for mobile overlays */}
            {sidebarOpen && <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />}

            {/* ── SIDEBAR ── */}
            <aside style={{ ...styles.sidebar, width: sidebarOpen ? 260 : 72 }} className="admin-sidebar">
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <div style={styles.logoIcon}>✦</div>
                    {sidebarOpen && (
                        <div>
                            <div style={styles.logoText}>TalkEnglish</div>
                            <div style={styles.logoSub}>Admin Panel</div>
                        </div>
                    )}
                    <button style={styles.collapseBtn} onClick={() => setSidebarOpen(o => !o)}>
                        {sidebarOpen ? '‹' : '›'}
                    </button>
                </div>

                {/* Nav Items */}
                <nav style={styles.nav}>
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            style={({ isActive }) => ({
                                ...styles.navItem,
                                ...(isActive ? styles.navItemActive : {})
                            })}
                            onClick={() => {
                                // On mobile, close sidebar automatically upon navigation
                                if (window.innerWidth <= 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
                            {sidebarOpen && <span style={styles.navArrow}>›</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div style={styles.sidebarFooter}>
                    <div style={styles.avatarWrap}>
                        <div style={styles.avatar}>
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div style={styles.avatarInfo}>
                                <div style={styles.avatarName}>{user?.name || 'Admin'}</div>
                                <div style={styles.avatarRole}>🛡️ Admin</div>
                            </div>
                        )}
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
                        {sidebarOpen ? '🚪 Logout' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ ...styles.main, marginLeft: sidebarOpen ? 260 : 72 }} className="admin-main">
                {/* Top Bar */}
                <header style={styles.topBar}>
                    <div style={styles.topBarLeft}>
                        <button className="hamburger-btn" style={styles.hamburger} onClick={() => setSidebarOpen(o => !o)}>
                            ☰
                        </button>
                        <div style={styles.breadcrumb}>
                            <span style={styles.breadcrumbRoot}>Admin</span>
                            <span style={styles.breadcrumbSep}>›</span>
                            <span style={styles.breadcrumbCurrent}>Workspace</span>
                        </div>
                    </div>
                    <div style={styles.topBarRight}>
                        <div style={styles.statusBadge}>
                            <span style={styles.statusDot}></span>
                            Workspace Active
                        </div>
                        <div style={styles.topBarAvatar}>
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

const styles = {
    root: {
        display: 'flex',
        minHeight: '100vh',
        background: '#0a0a16',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#e2e8f0',
    },
    sidebar: {
        background: 'linear-gradient(180deg, #12122a 0%, #0e0e20 100%)',
        borderRight: '1px solid rgba(74, 155, 155, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '24px 16px 20px',
        borderBottom: '1px solid rgba(74, 155, 155, 0.12)',
        position: 'relative',
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #4A9B9B, #2D7D7D)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(74, 155, 155, 0.4)',
    },
    logoText: {
        fontSize: 15,
        fontWeight: 700,
        color: '#f1f5f9',
        letterSpacing: '-0.3px',
    },
    logoSub: {
        fontSize: 10,
        color: '#4A9B9B',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginTop: 1,
    },
    collapseBtn: {
        position: 'absolute',
        right: 12,
        background: 'rgba(74, 155, 155, 0.12)',
        border: '1px solid rgba(74, 155, 155, 0.2)',
        color: '#4A9B9B',
        borderRadius: 8,
        width: 24,
        height: 24,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
        flexShrink: 0,
    },
    nav: {
        flex: 1,
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflowY: 'auto',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 500,
        transition: 'all 0.2s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    navItemActive: {
        background: 'linear-gradient(90deg, rgba(74, 155, 155, 0.2), rgba(45, 125, 125, 0.1))',
        color: '#4A9B9B',
        borderLeft: '2px solid #4A9B9B',
        paddingLeft: 10,
    },
    navIcon: {
        fontSize: 18,
        flexShrink: 0,
        width: 22,
        textAlign: 'center',
    },
    navLabel: {
        flex: 1,
    },
    navArrow: {
        fontSize: 12,
        color: '#475569',
    },
    sidebarFooter: {
        padding: '16px 10px',
        borderTop: '1px solid rgba(74, 155, 155, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    avatarWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #4A9B9B, #2D7D7D)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        flexShrink: 0,
        color: '#fff',
        boxShadow: '0 2px 8px rgba(74, 155, 155, 0.3)',
    },
    avatarInfo: {
        overflow: 'hidden',
    },
    avatarName: {
        fontSize: 13,
        fontWeight: 600,
        color: '#e2e8f0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    avatarRole: {
        fontSize: 10,
        color: '#4A9B9B',
        fontWeight: 600,
        marginTop: 1,
    },
    logoutBtn: {
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.15)',
        color: '#f87171',
        borderRadius: 8,
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.2s',
        textAlign: 'left',
    },
    main: {
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    topBar: {
        background: 'rgba(18,18,42,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(74, 155, 155, 0.1)',
        padding: '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
    },
    topBarLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    hamburger: {
        background: 'transparent',
        border: 'none',
        color: '#4A9B9B',
        fontSize: 22,
        cursor: 'pointer',
        padding: '4px 8px',
        marginRight: 12,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
    },
    breadcrumbRoot: {
        color: '#4A9B9B',
        fontWeight: 600,
    },
    breadcrumbSep: {
        color: '#475569',
    },
    breadcrumbCurrent: {
        color: '#94a3b8',
    },
    topBarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(74, 155, 155, 0.08)',
        border: '1px solid rgba(74, 155, 155, 0.15)',
        color: '#4A9B9B',
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 600,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#4A9B9B',
        animation: 'pulse 2s infinite',
        display: 'inline-block',
    },
    topBarAvatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #4A9B9B, #2D7D7D)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(74, 155, 155, 0.3)',
    },
    content: {
        flex: 1,
        padding: '28px',
        overflowY: 'auto',
    },
};
