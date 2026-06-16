// fetch-results.mjs — récupère les scores du Mondial 2026 (source gratuite openfootball)
// et écrit results.json (clé = id de match 1..104) pour le site. Node 18+ (fetch intégré).
// Aucune clé requise. Lancé automatiquement par GitHub Actions.

const SOURCE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// --- correspondance matchs openfootball -> identifiants du site ---
const FIXTURES = {"tokens": ["algeria", "argentina", "australia", "austria", "belgium", "bosnia", "brazil", "canada", "colombia", "congo", "croatia", "curacao", "czech", "ecuador", "egypt", "england", "france", "germany", "ghana", "haiti", "iran", "iraq", "ivory", "japan", "jordan", "mexico", "morocco", "netherlands", "new zealand", "norway", "panama", "paraguay", "portugal", "qatar", "saudi", "scotland", "senegal", "south africa", "south korea", "spain", "sweden", "switzerland", "tunisia", "turk", "usa", "united states", "uruguay", "uzbek", "verde"], "group": [["mexico", "south africa", 1], ["south korea", "czech", 2], ["canada", "bosnia", 3], ["usa", "paraguay", 4], ["qatar", "switzerland", 5], ["brazil", "morocco", 6], ["haiti", "scotland", 7], ["australia", "turk", 8], ["germany", "curacao", 9], ["netherlands", "japan", 10], ["ivory", "ecuador", 11], ["sweden", "tunisia", 12], ["spain", "verde", 13], ["belgium", "egypt", 14], ["saudi", "uruguay", 15], ["iran", "new zealand", 16], ["france", "senegal", 17], ["iraq", "norway", 18], ["argentina", "algeria", 19], ["austria", "jordan", 20], ["portugal", "congo", 21], ["england", "croatia", 22], ["ghana", "panama", 23], ["uzbek", "colombia", 24], ["czech", "south africa", 25], ["switzerland", "bosnia", 26], ["canada", "qatar", 27], ["mexico", "south korea", 28], ["usa", "australia", 29], ["scotland", "morocco", 30], ["brazil", "haiti", 31], ["turk", "paraguay", 32], ["netherlands", "sweden", 33], ["germany", "ivory", 34], ["ecuador", "curacao", 35], ["tunisia", "japan", 36], ["spain", "saudi", 37], ["belgium", "iran", 38], ["uruguay", "verde", 39], ["new zealand", "egypt", 40], ["argentina", "austria", 41], ["france", "iraq", 42], ["norway", "senegal", 43], ["jordan", "algeria", 44], ["portugal", "uzbek", 45], ["england", "ghana", 46], ["panama", "croatia", 47], ["colombia", "congo", 48], ["switzerland", "canada", 49], ["bosnia", "qatar", 50], ["scotland", "brazil", 51], ["morocco", "haiti", 52], ["czech", "mexico", 53], ["south africa", "south korea", 54], ["ecuador", "germany", 55], ["curacao", "ivory", 56], ["tunisia", "netherlands", 57], ["japan", "sweden", 58], ["turk", "usa", 59], ["paraguay", "australia", 60], ["norway", "france", 61], ["senegal", "iraq", 62], ["uruguay", "spain", 63], ["verde", "saudi", 64], ["new zealand", "belgium", 65], ["egypt", "iran", 66], ["panama", "england", 67], ["croatia", "ghana", 68], ["colombia", "portugal", 69], ["congo", "uzbek", 70], ["jordan", "argentina", 71], ["algeria", "austria", 72]], "ko": {"2026-06-28T19:00:00Z": 73, "2026-06-29T17:00:00Z": 74, "2026-06-29T20:30:00Z": 75, "2026-06-30T01:00:00Z": 76, "2026-06-30T17:00:00Z": 77, "2026-06-30T21:00:00Z": 78, "2026-07-01T01:00:00Z": 79, "2026-07-01T16:00:00Z": 80, "2026-07-01T20:00:00Z": 81, "2026-07-02T00:00:00Z": 82, "2026-07-02T19:00:00Z": 83, "2026-07-02T23:00:00Z": 84, "2026-07-03T03:00:00Z": 85, "2026-07-03T18:00:00Z": 86, "2026-07-03T22:00:00Z": 87, "2026-07-04T01:30:00Z": 88, "2026-07-04T17:00:00Z": 89, "2026-07-04T21:00:00Z": 90, "2026-07-05T20:00:00Z": 91, "2026-07-06T00:00:00Z": 92, "2026-07-06T19:00:00Z": 93, "2026-07-07T00:00:00Z": 94, "2026-07-07T16:00:00Z": 95, "2026-07-07T20:00:00Z": 96, "2026-07-09T20:00:00Z": 97, "2026-07-10T19:00:00Z": 98, "2026-07-11T21:00:00Z": 99, "2026-07-12T01:00:00Z": 100, "2026-07-14T19:00:00Z": 101, "2026-07-15T19:00:00Z": 102, "2026-07-18T21:00:00Z": 103, "2026-07-19T19:00:00Z": 104}};

const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z ]/g,"");
function tokenOf(name){ const n = norm(name); for (const t of FIXTURES.tokens){ if (n.includes(t)) return t; } return null; }

// clé d'un match de groupe = paire de jetons triée
const groupKey = (a,b) => [a,b].sort().join("|");
const GROUP = {};
for (const [a,b,id] of FIXTURES.group) GROUP[groupKey(a,b)] = id;

function ofUTC(m){ // "date" + "time" ex "15:00 UTC-4" -> ISO Z
  const mt = /(\d+):(\d+) UTC([+-]\d+)/.exec(m.time||"");
  if(!mt) return null;
  const h=+mt[1], mi=+mt[2], off=+mt[3];
  const d = new Date(`${m.date}T${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}:00Z`);
  d.setUTCHours(d.getUTCHours() - off);
  return d.toISOString().replace(/\.\d{3}Z$/,"Z");
}

const run = async () => {
  const res = await fetch(SOURCE, { headers: { "User-Agent": "wc2026-results" } });
  if(!res.ok) throw new Error("source HTTP "+res.status);
  const data = await res.json();
  const out = {};
  for (const m of (data.matches||[])){
    const sc = m.score && m.score.ft;
    if(!sc || sc.length<2 || sc[0]==null) continue; // pas encore joué
    let id = null;
    if (m.group){ // match de groupe -> par équipes
      const a = tokenOf(m.team1), b = tokenOf(m.team2);
      if(a && b) id = GROUP[groupKey(a,b)];
    }
    if (id == null){ // sinon (phase finale) -> par heure UTC exacte
      const u = ofUTC(m); if(u) id = FIXTURES.ko[u];
    }
    if (id == null) continue;
    out[id] = { a: sc[0], b: sc[1], status: "FT" };
    if (m.score.ht) out[id].ht = m.score.ht;
    if (m.score.p)  { out[id].pa = m.score.p[0]; out[id].pb = m.score.p[1]; out[id].status = "PEN"; }
  }
  const payload = { updated: new Date().toISOString(), count: Object.keys(out).length, matches: out };
  const fs = await import("node:fs/promises");
  await fs.writeFile("results.json", JSON.stringify(payload));
  console.log("results.json écrit —", payload.count, "matchs avec score");
};
run().catch(e => { console.error(e); process.exit(1); });
