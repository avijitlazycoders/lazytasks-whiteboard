// compareScenes.js
/**
 * Compare two Excalidraw-like scene JSONs focusing on core fields.
 * Ignores deleted elements (isDeleted: true).
 * Returns { equal: boolean, differences: string[] }
 *
 * @param {object} sceneA
 * @param {object} sceneB
 * @param {object} [opts]
 * @param {number} [opts.tolerance=0] numeric tolerance for width/height/x/y/strokeWidth comparisons
 */
export function compareScenes(sceneA, sceneB, opts = {}) {
  const tolerance = typeof opts.tolerance === "number" ? opts.tolerance : 0;

  const diffs = [];
  const safeArr = v => Array.isArray(v) ? v : [];
  const safeFiles = v => (v && typeof v === "object") ? v : {};

  // filter out deleted elements
  const elementsA = safeArr(sceneA?.elements).filter(e => !e?.isDeleted);
  const elementsB = safeArr(sceneB?.elements).filter(e => !e?.isDeleted);

  const filesA = safeFiles(sceneA?.files);
  const filesB = safeFiles(sceneB?.files);

  // 1) Compare counts
  if (elementsA.length !== elementsB.length) {
    diffs.push(`elements count differs: A=${elementsA.length}, B=${elementsB.length}`);
  }

  const filesCountA = Object.keys(filesA).length;
  const filesCountB = Object.keys(filesB).length;
  if (filesCountA !== filesCountB) {
    diffs.push(`files count differs: A=${filesCountA}, B=${filesCountB}`);
  }

  // 2) Compare per-element core fields (matched by id)
  const FIELDS = [
    "type",
    "width",
    "height",
    "x",
    "y",
    "backgroundColor",
    "strokeColor",
    "strokeStyle",
    "strokeWidth",
  ];

  const toCore = (el) => {
    if (!el || typeof el !== "object") return null;
    const core = {};
    for (const k of FIELDS) core[k] = el[k];
    return core;
  };

  const byId = (arr) => {
    const map = new Map();
    for (const el of arr) {
      if (el?.id) map.set(el.id, el);
    }
    return map;
  };

  const Amap = byId(elementsA);
  const Bmap = byId(elementsB);

  const allIds = new Set([...Amap.keys(), ...Bmap.keys()]);

  const numEq = (a, b) => {
    const n1 = typeof a === "number" ? a : 0;
    const n2 = typeof b === "number" ? b : 0;
    return Math.abs(n1 - n2) <= tolerance;
  };

  for (const id of allIds) {
    const aEl = Amap.get(id);
    const bEl = Bmap.get(id);
    if (!aEl || !bEl) {
      diffs.push(`element id=${id} exists in ${aEl ? "A" : "B"} but not the other`);
      continue;
    }

    const aCore = toCore(aEl);
    const bCore = toCore(bEl);

    for (const field of FIELDS) {
      const av = aCore[field];
      const bv = bCore[field];

      if (["width", "height", "x", "y", "strokeWidth"].includes(field)) {
        if (!numEq(av, bv)) {
          diffs.push(`id=${id} ${field} differs: A=${av}, B=${bv}`);
        }
      } else {
        const aNorm = av ?? "";
        const bNorm = bv ?? "";
        if (aNorm !== bNorm) {
          diffs.push(`id=${id} ${field} differs: A=${JSON.stringify(aNorm)}, B=${JSON.stringify(bNorm)}`);
        }
      }
    }
  }

  return { equal: diffs.length === 0, differences: diffs };
}
