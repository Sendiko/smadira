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

    // --- Photo Upload Preview ---
    // inputId     : id of <input type="file">  (lives OUTSIDE drop zone)
    // previewId   : id of <img> preview element
    // placeholderId: id of placeholder div
    // dropZoneId  : id of the clickable drop zone div
    // overlayId   : id of the "change photo" overlay (optional)
    // clearBtnId  : id of the "clear photo" button (optional)
    function initPhotoUpload(inputId, previewId, placeholderId, dropZoneId, overlayId, clearBtnId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById(placeholderId);
        const dropZone = document.getElementById(dropZoneId);
        const overlay = overlayId ? document.getElementById(overlayId) : null;
        const clearBtn = clearBtnId ? document.getElementById(clearBtnId) : null;

        if (!input || !preview || !dropZone) return;

        function showPreview(file) {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                if (placeholder) placeholder.classList.add('hidden');
                if (overlay) overlay.classList.remove('hidden');
                if (clearBtn) clearBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        // Clicking the drop zone opens the file dialog
        // The input is OUTSIDE the drop zone, so the click won't bubble back in
        dropZone.addEventListener('click', () => {
            input.click();
        });

        input.addEventListener('change', () => {
            if (input.files && input.files[0]) showPreview(input.files[0]);
        });

        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                preview.src = '';
                preview.classList.add('hidden');
                if (placeholder) placeholder.classList.remove('hidden');
                if (overlay) overlay.classList.add('hidden');
                clearBtn.classList.add('hidden');
            });
        }

        // Drag-and-drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary', 'bg-primary-fixed/10');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-primary', 'bg-primary-fixed/10');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary', 'bg-primary-fixed/10');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                // Transfer to file input
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                showPreview(file);
            }
        });
    }

    // Create form (pengurus/index.ejs)
    initPhotoUpload(
        'create-photo',
        'create-preview',
        'create-placeholder',
        'create-drop-zone',
        'create-photo-overlay',
        'create-clear-photo'
    );

    // Edit form (pengurus/edit.ejs)
    initPhotoUpload(
        'edit-photo',
        'edit-preview',
        'edit-placeholder',
        'edit-drop-zone',
        null,              // overlay is always visible in edit (no separate id needed)
        'edit-clear-photo'
    );
});
