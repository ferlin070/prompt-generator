const COMMISSION_RATE = 0.30;
const MIN_WITHDRAW = 50;

async function generateAffiliateCode() {
  try {
    const data = await api('/api/affiliate/generate-code', { method: 'POST' });
    return data.code;
  } catch {
    return null;
  }
}

async function getAffiliateStats() {
  try {
    return await api('/api/affiliate/stats');
  } catch {
    return null;
  }
}

async function trackAffiliateClick(code) {
  if (!code) return;
  localStorage.setItem('pgp_ref', JSON.stringify({ code, at: new Date().toISOString() }));
}

async function requestWithdrawal(amount, bankDetails) {
  try {
    const data = await api('/api/affiliate/withdrawals', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
      }),
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

async function getWithdrawals() {
  try {
    const data = await api('/api/affiliate/withdrawals');
    return data.withdrawals || [];
  } catch {
    return [];
  }
}

(function checkRefParam() {
  const url = new URLSearchParams(window.location.search);
  const ref = url.get('ref');
  if (ref) trackAffiliateClick(ref);
})();
