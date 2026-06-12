const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatVND = (value) => {
  const amount = Number(value || 0)
  return `${amount.toLocaleString('vi-VN')} VND`
}

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const renderEmptyRow = (colspan, message) => `
  <tr>
    <td colspan="${colspan}" class="empty">${escapeHtml(message)}</td>
  </tr>
`

const renderDonationRows = (donations) => {
  if (!donations.length) {
    return renderEmptyRow(5, 'Chưa có giao dịch tiền vào thành công.')
  }

  return donations.map((donation) => {
    const donorName = donation.isAnonymous
      ? 'Người ủng hộ ẩn danh'
      : donation.donorId?.name || 'Người ủng hộ'
    const description = [
      donation.transferContent,
      donation.message,
    ].filter(Boolean).join(' - ')

    return `
      <tr>
        <td>${escapeHtml(donation.sepayTxId || donation.transferContent || donation._id)}</td>
        <td>${escapeHtml(formatDateTime(donation.createdAt))}</td>
        <td>${escapeHtml(donorName)}</td>
        <td>${escapeHtml(description || 'Đóng góp chiến dịch')}</td>
        <td class="money in">${escapeHtml(formatVND(donation.paidAmount || donation.amount))}</td>
      </tr>
    `
  }).join('')
}

const renderDisbursementRows = (disbursements, ownerName) => {
  if (!disbursements.length) {
    return renderEmptyRow(5, 'Chưa có khoản giải ngân đã hoàn tất.')
  }

  return disbursements.map((item) => `
    <tr>
      <td>${escapeHtml(item._id)}</td>
      <td>${escapeHtml(formatDateTime(item.completedAt || item.updatedAt || item.createdAt))}</td>
      <td>${escapeHtml(ownerName || 'Chủ dự án')}</td>
      <td>${escapeHtml(item.reason || 'Giải ngân chiến dịch')}</td>
      <td class="money out">${escapeHtml(formatVND(item.amount))}</td>
    </tr>
  `).join('')
}

function buildStatementHtml(data) {
  const {
    campaign,
    owner,
    generatedAt,
    account,
    summary,
    donations,
    disbursements,
  } = data

  const ownerName = owner?.name || 'Chủ dự án'

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Bang chi tiet giao dich</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      font-family: Arial, "DejaVu Sans", sans-serif;
      font-size: 12px;
      line-height: 1.35;
    }
    .page {
      padding: 28px 32px 36px;
    }
    h1 {
      margin: 0 0 18px;
      text-align: center;
      font-size: 25px;
      letter-spacing: .02em;
      text-transform: uppercase;
    }
    h2 {
      margin: 22px 0 8px;
      font-size: 16px;
      text-transform: uppercase;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 14px;
    }
    .row {
      display: grid;
      grid-template-columns: 132px 1fr;
      gap: 10px;
      margin: 3px 0;
    }
    .label {
      color: #111827;
      font-weight: 500;
    }
    .value {
      font-weight: 700;
    }
    .notice {
      margin: 14px 0 12px;
      font-size: 11px;
      font-style: italic;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 12px 0 18px;
    }
    .summary-card {
      border: 1px solid #d1d5db;
      padding: 8px;
      min-height: 54px;
    }
    .summary-card span {
      display: block;
      color: #4b5563;
      font-size: 10px;
      text-transform: uppercase;
    }
    .summary-card strong {
      display: block;
      margin-top: 4px;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td {
      border: 1px solid #111827;
      padding: 6px 7px;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      background: #f3f4f6;
      font-weight: 700;
      text-align: center;
    }
    .money {
      text-align: right;
      white-space: nowrap;
      font-weight: 700;
    }
    .in { color: #047857; }
    .out { color: #b91c1c; }
    .empty {
      color: #6b7280;
      font-style: italic;
      text-align: center;
    }
    .footer {
      margin-top: 18px;
      color: #6b7280;
      font-size: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>B&#7842;NG CHI TI&#7870;T GIAO D&#7882;CH</h1>

    <div class="meta">
      <div>
        <div class="row"><div class="label">Chi&#7871;n d&#7883;ch:</div><div class="value">${escapeHtml(campaign.title)}</div></div>
        <div class="row"><div class="label">M&#227; chi&#7871;n d&#7883;ch:</div><div class="value">${escapeHtml(campaign.displayId || campaign._id)}</div></div>
        <div class="row"><div class="label">Ch&#7911; d&#7921; &#225;n:</div><div class="value">${escapeHtml(ownerName)}</div></div>
        <div class="row"><div class="label">M&#7909;c ti&#234;u:</div><div class="value">${escapeHtml(formatVND(campaign.goalAmount))}</div></div>
        <div class="row"><div class="label">Tr&#7841;ng th&#225;i:</div><div class="value">${escapeHtml(campaign.status)}</div></div>
      </div>
      <div>
        <div class="row"><div class="label">Ch&#7911; t&#224;i kho&#7843;n:</div><div class="value">${escapeHtml(account.name)}</div></div>
        <div class="row"><div class="label">S&#7889; t&#224;i kho&#7843;n:</div><div class="value">${escapeHtml(account.number)}</div></div>
        <div class="row"><div class="label">Ng&#226;n h&#224;ng:</div><div class="value">${escapeHtml(account.bank)}</div></div>
        <div class="row"><div class="label">Lo&#7841;i ti&#7873;n t&#7879;:</div><div class="value">VND</div></div>
        <div class="row"><div class="label">Ng&#224;y gi&#7901; xu&#7845;t:</div><div class="value">${escapeHtml(formatDateTime(generatedAt))}</div></div>
      </div>
    </div>

    <p class="notice">
      *** L&#432;u &#253; quan tr&#7885;ng: B&#7843;ng chi ti&#7871;t giao d&#7883;ch n&#224;y &#273;&#432;&#7907;c xu&#7845;t t&#7915; h&#7879; th&#7889;ng OpenHeart theo d&#7919; li&#7879;u &#273;&#227; ghi nh&#7853;n trong &#7913;ng d&#7909;ng, ph&#7909;c v&#7909; m&#7909;c &#273;&#237;ch minh b&#7841;ch d&#242;ng ti&#7873;n theo chi&#7871;n d&#7883;ch. T&#224;i li&#7879;u n&#224;y kh&#244;ng ph&#7843;i sao k&#234; ch&#237;nh th&#7913;c t&#7915; ng&#226;n h&#224;ng.
    </p>

    <div class="summary">
      <div class="summary-card"><span>T&#7893;ng ti&#7873;n v&#224;o</span><strong>${escapeHtml(formatVND(summary.totalIn))}</strong></div>
      <div class="summary-card"><span>T&#7893;ng ti&#7873;n ra</span><strong>${escapeHtml(formatVND(summary.totalOut))}</strong></div>
      <div class="summary-card"><span>S&#7889; d&#432; c&#242;n l&#7841;i</span><strong>${escapeHtml(formatVND(summary.remainingBalance))}</strong></div>
      <div class="summary-card"><span>L&#432;&#7907;t &#7911;ng h&#7897; / gi&#7843;i ng&#226;n</span><strong>${summary.donationCount} / ${summary.disbursementCount}</strong></div>
    </div>

    <h2>I. D&#242;ng ti&#7873;n v&#224;o t&#7915; nh&#224; h&#7843;o t&#226;m</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%">M&#227; giao d&#7883;ch</th>
          <th style="width: 14%">Th&#7901;i gian</th>
          <th style="width: 16%">Ng&#432;&#7901;i &#7911;ng h&#7897;</th>
          <th>N&#7897;i dung giao d&#7883;ch</th>
          <th style="width: 14%">S&#7889; ti&#7873;n</th>
        </tr>
      </thead>
      <tbody>${renderDonationRows(donations)}</tbody>
    </table>

    <h2>II. D&#242;ng ti&#7873;n ra &#273;&#227; gi&#7843;i ng&#226;n</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%">M&#227; gi&#7843;i ng&#226;n</th>
          <th style="width: 14%">Th&#7901;i gian</th>
          <th style="width: 15%">Ng&#432;&#7901;i nh&#7853;n</th>
          <th>L&#253; do gi&#7843;i ng&#226;n</th>
          <th style="width: 14%">S&#7889; ti&#7873;n</th>
        </tr>
      </thead>
      <tbody>${renderDisbursementRows(disbursements, ownerName)}</tbody>
    </table>

    <div class="footer">
      T&#224;i li&#7879;u &#273;&#432;&#7907;c t&#7841;o t&#7921; &#273;&#7897;ng b&#7903;i h&#7879; th&#7889;ng OpenHeart.
    </div>
  </div>
</body>
</html>`
}

module.exports = buildStatementHtml
