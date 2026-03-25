# Rapport — TP ArchiApp : Message Board
**CentraleSupélec — Département Informatique**

---

## 1. Présentation du projet

L'objectif de ce TP est de réaliser une application web complète de dépôt et de consultation de messages, structurée en deux parties distinctes :

- **Partie 1 (côté client)** : une page web statique en HTML/CSS/JavaScript qui affiche des messages et permet d'en poster de nouveaux.
- **Partie 2 (côté serveur)** : un micro-service web développé en NodeJS/Express qui expose une API HTTP pour gérer les messages. La page client communique avec ce serveur via des appels AJAX.

---

## 2. Organisation du projet

Plutôt que d'utiliser deux dépôts GitHub séparés (un pour le client, un pour le serveur), nous avons fait le choix de tout regrouper dans **un seul dépôt**, organisé en deux dossiers :

```
ArchiApp/
├── client/          ← Partie 1 : page web (HTML + CSS + JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
└── server/          ← Partie 2 : micro-service NodeJS
    ├── index.js
    └── package.json
```

**Pourquoi ce choix ?** En pratique, regrouper client et serveur dans un même dépôt simplifie la gestion du projet : un seul endroit pour tout retrouver, une seule URL à soumettre, et un seul déploiement à configurer. C'est une pratique courante appelée *monorepo*.

- **Lien GitHub** : https://github.com/faresTMZ/ArchiApp
- **Lien déploiement** : https://archiapp-6x1r.onrender.com

---

## 3. Partie 1 — Côté client

### 3.1 Structure HTML

La page (`index.html`) contient les éléments demandés :
- Un **header** avec le titre "Message Board" et un bouton de bascule de thème
- Un **champ de configuration** pour saisir l'adresse du micro-service (utile pour tester avec le serveur d'un camarade)
- Une **liste `<ul>`** qui affiche les messages chargés dynamiquement depuis le serveur
- Une **section de saisie** avec un champ pseudo, une `<textarea>` pour écrire le message, et un `<button>` pour envoyer

Nous avons utilisé des balises sémantiques (`<header>`, `<main>`, `<section>`, `<h1>`, `<h2>`) pour respecter les bonnes pratiques d'accessibilité web.

### 3.2 Mise en forme CSS

Le fichier `style.css` utilise les **variables CSS** (propriétés personnalisées) pour gérer les deux thèmes (clair et sombre) :

```css
:root {
  --bg-color: #f5f5f5;
  --title-color: #2c3e7a;
  /* ... */
}
body.dark {
  --bg-color: #1a1a2e;
  --title-color: #7b9fff;
  /* ... */
}
```

**Pourquoi ce choix ?** Les variables CSS permettent de centraliser toutes les couleurs en un seul endroit. Pour basculer de thème, il suffit d'ajouter/retirer la classe `dark` sur le `<body>` en JavaScript — pas besoin de réécrire tous les styles.

On a aussi travaillé sur :
- Les **marges** et l'espacement entre sections (`gap`, `padding`)
- La **couleur du titre** (bleu foncé `#2c3e7a`)
- Les **couleurs de fond** distinctes pour la page, les sections et les cartes de messages

### 3.3 JavaScript

#### Fonctions de base (§3.1)

```javascript
function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}

function applique(f, tab) {
  var result = [];
  for (var i = 0; i < tab.length; i++) {
    result.push(f(tab[i]));
  }
  return result;
}
```

`fact` utilise la **récursion** : `fact(6)` appelle `fact(5)` qui appelle `fact(4)`... jusqu'à `fact(1)`.
`applique` est l'équivalent maison de la méthode `Array.map()` de JavaScript : elle applique une fonction à chaque élément d'un tableau.

#### Structure de données des messages (§3.2 et §3.3)

Chaque message est un objet JavaScript avec trois champs :

```javascript
{ "msg": "Hello World", "pseudo": "Admin", "date": "2026-03-25T10:00:00.000Z" }
```

**Pourquoi stocker la date et le pseudo ?** Le sujet demandait des méta-données supplémentaires pour chaque message. La date permet de savoir quand le message a été posté, et le pseudo permet d'identifier l'auteur.

#### Fonction `update(tabMsgs)` (§3.2)

```javascript
function update(tabMsgs) {
  $("#message-list").empty();
  tabMsgs.forEach(function(item) {
    var $li = $("<li></li>");
    $li.append('<div class="meta">' + item.pseudo + ' — ' + date + '</div>');
    $li.append('<div class="text">' + item.msg + '</div>');
    $("#message-list").append($li);
  });
}
```

Cette fonction **efface** d'abord la liste existante, puis **recrée** un `<li>` pour chaque message. On utilise jQuery (`$`) pour simplifier la manipulation du DOM.

#### Toggle thème clair/sombre (§3.3)

```javascript
function toggleTheme() {
  $("body").toggleClass("dark");
}
```

Un simple ajout/retrait de la classe CSS `dark` sur le `<body>` suffit grâce aux variables CSS.

---

## 4. Partie 2 — Micro-service NodeJS

### 4.1 Choix techniques

- **NodeJS** : permet d'exécuter du JavaScript côté serveur
- **Express** : framework minimaliste pour définir des routes HTTP simplement
- **CORS** : middleware qui autorise les requêtes venant d'une autre origine (nécessaire quand le client est hébergé séparément du serveur)

### 4.2 Structure de données côté serveur

Les messages sont stockés dans un **tableau JavaScript en mémoire** :

```javascript
var allMsgs = [
  { msg: "Hello World", pseudo: "Admin", date: "2026-03-25T10:00:00.000Z" },
  ...
];
```

**Avantage** : simple à mettre en œuvre, pas besoin de base de données.
**Inconvénient** : les messages sont **perdus au redémarrage** du serveur. En production, on utiliserait une base de données persistante (SQLite, MongoDB, PostgreSQL...).

Le **numéro d'un message** correspond à son indice dans le tableau. C'est simple mais suffisant pour un prototype.

### 4.3 Routes implémentées

#### Routes de test et compteur

| Route | Description | Exemple de réponse |
|-------|-------------|-------------------|
| `GET /test/:texte` | Renvoie le texte passé en paramètre | `{"msg":"blihblah"}` |
| `GET /cpt/query` | Retourne la valeur du compteur | `{"compteur":6}` |
| `GET /cpt/inc` | Incrémente de 1 | `{"code":0}` |
| `GET /cpt/inc?v=5` | Incrémente de 5 (entier requis) | `{"code":0}` ou `{"code":-1}` |

Pour `/cpt/inc?v=XXX`, on vérifie que `XXX` est bien un entier avec une expression régulière :
```javascript
if (!req.query.v.match(/^-?[0-9]+$/)) return res.json({ code: -1 });
```

#### Routes de gestion des messages

| Route | Description | Exemple de réponse |
|-------|-------------|-------------------|
| `GET /msg/getAll` | Tous les messages | tableau JSON |
| `GET /msg/get/2` | Message n°2 | `{"code":1,"msg":"...","pseudo":"...","date":"..."}` |
| `GET /msg/nber` | Nombre de messages | `3` |
| `GET /msg/post/Bonjour?pseudo=Alice` | Ajoute un message | `{"code":0,"num":3}` |
| `GET /msg/del/2` | Supprime le message n°2 | `{"code":0}` |

**Pourquoi tout en GET ?** Le sujet le précise explicitement : pour faciliter les tests directement depuis la barre d'adresse du navigateur. En production, les ajouts/suppressions utiliseraient les verbes HTTP appropriés (`POST`, `DELETE`).

Les messages contenant des caractères spéciaux (espaces, accents) sont encodés dans l'URL et décodés avec `unescape()` côté serveur.

### 4.4 Connexion client ↔ serveur (AJAX)

Le client utilise `fetch` pour communiquer avec le serveur de façon **asynchrone** (sans recharger la page) :

```javascript
// Au chargement : récupérer tous les messages
fetch(serverUrl + "/msg/getAll")
  .then(function(response) { return response.json(); })
  .then(function(data) { update(data); });

// Au clic sur "Envoyer" : poster un message
fetch(serverUrl + "/msg/post/" + encodedMsg + "?pseudo=" + pseudo)
  .then(function(response) { return response.json(); })
  .then(function() { loadMessages(); }); // Recharger la liste
```

Le mécanisme des **promesses** (`.then()`) permet d'exécuter du code une fois la réponse reçue, sans bloquer le reste de la page.

---

## 5. Déploiement

Le serveur Express sert également les fichiers statiques du client grâce à :

```javascript
app.use(express.static(path.join(__dirname, '../client')));
```

**Pourquoi ce choix ?** Render.com propose un seul service gratuit. En faisant servir le client par le serveur Express, on n'a besoin que d'**un seul déploiement** pour l'application complète. Le client et le serveur partagent la même URL, ce qui évite aussi les problèmes CORS.

Le port est lu depuis la variable d'environnement `process.env.PORT` car render.com l'injecte automatiquement (il ne faut pas hardcoder `3000` en production).

---

## 6. Lancer le projet en local

```bash
# Cloner le repo
git clone https://github.com/faresTMZ/ArchiApp.git
cd ArchiApp

# Installer les dépendances et lancer le serveur
cd server
npm install
npm start

# Ouvrir dans le navigateur
# http://localhost:3000
```
