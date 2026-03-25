/* ============================================================
   PARTIE 1 — Fonctions JS de base
   ============================================================ */

// 3.1 — Factorielle
function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}
console.log("fact(6) =", fact(6)); // 720

// 3.1 — Applique : applique f à chaque élément de tab
function applique(f, tab) {
  var result = [];
  for (var i = 0; i < tab.length; i++) {
    result.push(f(tab[i]));
  }
  return result;
}

console.log("applique(fact, [1..6]) =", applique(fact, [1, 2, 3, 4, 5, 6]));
console.log("applique(n+1, [1..6]) =", applique(function(n) { return n + 1; }, [1, 2, 3, 4, 5, 6]));

/* ============================================================
   PARTIE 1 — Données et mise à jour de la page
   ============================================================ */

// 3.2 — Structure des messages (avec méta-données : pseudo + date)
var msgs = [
  { "msg": "Bienvenue sur le Message Board !", "pseudo": "Admin", "date": "2026-03-25T10:00:00" },
  { "msg": "Ceci est un message de test.",      "pseudo": "Alice",  "date": "2026-03-25T10:05:00" },
  { "msg": "Bonjour tout le monde !",           "pseudo": "Bob",    "date": "2026-03-25T10:10:00" },
  { "msg": "NodeJS c'est super.",               "pseudo": "Carol",  "date": "2026-03-25T10:15:00" },
  { "msg": "CentraleSupélec Forever.",          "pseudo": "Dave",   "date": "2026-03-25T10:20:00" }
];

// 3.2 / 3.2 — Efface la liste et recrée les <li> depuis le tableau
function update(tabMsgs) {
  var $list = $("#message-list");
  $list.empty();

  if (!tabMsgs || tabMsgs.length === 0) {
    $list.append('<li class="empty">Aucun message pour l\'instant.</li>');
    return;
  }

  tabMsgs.forEach(function(item) {
    var pseudo = item.pseudo || "Anonyme";
    var date   = item.date ? new Date(item.date).toLocaleString("fr-FR") : "";
    var texte  = item.msg || "";

    var $li = $("<li></li>");
    $li.append('<div class="meta">' + pseudo + ' — ' + date + '</div>');
    $li.append('<div class="text">' + texte + '</div>');
    $list.append($li);
  });
}

/* ============================================================
   PARTIE 2 — AJAX : communication avec le micro-service
   ============================================================ */

function getServerUrl() {
  var val = $("#server-url").val().replace(/\/$/, "");
  // Si vide, on utilise l'origine de la page (même serveur)
  if (!val) return window.location.origin;
  return val;
}

// Charge tous les messages depuis le serveur et met à jour la page
function loadMessages() {
  var url = getServerUrl() + "/msg/getAll";
  fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      // data est un tableau d'objets { msg, pseudo, date }
      msgs = data;
      update(msgs);
    })
    .catch(function(err) {
      console.warn("Impossible de contacter le serveur :", err);
      // Fallback sur les données locales
      update(msgs);
    });
}

// Poste un nouveau message via le micro-service
function postMessage(texte, pseudo) {
  var encodedMsg    = encodeURIComponent(texte);
  var encodedPseudo = encodeURIComponent(pseudo);
  var url = getServerUrl() + "/msg/post/" + encodedMsg + "?pseudo=" + encodedPseudo;

  fetch(url)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      console.log("Message posté, numéro :", data.num);
      loadMessages(); // Recharge la liste
    })
    .catch(function(err) {
      console.error("Erreur lors du post :", err);
    });
}

/* ============================================================
   PARTIE 1 — Thème clair / sombre
   ============================================================ */

function toggleTheme() {
  $("body").toggleClass("dark");
  if ($("body").hasClass("dark")) {
    $("#theme-toggle").text("Mode clair");
  } else {
    $("#theme-toggle").text("Mode sombre");
  }
}

/* ============================================================
   Initialisation au chargement de la page
   ============================================================ */

$(document).ready(function() {

  // Chargement initial des messages
  loadMessages();

  // Bouton "Mettre à jour"
  $("#btn-refresh").on("click", function() {
    loadMessages();
  });

  // Bouton "Envoyer"
  $("#btn-send").on("click", function() {
    var texte  = $("textarea#message-input").val().trim();
    var pseudo = $("#pseudo-input").val().trim() || "Anonyme";

    if (!texte) {
      alert("Le message ne peut pas être vide.");
      return;
    }

    postMessage(texte, pseudo);
    $("textarea#message-input").val(""); // Vider le champ
  });

  // Bouton toggle thème
  $("#theme-toggle").on("click", function() {
    toggleTheme();
  });
});
