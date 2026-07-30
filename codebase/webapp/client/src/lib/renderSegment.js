function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Highlight nguyên văn quote trong đoạn transcript — chỉ highlight khi quote khớp
// substring y hệt (seg.text.includes(quote)). Không khớp thì không highlight gì,
// không bịa vị trí — cùng nguyên tắc "nguồn sự thật" mà generate-review-map.mjs
// áp dụng khi sinh dữ liệu bằng AI thật.
export function renderSegmentHtml(text, activeEv) {
  if (!activeEv || activeEv.segmentId == null || !text.includes(activeEv.quote)) {
    return escapeHtml(text);
  }
  const idx = text.indexOf(activeEv.quote);
  const before = escapeHtml(text.slice(0, idx));
  let quote = escapeHtml(activeEv.quote);
  const after = escapeHtml(text.slice(idx + activeEv.quote.length));

  if (activeEv.keyPhrase && activeEv.quote.includes(activeEv.keyPhrase)) {
    const kIdx = activeEv.quote.indexOf(activeEv.keyPhrase);
    const qBefore = escapeHtml(activeEv.quote.slice(0, kIdx));
    const qKey = escapeHtml(activeEv.keyPhrase);
    const qAfter = escapeHtml(activeEv.quote.slice(kIdx + activeEv.keyPhrase.length));
    quote = `${qBefore}<u>${qKey}</u>${qAfter}`;
  }

  return `${before}<mark class="quote-hl">${quote}</mark>${after}`;
}
