const TIER_ORDER = { core: 0, important: 1, supporting: 2 };

export function sortedConcepts(concepts) {
  return [...concepts].sort((a, b) => {
    const t = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    return t !== 0 ? t : a.order - b.order;
  });
}

// Cộng dồn estimated_minutes theo thứ tự tier đã sort, dừng khi vượt ngân sách —
// luôn giữ ít nhất 1 khái niệm dù nó một mình đã vượt ngân sách (G8 — dễ bỏ qua,
// không ép user theo đúng thứ tự AI đưa ra khi họ đổi quỹ thời gian).
export function planForBudget(concepts, limit) {
  if (limit == null) return sortedConcepts(concepts);
  const all = sortedConcepts(concepts);
  const picked = [];
  let sum = 0;
  for (const c of all) {
    if (!picked.length || sum + c.estimated_minutes <= limit) {
      picked.push(c);
      sum += c.estimated_minutes;
    } else break;
  }
  return picked;
}
