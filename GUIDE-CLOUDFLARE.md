# Héberger sur Cloudflare Pages (gratuit, sans pseudo, illimité)

Objectif : un lien du type **`mondial2026.pages.dev`** (tu choisis le nom, aucun pseudo),
avec bande passante **illimitée**, tout en gardant la **mise à jour automatique des scores**.

## Comment ça s'articule
- Ton **dépôt GitHub** reste le « cerveau » : la tâche GitHub Actions y met à jour
  `results.json` toutes les ~10 min (comme avant).
- **Cloudflare Pages** est connecté à ce dépôt : à chaque mise à jour, il **redéploie
  automatiquement** ton site. Le public, lui, ne voit que l'adresse `*.pages.dev`.

> Tu fais d'abord les étapes GitHub du fichier `README-RESULTS.md`
> (créer le dépôt + téléverser les 4 fichiers + activer Actions).
> **Tu peux SAUTER l'étape « activer GitHub Pages »** : c'est Cloudflare qui héberge.

## Étapes Cloudflare (≈ 5 min)
1. Crée un compte gratuit sur https://dash.cloudflare.com (aucune carte requise).
2. Menu de gauche : **Workers & Pages** → bouton **Create** → onglet **Pages** →
   **Connect to Git**.
3. Autorise Cloudflare à accéder à ton GitHub, puis **choisis ton dépôt** (ex. `mondial-2026`).
4. Écran « Set up builds and deployments » :
   - **Project name** : tape le nom que tu veux → ce sera ton adresse
     `LE-NOM.pages.dev` (ex. `mondial2026` → `mondial2026.pages.dev`). **C'est ici que
     tu choisis le lien, sans ton pseudo.**
   - **Production branch** : `main`
   - **Framework preset** : **None**
   - **Build command** : *(laisse vide)*
   - **Build output directory** : `/`  (la racine)
5. Clique **Save and Deploy**. Au bout d'une minute, ton site est en ligne sur
   `https://LE-NOM.pages.dev`.

C'est fini. Désormais, quand la tâche GitHub met à jour `results.json`, Cloudflare
redéploie tout seul et les scores apparaissent sur ton lien `*.pages.dev`.

## Bon à savoir
- **Bande passante illimitée** sur le plan gratuit (idéal si beaucoup de monde).
- **Limite de builds** : 500 par mois sur le gratuit. Comme la tâche ne publie `results.json`
  **que lorsqu'un score change**, tu restes très en dessous. Si jamais tu t'en approchais,
  passe le cron de `*/10` à `*/20` dans `.github/workflows/results.yml`.
- **Changer le nom plus tard** : Workers & Pages → ton projet → **Settings → rename**
  (ou ajoute un sous-domaine personnalisé).
- **Nom de domaine perso** (ex. `mondial2026.fr`, ~10 €/an) : ton projet →
  **Custom domains → Set up a domain**. L'hébergement reste gratuit.

## Alternative ultra-simple (sans Git, MAIS sans auto-update)
Tu peux aussi glisser-déposer `index.html` sur Cloudflare Pages (Upload assets) :
c'est immédiat, mais les **scores ne se mettront pas à jour tout seuls** (il faudrait
re-téléverser à la main). Pour le direct automatique, garde la méthode « Connect to Git »
ci-dessus.
