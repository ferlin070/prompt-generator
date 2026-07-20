async function savePrompt(promptData) {
  try {
    const session = getSession();
    if (!session) { showToast('Sila log masuk semula.', 'error'); return null; }
    const rateLimit = checkPromptSaveLimit(session.userId);
    if (!rateLimit.allowed) { showToast(rateLimit.message, 'error'); return null; }
    const data = await api('/api/prompts', { method: 'POST', body: JSON.stringify({
      title: promptData.title || promptData.formData?.businessName || 'Tanpa Tajuk',
      business_type: promptData.businessType, business_type_label: promptData.businessTypeLabel,
      form_data: promptData.formData || {}, generated_prompt: promptData.generatedPrompt || '', tags: promptData.tags || [],
    })});
    return data.prompt;
  } catch (err) { console.error('savePrompt:', err); showToast('Gagal menyimpan prompt.', 'error'); return null; }
}

async function getUserPrompts() {
  const session = getSession();
  if (!session) return [];
  try { const data = await api('/api/prompts'); return data.prompts || []; } catch { return []; }
}

async function getPromptById(id) {
  try { const data = await api(`/api/prompts?id=${id}`); return data.prompt; } catch { return null; }
}

async function updatePrompt(promptId, updates) {
  try {
    const data = await api('/api/prompts', { method: 'PUT', body: JSON.stringify({ id: promptId, ...updates }) });
    return { success: true, prompt: data.prompt };
  } catch (e) { return { success: false, message: e.message }; }
}

async function deletePrompt(promptId) {
  try { await api(`/api/prompts?id=${promptId}`, { method: 'DELETE' }); return { success: true }; } catch { return { success: false }; }
}

async function toggleFavourite(promptId) {
  const prompt = await getPromptById(promptId);
  if (!prompt) return false;
  const newVal = !prompt.is_favourite;
  await updatePrompt(promptId, { is_favourite: newVal });
  return newVal;
}

async function searchPrompts(query) {
  const prompts = await getUserPrompts();
  if (!query || !query.trim()) return prompts;
  const q = query.toLowerCase().trim();
  return prompts.filter(p => (p.title && p.title.toLowerCase().includes(q)) || (p.business_type_label && p.business_type_label.toLowerCase().includes(q)));
}

async function filterPrompts(type = 'all', favouriteOnly = false) {
  const prompts = await getUserPrompts();
  let filtered = prompts;
  if (type !== 'all') filtered = filtered.filter(p => p.business_type === type);
  if (favouriteOnly) filtered = filtered.filter(p => p.is_favourite);
  return filtered;
}

async function getUserStats() {
  const prompts = await getUserPrompts();
  const now = new Date();
  const weekAgo = new Date(now - 7 * 864e5);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = prompts.filter(p => new Date(p.created_at) > weekAgo).length;
  const thisMonth = prompts.filter(p => new Date(p.created_at) > monthStart).length;
  const typeCounts = {};
  prompts.forEach(p => { const label = p.business_type_label || p.business_type; typeCounts[label] = (typeCounts[label] || 0) + 1; });
  let topType = '-', topCount = 0;
  Object.entries(typeCounts).forEach(([label, count]) => { if (count > topCount) { topType = label; topCount = count; } });
  return { total: prompts.length, thisWeek, thisMonth, topType, favourites: prompts.filter(p => p.is_favourite).length };
}

function saveDraft(formData, businessType) { localStorage.setItem('pgp_draft', JSON.stringify({ formData, businessType, savedAt: new Date().toISOString() })); }
function loadDraft() { try { return JSON.parse(localStorage.getItem('pgp_draft')); } catch { return null; } }
function clearDraft() { localStorage.removeItem('pgp_draft'); }

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'baru sahaja';
  if (m < 60) return `${m} minit lepas`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lepas`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lepas`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} minggu lepas`;
  return new Date(isoString).toLocaleDateString('ms-MY');
}
