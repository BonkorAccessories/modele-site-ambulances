AIDE-MÉMOIRE — ADAPTER LE MODÈLE « AMBULANCES HORIZON » À UN NOUVEAU CLIENT
===========================================================================

Ce fichier est À CÔTÉ du dossier du site : il ne sera jamais mis en ligne.

Méthode : travaillez sur une COPIE du dossier "Modele-Ambulances".
Ouvrez chaque fichier avec un éditeur de texte (Bloc-notes, VS Code…),
faites "Rechercher" (Ctrl+F) ou "Remplacer" (Ctrl+H) avec le texte exact
indiqué entre guillemets ci-dessous, et remplacez TOUTES les occurrences.
Les 4 fichiers à modifier :
  - index.html                (la page d'accueil)
  - mentions-legales.html     (mentions légales et confidentialité)
  - presentation/index.html   (le diaporama de présentation)
  - js/main.js                (une seule ligne, voir point 6)
Ne touchez PAS au dossier js/vendor/.


1. NOM DE LA SOCIÉTÉ
--------------------
Chercher : "Ambulances Horizon"
  -> index.html, mentions-legales.html, presentation/index.html, js/main.js
Chercher aussi "Horizon" seul (le diaporama l'écrit en deux morceaux :
"Ambulances<br><span class="grad">Horizon</span>" et la grande diapo
contact "<div class="big in">Horizon</div>").
  -> presentation/index.html

2. NOM COURT DU LOGO + « 94 »
-----------------------------
Chercher : "Horizon<b>94</b>"
  -> index.html (2 fois : en-tête et pied de page), mentions-legales.html (1 fois)
  Le mot = nom court du client, le chiffre en gras = son département.

3. LE « 94 » DES COMPTEURS ET DU DÉPARTEMENT
--------------------------------------------
Chercher : data-count="94"   -> index.html (compteur animé "Ancrés dans le Val-de-Marne")
Chercher : "(94)"            -> index.html (title) et mentions-legales.html (meta description)
Chercher : "Val-de-Marne"    -> index.html, presentation/index.html
  (remplacer par le département du client, ex. "Essonne")
Chercher : "Île-de-France"   -> index.html, mentions-legales.html
  (seulement si le client est dans une autre région ; dans les mentions
   légales c'est l'ARS de la région)

4. ADRESSE, CODE POSTAL, VILLE
------------------------------
Chercher : "10 avenue des Lilas"
  -> index.html, mentions-legales.html, presentation/index.html, js/main.js
Chercher : "94000"
  -> index.html, mentions-legales.html, presentation/index.html
Chercher : "Créteil"
  -> index.html (texte d'accueil, à propos, engagement "Basés à Créteil",
     zone d'intervention, bandeau des communes, adresse, title, description)
  -> mentions-legales.html (adresse, "RCS Créteil" = ville du greffe du client)
  -> presentation/index.html
  -> js/main.js (titre de la carte)

5. CARTE GOOGLE MAPS (adresse encodée)
--------------------------------------
Chercher : "Cr%C3%A9teil+94000"   -> index.html (2 fois)
  Remplacer par l'adresse du client écrite ainsi : espaces -> "+",
  accents encodés (é = %C3%A9, è = %C3%A8, ê = %C3%AA, à = %C3%A0, ô = %C3%B4,
  ç = %C3%A7, apostrophe = %27).
  Exemple : "12 rue de l'Église 91000 Évry" ->
            "12+rue+de+l%27%C3%89glise+91000+%C3%89vry"  (É = %C3%89)

6. TÉLÉPHONE (2 formats différents !)
-------------------------------------
Format affiché — chercher : "01 99 00 12 34"
  -> index.html, mentions-legales.html, presentation/index.html
Format lien d'appel — chercher : "+33199001234"
  -> index.html (4 fois), mentions-legales.html (1 fois)
  Règle : on enlève le premier 0 et les espaces, on met +33 devant.
  Exemple : 01 69 12 34 56 -> +33169123456

7. E-MAIL
---------
Chercher : "contact@exemple.com"
  -> index.html, mentions-legales.html (apparaît 2 fois par ligne :
     dans le lien "mailto:" et dans le texte visible)

8. COMMUNES DU BANDEAU DÉFILANT
-------------------------------
Fichier : index.html, chercher : "Communes desservies"
Juste en dessous, 2 lignes de communes :
  - ligne 1 : <span>Créteil</span><span>Maisons-Alfort</span>…
  - ligne 2 : la MÊME liste, avec aria-hidden="true" sur chaque commune
Remplacer les noms dans les DEUX lignes, dans le même ordre, sans doublon.
Garder environ 10 communes autour du siège du client.

9. ZONE D'INTERVENTION
----------------------
Fichier : index.html, chercher : "Zone d'intervention"
  Texte actuel : "Créteil et l'ensemble du Val-de-Marne, Paris et toute
  l'Île-de-France. Longues distances sur demande."

10. CHAMPS ORANGE À COMPLÉTER (mentions légales)
-----------------------------------------------
Fichier : mentions-legales.html, chercher : class="todo"
Chaque champ entre crochets [ … ] est à remplir avec l'info du client :
  forme juridique, capital, SIRET, n° RCS, n° TVA, directeur de la
  publication et sa fonction, n° d'agrément ARS, conventionnement CPAM,
  nom / adresse / téléphone de l'hébergeur, prestataire d'envoi du
  formulaire, date de mise en ligne.
Une fois rempli, enlever la balise orange : remplacer
  <span class="todo">[SIRET 14 chiffres…]</span>  par juste le texte.
Vérifier qu'il ne reste plus aucun "class="todo"" dans le fichier.

11. TITRES ET DESCRIPTIONS GOOGLE (title / meta description)
------------------------------------------------------------
Chercher : "<title>" et "meta name="description""
  -> index.html, mentions-legales.html, presentation/index.html
  Ils contiennent nom, ville et département : à adapter (déjà couvert
  par les points 1, 3 et 4, mais relire pour que la phrase reste correcte).

12. PRÉSENTATION (diaporama)
----------------------------
Fichier : presentation/index.html
  - diapo 1 : "Ambulances<br><span class="grad">Horizon</span>" et
    "Créteil, Val-de-Marne"
  - diapo 2 : "Installée au 10 avenue des Lilas à Créteil"
  - diapo 9 (contact) : "<div class="big in">Horizon</div>", l'adresse
    et "01 99 00 12 34"

13. TEXTES À FAIRE VALIDER PAR LE CLIENT
----------------------------------------
Ces phrases sont génériques mais engagent la société, à faire confirmer :
  "24h/24", "7j/7", "Défibrillateur", "Climatisation", "Tiers payant",
  "deux ambulanciers diplômés", "Des véhicules récents".


AVANT LA VRAIE MISE EN LIGNE
============================
A. Retirer le blocage Google (noindex) : supprimer la ligne contenant
   "noindex" dans index.html, mentions-legales.html et presentation/index.html.
B. Brancher le formulaire : aujourd'hui il ne fait qu'afficher un message,
   aucune demande n'est envoyée. Il faut le relier à un service d'envoi
   (Formspree, Netlify Forms…) et l'indiquer dans les mentions légales
   (champ "prestataire d'envoi du formulaire").
C. Vérification finale : il ne doit rester AUCUNE ancienne valeur fictive.
   Dans PowerShell, placez-vous dans le dossier du site du client puis lancez :

   Get-ChildItem -Recurse -Include *.html,*.js -Exclude *.min.js | Select-String -Pattern "Horizon","Lilas","Créteil","Cr%C3%A9teil","94000","01 99 00 12 34","33199001234","exemple.com","class=""todo"""

   (ou, dans Git Bash :
    grep -rnE "Horizon|Lilas|Créteil|Cr%C3%A9teil|94000|01 99 00 12 34|33199001234|exemple\.com|class=\"todo\"" --include=*.html --include=*.js --exclude-dir=vendor .)

   Si la commande n'affiche rien : tout est remplacé.
   (Si le client est vraiment à Créteil, "Créteil" peut rester, bien sûr.)
