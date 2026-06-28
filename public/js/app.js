/* ===== Shared utilities ===== */

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 280);
  }, 3000);
}

function getToken() {
  return localStorage.getItem('bl_token');
}

function getUsername() {
  return localStorage.getItem('bl_username');
}

async function authFetch(url, options = {}) {
  const token = getToken();
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  const res = await fetch(url, options);
  if (res.status === 401) {
    // Token abgelaufen oder ungültig — ausloggen und neu einloggen
    localStorage.removeItem('bl_token');
    localStorage.removeItem('bl_username');
    window.location.href = '/login?expired=1';
    return null;
  }
  return res;
}
