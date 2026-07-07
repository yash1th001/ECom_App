const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmtDec = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export const rupees = (v: number) => `\u20B9${fmt.format(Math.max(0, Math.round(v)))}`;
export const rupeesDec = (v: number) => `\u20B9${fmtDec.format(Math.max(0, v))}`;
export const grams = (v: number) => `${fmtDec.format(v)} g`;

export const timeLeft = (msLeft: number) => {
  const t = Math.max(0, Math.floor(msLeft / 1000));
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = (t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};