/* eslint-disable */

const BRANDS = [
  "SAN LUIS",
  "CIELO",
  "SAN MATEO",
  "AJINOMEN",
  "SAPOLIO",
  "FANNY",
  "FLORIDA",
  "PRIMOR",
  "SPORADE",
  "GATORADE",
  "BIO ALOE",
  "POWERADE",
  "SANTIAGO",
  "BAHIA",
  "FABER CASTELL",
  "BUBBALOO",
  "CHARADA",
  "BIG BEN",
  "TOFEE OLD ENGLAND",
  "MONTE RICO",
  "FULL",
  "MENTITAS",
  "COLGATE",
  "CEREAL BAR",
  "ANGEL",
  "CHEETOS",
  "CHICLETS",
  "CLORETS",
  "TRIDENT",
  "BON O BON",
  "CAÑONAZO",
  "CAREZZA",
  "COSTA",
  "VIZZIO",
  "CUA CUA",
  "DOÑA PEPA",
  "FOCHIS",
  "GOLPE",
  "MECANO",
  "SUBLIME",
  "NIKOLO",
  "PRINCESA",
  "TRIANGULO",
  "GLOBO POP",
  "CUATES",
  "DORITO",
  "TAKIS",
  "DOWNY",
  "BOLIVAR",
  "VOLT",
  "LLAMA",
  "FRUGELE",
  "FRUGOS DEL VALLE",
  "MARQUESITAS",
  "CHOCO DONUTS",
  "GRETEL",
  "CHOCO BUM",
  "CHOCO TRAVESURAS",
  "CHOCOCHIP",
  "FIELD",
  "DORE",
  "CRACKNEL",
  "MARIE",
  "FRAC",
  "OREO",
  "PICARAS",
  "RITZ",
  "SALADITA",
  "SAN JORGE",
  "CHOCOSODA",
  "CHIN CHIN",
  "VIC CASINO",
  "VIC GLACITAS",
  "COCA COLA",
  "INCA KOLA",
  "FANTA",
  "KARINTO",
  "CAMAY",
  "HENO DE PRAVIA",
  "PALMOLIVE",
  "NEKO",
  "BIMBO",
  "KING KONG",
  "SUAVE",
  "NARANJA",
  "SNAX",
  "GILLETTE",
  "SHICK",
  "SAL DE ANDREWS",
  "H&S",
  "SEDAL",
  "VICK VAPORUP",
  "WUENASA",
  "NIK",
  "LAYS"
];


function normalizeText(t) {
  return (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractSizeAndUnit(text) {
  const rules = [
    { re: /(\d+(?:[.,]\d+)?)\s?(ml|mL|ML)/i, unit: 'ml' },
    { re: /(\d+(?:[.,]\d+)?)\s?(l|L|lt|litros?)/i, unit: 'lt' },
    { re: /(\d+(?:[.,]\d+)?)\s?(g|gr|gramos?)/i, unit: 'gr' },
    { re: /(\d+(?:[.,]\d+)?)\s?(kg|kilos?)/i, unit: 'kg' }
  ];
  for (const r of rules) {
    const m = text.match(r.re);
    if (m) return { size: parseFloat(String(m[1]).replace(',', '.')), unit: r.unit };
  }
  const n = text.match(/(\d+)/);
  return { size: n ? parseFloat(n[1]) : null, unit: n ? 'u' : null };
}

function detectBrand(text) {
  const t = normalizeText(text);
  for (const b of BRANDS) {
    if (t.includes(b)) {
      return b.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  }
  return null;
}

module.exports = { normalizeText, extractSizeAndUnit, detectBrand };
