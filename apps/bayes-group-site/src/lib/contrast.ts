export function contrastRatio(hexA: string, hexB: string): number {
  // Helper to convert hex to linear RGB
  const toRgb = (hex: string) => {
    const clean = hex.replace('#', '').toUpperCase();
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return [lin(r), lin(g), lin(b)];
  };
  const [lrA, lgA, lbA] = toRgb(hexA);
  const [lrB, lgB, lbB] = toRgb(hexB);
  const L1 = 0.2126 * lrA + 0.7152 * lgA + 0.0722 * lbA;
  const L2 = 0.2126 * lrB + 0.7152 * lgB + 0.0722 * lbB;
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
