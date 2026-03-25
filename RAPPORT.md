# Rapport — TP ArchiApp : Message Board

## Description du projet

Ce projet est une application web de dépôt et consultation de messages, réalisée en deux parties :

- **Partie 1** : Interface client (HTML + CSS + JavaScript)
- **Partie 2** : Micro-service serveur (NodeJS + Express)

---

## Structure du projet

```
ArchiApp/
├── client/
│   ├── index.html   — Page HTML principale
│   ├── style.css    — Feuille de style (thème clair + sombre)
│   └── script.js    — Logique JavaScript côté client
└── server/
    ├── index.js     — Micro-service Express
    └── package.json — Dépendances Node
```

---

## Partie 1 — Côté client

### Structure HTML

La page contient :
- Un **header** avec le titre et un bouton de basculement de thème
- Un **champ de configuration** pour saisir l'adresse du micro-service (modularité §3.4)
- Une **liste `<ul>`** qui affiche les messages chargés dynamiquement
- Un **formulaire de saisie** avec un champ pseudo, une `<textarea>` et un `<button>` d'envoi

### CSS

Deux thèmes implémentés via des variables CSS (`:root` pour le clair, `body.dark` pour le sombre) :
- Couleur du titre : bleu foncé (`#2c3e7a`) / bleu clair en mode sombre
- Marges et disposition en `flexbox`
- Couleur de fond distincte pour les sections et les messages

### JavaScript

- `fact(n)` : calcul de la factorielle par récursion
- `applique(f, tab)` : applique une fonction à chaque élément d'un tableau (équivalent de `map`)
- `msgs` : tableau d'objets `{ msg, pseudo, date }` (voir structure ci-dessous)
- `update(tabMsgs)` : efface le `<ul>` et recrée les `<li>` avec le texte, le pseudo et la date formatée
- `toggleTheme()` : bascule la classe `dark` sur `<body>`
- Appels AJAX via `fetch` pour communiquer avec le micro-service

---

## Partie 2 — Micro-service NodeJS

### Dépendances

- **express** : framework HTTP pour définir les routes
- **cors** : middleware pour autoriser les requêtes cross-origin depuis le client HTML

### Routes implémentées

| Route | Description | Réponse |
|-------|-------------|---------|
| `GET /test/:texte` | Retourne le texte passé en paramètre | `{ msg: "texte" }` |
| `GET /cpt/query` | Retourne la valeur du compteur | `{ compteur: N }` |
| `GET /cpt/inc` | Incrémente le compteur de 1 | `{ code: 0 }` |
| `GET /cpt/inc?v=N` | Incrémente de N (entier) ou erreur | `{ code: 0 }` ou `{ code: -1 }` |
| `GET /msg/getAll` | Retourne tous les messages | tableau JSON |
| `GET /msg/get/:num` | Retourne le message n°`num` | `{ code: 1, msg, pseudo, date }` ou `{ code: 0 }` |
| `GET /msg/nber` | Retourne le nombre de messages | entier |
| `GET /msg/post/:msg?pseudo=x` | Ajoute un message | `{ code: 0, num: N }` |
| `GET /msg/del/:num` | Supprime le message n°`num` | `{ code: 0 }` ou `{ code: -1 }` |

### Structure de données

Les messages sont stockés dans un tableau en mémoire (`allMsgs`). Chaque entrée est un objet :

```json
{
  "msg":    "Texte du message",
  "pseudo": "NomUtilisateur",
  "date":   "2026-03-25T10:00:00.000Z"
}
```

Le **numéro du message** correspond à son indice dans le tableau. Cette approche simple suffit pour un prototype ; en production, une base de données (SQLite, MongoDB…) serait préférable.

### Connexion client-serveur (AJAX)

Au chargement de la page, `fetch("/msg/getAll")` est appelé. La réponse JSON peuple la liste via `update()`. Lors d'un envoi, `fetch("/msg/post/...")` est appelé, suivi d'un rechargement automatique de la liste.

---

## Lancer le projet en local

```bash
# Serveur (port 3000)
cd server
npm install
npm start

# Client : ouvrir client/index.html dans le navigateur
# (s'assurer que l'adresse du micro-service est bien http://localhost:3000)
```
