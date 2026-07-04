// fetch-results.mjs (v2) — Mondial 2026
// Source gratuite : openfootball/worldcup.json (aucune clé requise).
// Écrit results.json : pour CHAQUE match (id 1..104) -> équipes (français) + score + vainqueur.
// Lancé automatiquement par GitHub Actions (Node 18+).

const SOURCE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// openfootball (anglais) -> noms FR (alignés sur les drapeaux du site)
const EN2FR = {"Algeria":"Algérie","Argentina":"Argentine","Australia":"Australie","Austria":"Autriche","Belgium":"Belgique","Bosnia & Herzegovina":"Bosnie-et-Herzégovine","Brazil":"Brésil","Canada":"Canada","Cape Verde":"Cap-Vert","Colombia":"Colombie","Croatia":"Croatie","Curaçao":"Curaçao","Czech Republic":"Tchéquie","DR Congo":"RD Congo","Ecuador":"Équateur","Egypt":"Égypte","England":"Angleterre","France":"France","Germany":"Allemagne","Ghana":"Ghana","Haiti":"Haïti","Iran":"RI Iran","Iraq":"Irak","Ivory Coast":"Côte d'Ivoire","Japan":"Japon","Jordan":"Jordanie","Mexico":"Mexique","Morocco":"Maroc","Netherlands":"Pays-Bas","New Zealand":"Nouvelle-Zélande","Norway":"Norvège","Panama":"Panamá","Paraguay":"Paraguay","Portugal":"Portugal","Qatar":"Qatar","Saudi Arabia":"Arabie saoudite","Scotland":"Écosse","Senegal":"Sénégal","South Africa":"Afrique du Sud","South Korea":"République de Corée","Spain":"Espagne","Sweden":"Suède","Switzerland":"Suisse","Tunisia":"Tunisie","Turkey":"Turquie","USA":"États-Unis","Uruguay":"Uruguay","Uzbekistan":"Ouzbékistan"};

// table des matchs de groupe : paire de jetons triée -> id (1..72)
const TOKENS=["algeria","argentina","australia","austria","belgium","bosnia","brazil","canada","colombia","congo","croatia","curacao","czech","ecuador","egypt","england","france","germany","ghana","haiti","iran","iraq","ivory","japan","jordan","mexico","morocco","netherlands","new zealand","norway","panama","paraguay","portugal","qatar","saudi","scotland","senegal","south africa","south korea","spain","sweden","switzerland","tunisia","turk","usa","united states","uruguay","uzbek","verde"];
const GROUP_PAIRS=[["mexico","south africa",1],["south korea","czech",2],["canada","bosnia",3],["usa","paraguay",4],["qatar","switzerland",5],["brazil","morocco",6],["haiti","scotland",7],["australia","turk",8],["germany","curacao",9],["netherlands","japan",10],["ivory","ecuador",11],["sweden","tunisia",12],["spain","verde",13],["belgium","egypt",14],["saudi","uruguay",15],["iran","new zealand",16],["france","senegal",17],["iraq","norway",18],["argentina","algeria",19],["austria","jordan",20],["portugal","congo",21],["england","croatia",22],["ghana","panama",23],["uzbek","colombia",24],["czech","south africa",25],["switzerland","bosnia",26],["canada","qatar",27],["mexico","south korea",28],["usa","australia",29],["scotland","morocco",30],["brazil","haiti",31],["turk","paraguay",32],["netherlands","sweden",33],["germany","ivory",34],["ecuador","curacao",35],["tunisia","japan",36],["spain","saudi",37],["belgium","iran",38],["uruguay","verde",39],["new zealand","egypt",40],["argentina","austria",41],["france","iraq",42],["norway","senegal",43],["jordan","algeria",44],["portugal","uzbek",45],["england","ghana",46],["panama","croatia",47],["colombia","congo",48],["switzerland","canada",49],["bosnia","qatar",50],["scotland","brazil",51],["morocco","haiti",52],["czech","mexico",53],["south africa","south korea",54],["ecuador","germany",55],["curacao","ivory",56],["tunisia","netherlands",57],["japan","sweden",58],["turk","usa",59],["paraguay","australia",60],["norway","france",61],["senegal","iraq",62],["uruguay","spain",63],["verde","saudi",64],["new zealand","belgium",65],["egypt","iran",66],["panama","england",67],["croatia","ghana",68],["colombia","portugal",69],["congo","uzbek",70],["jordan","argentina",71],["algeria","austria",72]];
const norm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z ]/g,"");
const tokenOf=name=>{const n=norm(name);for(const t of TOKENS)if(n.includes(t))return t;return null;};
const GROUP={}; for(const [a,b,id] of GROUP_PAIRS) GROUP[[a,b].sort().join("|")]=id;
const fr=name=>EN2FR[name]||null;   // null si placeholder (W##/L##)
const ref=s=>{const m=/^([WL])(\d+)$/.exec((s||'').trim());return m?{lose:m[1]==='L',num:+m[2]}:null;};

const run=async()=>{
  const res=await fetch(SOURCE,{headers:{"User-Agent":"wc2026"}});
  if(!res.ok) throw new Error("source HTTP "+res.status);
  const data=await res.json();
  const out={};
  for(const m of (data.matches||[])){
    let id=m.num||null;
    if(id==null && m.group){ const a=tokenOf(m.team1),b=tokenOf(m.team2); if(a&&b) id=GROUP[[a,b].sort().join("|")]; }
    if(id==null) continue;
    const e={a:fr(m.team1),b:fr(m.team2)};
    // structure du tableau : liens vers les matchs nourriciers (W##/L##)
    const ra=ref(m.team1), rb=ref(m.team2);
    if(ra){ e.fa=ra.num; if(ra.lose)e.la=1; }
    if(rb){ e.fb=rb.num; if(rb.lose)e.lb=1; }
    const sc=m.score||{};
    if(sc.ft && sc.ft[0]!=null){
      e.sa=sc.ft[0]; e.sb=sc.ft[1];
      if(sc.ht) e.ht=sc.ht;
      if(sc.et) e.et=sc.et;
      if(sc.p){ e.pa=sc.p[0]; e.pb=sc.p[1]; e.status="PEN"; e.win=sc.p[0]>sc.p[1]?"a":"b"; }
      else { e.status="FT"; e.win = e.sa>e.sb?"a":(e.sb>e.sa?"b":null); }
    } else { e.status="SCHED"; }
    // buteurs (compact) : g1 = buts comptés pour l'équipe 1, g2 pour l'équipe 2
    const goals=arr=>(arr||[]).map(g=>{const o={n:g.name,m:g.minute};if(g.owngoal)o.og=1;if(g.penalty)o.pen=1;return o;});
    const g1=goals(m.goals1), g2=goals(m.goals2);
    if(g1.length)e.g1=g1; if(g2.length)e.g2=g2;
    out[id]=e;
  }
  const payload={updated:new Date().toISOString(),count:Object.values(out).filter(x=>x.status!=="SCHED").length,matches:out};
  const fs=await import("node:fs/promises");
  await fs.writeFile("results.json",JSON.stringify(payload));
  console.log("results.json écrit —",payload.count,"matchs joués /",Object.keys(out).length,"référencés");
};
run().catch(e=>{console.error(e);process.exit(1);});
