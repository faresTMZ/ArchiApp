const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Autorise les requêtes cross-origin
app.use(cors());

// Sert les fichiers statiques du client (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, '../client')));

/* ============================================================
   Section 2.2 — Route /test/*
   ============================================================ */

app.get('/test/*', function(req, res) {
  // req.url = "/test/blihblah" → on extrait ce qui suit "/test/"
  var part = req.url.substr('/test/'.length);
  res.json({ msg: part });
});

/* ============================================================
   Section 2.3 — Compteur avec état
   ============================================================ */

var compteur = 0;

// GET /cpt/query — retourne la valeur du compteur
app.get('/cpt/query', function(req, res) {
  res.json({ compteur: compteur });
});

// GET /cpt/inc[?v=XXX] — incrémente le compteur
app.get('/cpt/inc', function(req, res) {
  if (req.query.v !== undefined) {
    // Vérifier que v est bien un entier
    if (!req.query.v.match(/^-?[0-9]+$/)) {
      return res.json({ code: -1 });
    }
    compteur += parseInt(req.query.v);
  } else {
    compteur += 1;
  }
  res.json({ code: 0 });
});

/* ============================================================
   Section 2.4 — Micro-service de gestion de messages
   ============================================================ */

// Stockage des messages en mémoire
// Chaque message : { msg, pseudo, date }
var allMsgs = [
  { msg: "Hello World",           pseudo: "Admin", date: new Date("2026-03-25T10:00:00").toISOString() },
  { msg: "foobar",                pseudo: "Alice", date: new Date("2026-03-25T10:05:00").toISOString() },
  { msg: "CentraleSupelec Forever", pseudo: "Bob", date: new Date("2026-03-25T10:10:00").toISOString() }
];

// GET /msg/get/:num — retourne un message par son numéro
app.get('/msg/get/*', function(req, res) {
  var part = req.url.substr('/msg/get/'.length);
  var num  = parseInt(part);

  if (isNaN(num) || num < 0 || num >= allMsgs.length) {
    return res.json({ code: 0 });
  }
  res.json({ code: 1, msg: allMsgs[num].msg, pseudo: allMsgs[num].pseudo, date: allMsgs[num].date });
});

// GET /msg/getAll — retourne tous les messages
app.get('/msg/getAll', function(req, res) {
  res.json(allMsgs);
});

// GET /msg/nber — retourne le nombre de messages
app.get('/msg/nber', function(req, res) {
  res.json(allMsgs.length);
});

// GET /msg/post/:message[?pseudo=xxx] — ajoute un message
app.get('/msg/post/*', function(req, res) {
  var part   = req.url.substr('/msg/post/'.length).split('?')[0];
  var texte  = unescape(part);
  var pseudo = req.query.pseudo ? unescape(req.query.pseudo) : "Anonyme";

  if (!texte) {
    return res.json({ code: -1 });
  }

  var nouveau = {
    msg:    texte,
    pseudo: pseudo,
    date:   new Date().toISOString()
  };

  allMsgs.push(nouveau);
  var num = allMsgs.length - 1;
  console.log("Nouveau message [" + num + "] de " + pseudo + " : " + texte);
  res.json({ code: 0, num: num });
});

// GET /msg/del/:num — efface un message par son numéro
app.get('/msg/del/*', function(req, res) {
  var part = req.url.substr('/msg/del/'.length);
  var num  = parseInt(part);

  if (isNaN(num) || num < 0 || num >= allMsgs.length) {
    return res.json({ code: -1 });
  }

  allMsgs.splice(num, 1);
  res.json({ code: 0 });
});

/* ============================================================
   Démarrage du serveur
   ============================================================ */

app.listen(PORT, function() {
  console.log("App listening on port " + PORT + "...");
  console.log("Routes disponibles :");
  console.log("  GET /test/*");
  console.log("  GET /cpt/query");
  console.log("  GET /cpt/inc[?v=XXX]");
  console.log("  GET /msg/get/:num");
  console.log("  GET /msg/getAll");
  console.log("  GET /msg/nber");
  console.log("  GET /msg/post/:message[?pseudo=xxx]");
  console.log("  GET /msg/del/:num");
});
