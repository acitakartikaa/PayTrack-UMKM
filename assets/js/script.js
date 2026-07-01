/**
 * Central Layout, Sidebar, Navbar, and Auth Guard for PayTrack UMKM
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth Guard Checklist
  const user = window.PayTrackDB.getLoggedInUser();
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('login.html');
  const isIndexPage = currentPath.endsWith('/') || currentPath.endsWith('index.html');

  if (!user) {
    if (!isLoginPage && !isIndexPage) {
      window.location.href = 'login.html';
      return;
    }
  } else {
    if (isLoginPage || isIndexPage) {
      window.location.href = 'dashboard.html';
      return;
    }
  }

  // 2. Auto-initialize notifications on pages
  if (user) {
    // Generate layout
    initGlobalLayout(user);
    // Refresh Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
});

// Sidebar menu configuration
const MENU_ITEMS = [
  { name: 'Dashboard', icon: 'layout-dashboard', file: 'dashboard.html' },
  { name: 'Data Supplier', icon: 'truck', file: 'supplier.html' },
  { name: 'Data Hutang', icon: 'file-text', file: 'hutang.html' },
  { name: 'Jadwal Pembayaran', icon: 'calendar', file: 'jadwal.html' },
  { name: 'Prioritas Pembayaran', icon: 'star', file: 'prioritas.html' },
  { name: 'Simulasi Kas', icon: 'coins', file: 'prioritas.html#simulasi' }, // link directly to simulation on priority page or separate
  { name: 'Pembayaran', icon: 'wallet', file: 'pembayaran.html' },
  { name: 'Laporan', icon: 'bar-chart-3', file: 'laporan.html' },
  { name: 'Pengaturan', icon: 'settings', file: 'pengaturan.html' },
];

function initGlobalLayout(user) {
  const container = document.getElementById('app-layout');
  if (!container) return; // Not an app layout page (e.g. login)

  // Determine current active page
  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const isSimulasi = window.location.hash === '#simulasi';

  // Get active notifications
  const db = window.PayTrackDB.getDb();
  const unreadNotifs = db.notifikasi.filter(n => !n.dibaca);
  const notifCount = unreadNotifs.length;

  // Render Layout HTML
  container.className = "flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden";
  container.innerHTML = `
    <!-- Mobile Sidebar Drawer Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 hidden lg:hidden"></div>

    <!-- Sidebar Container -->
    <aside id="app-sidebar" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
      <!-- Sidebar Header -->
      <div class="h-16 border-b border-slate-100 flex items-center justify-between px-6">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-600 rounded-lg text-white">
            <i data-lucide="wallet-cards" class="w-6 h-6"></i>
          </div>
          <span class="text-lg font-bold tracking-tight text-slate-900">PayTrack <span class="text-blue-600">UMKM</span></span>
        </div>
        <button id="close-sidebar-btn" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Business identity block -->
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perusahaan</p>
        <p class="text-sm font-bold text-slate-800 truncate mt-0.5">${db.umkm.nama_umkm}</p>
        <div class="flex items-center gap-1.5 mt-1">
          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span class="text-xs text-slate-500 font-mono">Rp ${db.umkm.saldo_kas.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <!-- Sidebar Menu Navigation -->
      <nav class="flex-1 px-4 py-4 overflow-y-auto space-y-1">
        ${MENU_ITEMS.map(item => {
          const isActive = (item.file === currentFile && !isSimulasi) || 
                           (item.name === 'Simulasi Kas' && isSimulasi) ||
                           (item.file.includes(currentFile) && currentFile !== '' && !isSimulasi && item.name !== 'Simulasi Kas');
          
          const activeClasses = isActive 
            ? "bg-blue-600 text-white font-medium" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

          return `
            <a href="${item.file}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeClasses}">
              <i data-lucide="${item.icon}" class="w-5 h-5 shrink-0"></i>
              <span class="text-sm">${item.name}</span>
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Sidebar Footer User Profile -->
      <div class="p-4 border-t border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            ${user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800 truncate">${user.name}</p>
            <p class="text-xs text-slate-500 capitalize font-mono">${user.role}</p>
          </div>
        </div>
        <button id="logout-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Keluar">
          <i data-lucide="log-out" class="w-5 h-5"></i>
        </button>
      </div>
    </aside>

    <!-- App Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden lg:pl-64">
      <!-- Navbar / Header -->
      <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <!-- Left Section: Hamburger menu for mobile & Search/Page Title -->
        <div class="flex items-center gap-4">
          <button id="hamburger-btn" class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden">
            <i data-lucide="menu" class="w-5 h-5"></i>
          </button>
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-xs text-slate-400 font-mono">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <!-- Right Section: Notification Tray and User Account -->
        <div class="flex items-center gap-4">
          <!-- Notification Bell Wrapper -->
          <div class="relative">
            <button id="notif-bell-btn" class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 relative transition-all">
              <i data-lucide="bell" class="w-5 h-5"></i>
              ${notifCount > 0 ? `
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  ${notifCount}
                </span>
              ` : ''}
            </button>
            
            <!-- Quick Notification Dropdown -->
            <div id="notif-dropdown" class="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 hidden overflow-hidden">
              <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                <span class="font-bold text-slate-800">Notifikasi</span>
                <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold font-mono">${notifCount} Baru</span>
              </div>
              <div class="max-h-64 overflow-y-auto divide-y divide-slate-100">
                ${unreadNotifs.length === 0 ? `
                  <div class="p-6 text-center text-slate-400">
                    <i data-lucide="bell-off" class="w-8 h-8 mx-auto text-slate-300 mb-2"></i>
                    <p class="text-xs">Tidak ada notifikasi baru</p>
                  </div>
                ` : unreadNotifs.map(notif => `
                  <div class="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onclick="viewNotification('${notif.id}')">
                    <div class="flex gap-2">
                      <span class="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-red-500"></span>
                      <div>
                        <p class="text-xs font-medium text-slate-800 line-clamp-2">${notif.pesan}</p>
                        <p class="text-[10px] text-slate-400 font-mono mt-1">${notif.tipe}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button id="view-all-notifs-btn" class="text-xs font-semibold text-blue-600 hover:text-blue-800">Tandai Semua Sudah Dibaca</button>
              </div>
            </div>
          </div>

          <!-- Vertical Divider -->
          <div class="h-6 w-px bg-slate-200"></div>

          <!-- User Info Summary -->
          <div class="flex items-center gap-2">
            <div class="text-right hidden md:block">
              <p class="text-sm font-semibold text-slate-800">${user.name}</p>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">${user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Page Stage Content Insertion -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-50" id="main-stage">
        <!-- Render original HTML of the stage here -->
      </main>
    </div>

    <!-- Notification list modal -->
    <div id="notification-modal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm items-center justify-center z-50 hidden flex">
      <div class="bg-white rounded-2xl max-w-lg w-full m-4 shadow-2xl border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <i data-lucide="bell" class="text-blue-600"></i> Notifikasi Sistem
          </h3>
          <button id="close-notif-modal-btn" class="text-slate-400 hover:text-slate-600">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6 max-h-96 overflow-y-auto space-y-4" id="notification-modal-list">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Move the existing original children of #app-layout to #main-stage
  const mainStage = document.getElementById('main-stage');
  const tempFragment = document.createDocumentFragment();
  
  // Collect all elements that are NOT in our layout shell and place them inside the main stage
  const originalChildren = Array.from(container.children);
  originalChildren.forEach(child => {
    // Only move if they are not the sidebar or layout wrappers we just rendered
    if (child.id !== 'app-sidebar' && child.id !== 'sidebar-overlay' && child.id !== 'notification-modal' && !child.classList.contains('flex-1')) {
      tempFragment.appendChild(child);
    }
  });
  mainStage.appendChild(tempFragment);

  // 3. Register Sidebar and UI Event Listeners
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  };

  const closeSidebar = () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Logout Trigger
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.PayTrackDB.logoutUser();
      window.location.href = 'login.html';
    });
  }

  // Bell toggle
  const notifBellBtn = document.getElementById('notif-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifBellBtn && notifDropdown) {
    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      notifDropdown.classList.add('hidden');
    });
  }

  // Mark all notifications read
  const viewAllNotifsBtn = document.getElementById('view-all-notifs-btn');
  if (viewAllNotifsBtn) {
    viewAllNotifsBtn.addEventListener('click', () => {
      const db = window.PayTrackDB.getDb();
      db.notifikasi.forEach(n => n.dibaca = true);
      window.PayTrackDB.saveDb(db);
      window.location.reload();
    });
  }
}

// Global view notifications
window.viewNotification = function(id) {
  const db = window.PayTrackDB.getDb();
  const notif = db.notifikasi.find(n => n.id === id);
  if (notif) {
    notif.dibaca = true;
    window.PayTrackDB.saveDb(db);
    
    // Show in modal
    const modal = document.getElementById('notification-modal');
    const modalList = document.getElementById('notification-modal-list');
    if (modal && modalList) {
      modalList.innerHTML = `
        <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p class="text-sm text-slate-800 font-semibold mb-2">Pesan Notifikasi:</p>
          <p class="text-sm text-slate-700 font-mono">${notif.pesan}</p>
          <div class="flex items-center gap-4 mt-4 text-xs font-mono text-slate-500">
            <span>Tipe: ${notif.tipe}</span>
            <span>Tanggal: ${notif.tanggal_dibuat}</span>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
      
      const closeModalBtn = document.getElementById('close-notif-modal-btn');
      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
          modal.classList.add('hidden');
          window.location.reload(); // Reload to refresh bell badge
        });
      }
    }
  }
};
