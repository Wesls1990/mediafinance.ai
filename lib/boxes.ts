import type { RateMap } from './reconcile';

type CostLine = { invoice: string; supplier?: string; account: string; net: number; ff3?: string };

export function computeBoxes(costLines: CostLine[], vatClaimByInv: Record<string, number>, map: RateMap) {
  const is = (f?: string, t?: string) => !!f && !!t && f.toString().trim().toLowerCase() === t.toString().trim().toLowerCase();

  let salesNet = 0, purchasesNet = 0, expectedReclaim = 0;

  for (const L of costLines) {
    const f = L.ff3 || '';

    if (is(f, map.sales20)) { salesNet += L.net; continue; }
    if (is(f, map.funding)) { continue; }

    if (
      is(f, map.std20) || is(f, map.red5) || is(f, map.red4) ||
      is(f, map.zero) || is(f, map.exempt) || is(f, map.os) ||
      is(f, map.rcGoods) || is(f, map.rcServices)
    ) purchasesNet += L.net;

    if (is(f, map.std20)) expectedReclaim += L.net * 0.20;
    else if (is(f, map.red5)) expectedReclaim += L.net * 0.05;
    else if (is(f, map.red4)) expectedReclaim += L.net * 0.04;
  }

  const claimedReclaim = Object.values(vatClaimByInv).reduce((a,b)=>a+b,0);

  const box1 = salesNet * 0.20;
  const box2 = 0;
  const box3 = box1 + box2;
  const box4 = claimedReclaim;
  const box5 = box3 - box4;
  const box6 = Math.max(0, salesNet);
  const box7 = Math.max(0, purchasesNet);
  const box8 = 0, box9 = 0;

  return {
    boxes: { 1: r2(box1), 2: r2(box2), 3: r2(box3), 4: r2(box4), 5: r2(box5), 6: r2(box6), 7: r2(box7), 8: r2(box8), 9: r2(box9) },
    expectedReclaim: r2(expectedReclaim),
    claimedReclaim: r2(claimedReclaim),
    variance: r2(expectedReclaim - claimedReclaim)
  };
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
