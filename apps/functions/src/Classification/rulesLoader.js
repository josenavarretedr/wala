/* eslint-disable */

const admin = require('firebase-admin');

const CACHE = { rules: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 min

const GLOBAL_SEED = [
  { patterns: ['gaseosa', 'cola', 'coca-cola', 'pepsi', 'inca kola', 'incakola'], categoria: 'Bebidas', subcategoria: 'Gaseosas' },
  { patterns: ['agua', 'bidón', 'mineral'], categoria: 'Bebidas', subcategoria: 'Agua' },
  { patterns: ['leche', 'gloria', 'laive'], categoria: 'Lácteos', subcategoria: 'Leche' }
];

async function fetchRulesCollection(path) {
  try {
    const snap = await admin.firestore().collection(path).get();
    return snap.docs.map(d => d.data());
  } catch (error) {
    return [];
  }
}

function toRegexArray(patterns) {
  return (patterns || []).map(p => new RegExp(p, 'i'));
}

function normalizeRules(raw = []) {
  return raw
    .filter(r => r && r.categoria && r.subcategoria && Array.isArray(r.patterns))
    .map(r => ({
      categoria: r.categoria,
      subcategoria: r.subcategoria,
      match: toRegexArray(r.patterns)
    }));
}

function mergeRules(globalRules, rubroRules, tenantRules) {
  return [
    ...normalizeRules(globalRules),
    ...normalizeRules(rubroRules),
    ...normalizeRules(tenantRules),
  ];
}

async function loadRules({ rubro = 'generico', tenantId = null } = {}) {
  const now = Date.now();
  if (CACHE.rules && (now - CACHE.ts) < TTL_MS) return CACHE.rules;

  // Firestore: reglas globales y por rubro (opcionales)
  const [globalFS, rubroFS, tenantFS] = await Promise.all([
    fetchRulesCollection('rules_global'),
    fetchRulesCollection(`rules_by_rubro/${rubro}/rules`),
    tenantId ? fetchRulesCollection(`tenants/${tenantId}/rules`) : Promise.resolve([])
  ]);

  const merged = mergeRules(
    globalFS.length ? globalFS : GLOBAL_SEED,
    rubroFS,
    tenantFS
  );

  CACHE.rules = merged;
  CACHE.ts = now;
  return merged;
}

function rulesClassify(text, rules) {
  const t = (text || '').toLowerCase();
  for (const r of rules) {
    if (r.match.some(re => re.test(t))) {
      return {
        categoria: r.categoria,
        subcategoria: r.subcategoria,
        confidence: 0.7,
        source: 'rules'
      };
    }
  }
  return null;
}

module.exports = { loadRules, rulesClassify };
