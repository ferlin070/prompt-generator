import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'PromptBiz Pro <ghazwahgroup@gmail.com>';

const STYLES = `
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f5f7;margin:0;padding:24px}
  .card{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#F59E0B,#d97706);padding:28px 32px;text-align:center}
  .head h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}
  .body{padding:28px 32px}
  .body h2{color:#1f2937;font-size:17px;margin:0 0 12px}
  .body p{color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 14px}
  .btn{display:inline-block;background:#F59E0B;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin:8px 0}
  .foot{padding:18px 32px;background:#f9fafb;border-top:1px solid #eee;text-align:center;color:#9ca3af;font-size:11px}
  .code{background:#fef3c7;border:1px dashed #f59e0b;border-radius:8px;padding:14px;text-align:center;font-size:24px;font-weight:700;letter-spacing:6px;color:#92400e;margin:14px 0}
`;

function wrap(title, inner) {
  return `<!DOCTYPE html><html><body><div class="card">
    <div class="head"><h1>✨ PromptBiz Pro</h1></div>
    <div class="body"><h2>${title}</h2>${inner}</div>
    <div class="foot">© 2026 PromptBiz Pro — prompt.nakhodacloud.top</div>
  </div><style>${STYLES}</style></body></html>`;
}

export async function sendMail(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[email] SMTP not configured, skip:', subject);
    return false;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    return true;
  } catch (e) {
    console.error('[email] send failed:', e.message);
    return false;
  }
}

export function welcomeEmail(name) {
  return wrap('Selamat Datang!', `
    <p>Hai <strong>${name}</strong>,</p>
    <p>Akaun PromptBiz Pro anda berjaya dicipta! Anda kini boleh:</p>
    <p>🤖 Jana website AI lengkap dalam 60 saat<br>🎨 Pilih 4 gaya design<br>✏️ Edit dengan visual editor<br>🚀 Publish ke internet percuma</p>
    <a href="https://prompt.nakhodacloud.top/generator.html" class="btn">Jana Website Pertama Anda</a>
    <p style="font-size:12px;color:#9ca3af">Pelan Free: 1 website, 50MB storage, 5 AI credits</p>`);
}

export function receiptEmail(name, plan, amount, orderNo) {
  return wrap('Resit Pembayaran', `
    <p>Terima kasih <strong>${name}</strong>!</p>
    <p>Pembayaran anda telah berjaya diproses:</p>
    <p><strong>Pelan:</strong> ${plan}<br><strong>Jumlah:</strong> RM${amount}<br><strong>No. Pesanan:</strong> ${orderNo}</p>
    <p>Pelan anda kini aktif. Nikmati ciri premium!</p>
    <a href="https://prompt.nakhodacloud.top/dashboard.html" class="btn">Buka Dashboard</a>`);
}

export function resetEmail(name, code) {
  return wrap('Reset Kata Laluan', `
    <p>Hai <strong>${name}</strong>,</p>
    <p>Kod reset kata laluan anda:</p>
    <div class="code">${code}</div>
    <p>Kod ini sah selama <strong>15 minit</strong>. Jika anda tidak memohon reset ini, abaikan emel ini.</p>`);
}
