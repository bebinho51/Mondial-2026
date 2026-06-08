# ✅ CHECKLIST — de zéro au site en ligne (gratuit, scores auto, sans pseudo)

Coche dans l'ordre. Total ≈ 15 min. Aucune carte bancaire, rien à payer.

## 🗂️ Étape 0 — Les fichiers (déjà prêts)
- [ ] Décompresse ce dossier. Tu dois avoir : `index.html`, `results.json`,
      `fetch-results.mjs`, et le dossier `.github` (avec `workflows/results.yml`).
      (Les `.md` sont des guides, pas besoin de les téléverser.)

## 🐙 Étape 1 — Créer le dépôt GitHub
- [ ] Crée un compte gratuit sur https://github.com
- [ ] En haut à droite : **+ → New repository**
- [ ] Nom du dépôt : ex. `mondial-2026` · coche **Public** · clique **Create repository**

## 📤 Étape 2 — Téléverser les fichiers
- [ ] Sur la page du dépôt : **Add file → Upload files**
- [ ] Glisse `index.html`, `results.json`, `fetch-results.mjs`
- [ ] Glisse AUSSI le dossier **`.github`** (avec `workflows/results.yml` dedans)
- [ ] En bas : **Commit changes**

## ⚙️ Étape 3 — Activer la tâche automatique (Actions)
- [ ] Onglet **Actions** (en haut du dépôt)
- [ ] Si un message apparaît : clique **I understand my workflows, go ahead and enable them**
- [ ] (Test immédiat, facultatif) clique **« Mise à jour des résultats »** → **Run workflow → Run workflow**
      → après ~30 s, `results.json` est régénéré (0 score pour l'instant, c'est normal)

> ⏭️ NE FAIS PAS l'étape « GitHub Pages » : c'est Cloudflare qui héberge (étape suivante).

## ☁️ Étape 4 — Mettre en ligne sur Cloudflare (lien sans pseudo)
- [ ] Crée un compte gratuit sur https://dash.cloudflare.com (sans carte)
- [ ] Menu de gauche : **Workers & Pages → Create → onglet Pages → Connect to Git**
- [ ] Autorise l'accès à GitHub, puis **sélectionne ton dépôt** (`mondial-2026`)
- [ ] Réglages de déploiement :
  - [ ] **Project name** = le nom du lien voulu (ex. `mondial2026` → `mondial2026.pages.dev`)
  - [ ] **Production branch** : `main`
  - [ ] **Framework preset** : **None**
  - [ ] **Build command** : *(laisser vide)*
  - [ ] **Build output directory** : `/`
- [ ] Clique **Save and Deploy** → attends ~1 min

## 🎉 Étape 5 — Vérifier
- [ ] Ouvre `https://TON-NOM.pages.dev` → le site s'affiche
- [ ] Teste sur ton téléphone + en partageant le lien à quelqu'un
- [ ] Pendant le tournoi : les scores apparaîtront tout seuls (calendrier, classement,
      phase finale) avec le bandeau « 🔴 Résultats activés ». Rien d'autre à faire.

---

### ❓ En cas de souci
- **Le site affiche 404 / page blanche** → vérifie que `index.html` est bien à la racine
  du dépôt (pas dans un sous-dossier) et que *Build output directory* = `/`.
- **Les scores ne bougent pas pendant un match** → normal : la source (openfootball) publie
  les scores peu après les matchs, pas à la seconde. La page se rafraîchit seule toutes les 60 s.
- **Changer le nom du lien plus tard** → Cloudflare → ton projet → **Settings → rename**.
- **Trop de builds Cloudflare (rare)** → dans `.github/workflows/results.yml`, remplace
  `cron: '*/10 * * * *'` par `'*/20 * * * *'`.
