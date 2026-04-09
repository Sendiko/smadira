document.addEventListener('DOMContentLoaded', () => {
    // --- Public Homepage Mobile Menu ---
    const publicMenuBtn = document.getElementById('public-menu-btn');
    const publicMenuOverlay = document.getElementById('public-menu-overlay');
    const publicMenuDrawer = document.getElementById('public-menu-drawer');
    const publicMenuCloseBtn = document.getElementById('public-menu-close');

    if (publicMenuBtn && publicMenuOverlay && publicMenuDrawer) {
        const togglePublicMenu = () => {
            publicMenuOverlay.classList.toggle('hidden');
            // Timeout to allow display block to render before transition
            setTimeout(() => {
                publicMenuDrawer.classList.toggle('translate-x-full');
            }, 10);
        };

        publicMenuBtn.addEventListener('click', togglePublicMenu);
        if (publicMenuCloseBtn) publicMenuCloseBtn.addEventListener('click', togglePublicMenu);
        publicMenuOverlay.addEventListener('click', togglePublicMenu);
    }

    // --- Admin Dashboard Sidebar ---
    const adminSidebarBtn = document.getElementById('admin-sidebar-btn');
    const adminSidebarOverlay = document.getElementById('admin-sidebar-overlay');
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminSidebarCloseBtn = document.getElementById('admin-sidebar-close');

    if (adminSidebarBtn && adminSidebarOverlay && adminSidebar) {
        const toggleAdminSidebar = () => {
            adminSidebarOverlay.classList.toggle('hidden');
            setTimeout(() => {
                adminSidebar.classList.toggle('-translate-x-full');
            }, 10);
        };

        adminSidebarBtn.addEventListener('click', toggleAdminSidebar);
        adminSidebarOverlay.addEventListener('click', toggleAdminSidebar);
        if (adminSidebarCloseBtn) adminSidebarCloseBtn.addEventListener('click', toggleAdminSidebar);
    }
});
