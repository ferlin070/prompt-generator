async function getSecureSession() {
  try {
    const data = await api('/api/auth');
    return { userId: data.user.id, email: data.user.email, name: data.user.name, plan: data.user.plan, isAdmin: data.user.is_admin, ai_credits_left: data.user.ai_credits_left };
  } catch { clearSecureSession(); return null; }
}

function clearSecureSession() {
  clearToken();
  document.querySelectorAll('input[type="password"]').forEach(el => el.value = '');
}

function enforceSessionSecurity() {
  if (document.location.pathname.includes('dashboard') || document.location.pathname.includes('admin') || document.location.pathname.includes('profile')) {
    document.head.insertAdjacentHTML('beforeend', '<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" /><meta http-equiv="Pragma" content="no-cache" /><meta http-equiv="Expires" content="0" />');
  }
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      const protectedPages = ['/dashboard.html', '/admin.html', '/profile.html'];
      if (protectedPages.some(p => window.location.pathname.includes(p))) {
        getSecureSession().then(s => { if (!s) window.location.href = '/login.html'; });
      }
    }
  });
}

async function registerUser(userData) {
  try {
    const ref = JSON.parse(localStorage.getItem('pgp_ref') || 'null');
    const data = await api('/api/auth', { method: 'POST', body: JSON.stringify({ ...userData, refCode: ref?.code || null }) });
    setToken(data.token);
    localStorage.removeItem('pgp_ref');
    return { success: true, user: data.user };
  } catch (e) { return { success: false, message: e.message }; }
}

async function loginUser(email, password) {
  try {
    const data = await api('/api/auth', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(data.token);
    await cacheSession();
    return { success: true, user: data.user, session: { user: data.user, access_token: data.token } };
  } catch (e) { return { success: false, message: e.message }; }
}

async function loginWithGoogle() {
  showToast('Log masuk Google tidak tersedia buat masa ini. Sila guna email/password.', 'warning');
}

async function getSessionAsync() {
  try { return await api('/api/auth'); } catch { return null; }
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('pgp_cached_session')); } catch { return null; }
}

async function cacheSession() {
  try {
    const data = await api('/api/auth');
    const u = data.user;
    const cached = { userId: u.id, name: u.name || 'User', email: u.email, plan: u.plan || 'free', isAdmin: u.is_admin || false, ai_credits_left: u.ai_credits_left, initials: (u.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) };
    localStorage.setItem('pgp_cached_session', JSON.stringify(cached));
    return cached;
  } catch { return getSession(); }
}

async function getCurrentProfile() {
  try { const data = await api('/api/auth'); return data.user; } catch { return null; }
}

async function updateUserProfile(updates) {
  try {
    const data = await api('/api/auth', { method: 'PUT', body: JSON.stringify(updates) });
    await cacheSession();
    return { success: true, user: data.user };
  } catch (e) { return { success: false, message: e.message }; }
}

async function logout(redirect = true) {
  clearToken();
  if (redirect) window.location.href = 'login.html';
}

function requireAuth() {
  const session = getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  return session;
}

function redirectIfLoggedIn() {
  if (getSession()) window.location.href = 'dashboard.html';
}

function populateUserUI(session) {
  if (!session) return;
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = session.initials);
  document.querySelectorAll('[data-user-plan]').forEach(el => {
    const plan = session.plan?.toLowerCase();
    el.textContent = plan === 'pro' ? 'Pro' : plan === 'starter' ? 'Starter' : plan === 'agency' ? 'Agency' : 'Free';
  });
  document.querySelectorAll('[data-admin-only]').forEach(el => { el.style.display = session.isAdmin ? '' : 'none'; });
}
