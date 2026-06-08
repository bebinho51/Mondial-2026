# Résultats en direct — installation (100 % gratuit)

Ce dossier rend ton site de la Coupe du Monde 2026 capable d'afficher les **scores**,
mis à jour automatiquement, **sans payer et sans clé d'API**.

Source des scores : **openfootball** (libre, domaine public). Les scores apparaissent
peu après chaque match (ce n'est pas du minute-par-minute, mais c'est fiable et gratuit).

## Comment ça marche
- `fetch-results.mjs` télécharge les scores et écrit `results.json` (clé = numéro de match 1→104).
- `.github/workflows/results.yml` exécute ce script **toutes les 10 minutes** via GitHub Actions (gratuit).
- `index.html` (ton site) lit `results.json` au chargement et se met à jour tout seul (toutes les 60 s).

## Mise en place (≈ 5 minutes)
1. Crée un compte sur https://github.com (gratuit) puis un **nouveau dépôt** (Repository), ex. `mondial-2026`, en **Public**.
2. Téléverse **tout le contenu de ce dossier** dans le dépôt en gardant l'arborescence :
   - `index.html`
   - `results.json`
   - `fetch-results.mjs`
   - `.github/workflows/results.yml`
   (Sur GitHub : bouton **Add file → Upload files**. Glisse aussi le dossier `.github`.)
3. Active **GitHub Pages** : onglet **Settings → Pages → Build and deployment →
   Source : *Deploy from a branch* → Branch : `main` / `/ (root)` → Save.**
   Ton site sera en ligne à l'adresse `https://TON-PSEUDO.github.io/mondial-2026/`.
4. Active les **Actions** : onglet **Actions** → si demandé, clique *I understand… enable workflows*.
5. (Facultatif, pour tester tout de suite) onglet **Actions → "Mise à jour des résultats" → Run workflow**.

C'est tout. Pendant le tournoi, le workflow tourne seul toutes les 10 min, met à jour
`results.json`, et ton site affiche les scores. Quand aucun match n'est en cours, rien ne change.

## Bon à savoir
- Tant qu'il n'y a pas de `results.json` rempli (ou hors-ligne), le site fonctionne
  normalement en mode **calendrier** — aucune erreur.
- GitHub Actions est gratuit pour un dépôt public. Le cron tourne au minimum ~ toutes les 5–10 min
  (parfois un peu décalé, c'est normal côté GitHub).
- **Tu veux du vrai temps réel (score minute par minute)** ? Remplace l'intérieur de
  `fetch-results.mjs` par un appel à une API « live » (avec une clé mise en *secret* GitHub :
  Settings → Secrets → Actions). Garde le même format de sortie :
  `{"updated": "...", "matches": { "<id>": {"a":2,"b":1,"status":"LIVE","minute":67} } }`.
  Le site gère déjà l'affichage « 🔴 Direct » et la minute.

## Format de results.json
```json
{
  "updated": "2026-06-11T19:05:00Z",
  "matches": {
    "1":  { "a": 2, "b": 1, "status": "FT" },
    "73": { "a": 0, "b": 0, "status": "LIVE", "minute": 23 }
  }
}
```
`status` : `LIVE` (en cours), `FT` (terminé), `AET` (après prolong.), `PEN` (tab).
