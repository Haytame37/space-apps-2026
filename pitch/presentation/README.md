# AYYUR — la présentation (5 minutes)

Une présentation qui est une page web, et non un PowerPoint. Elle marche **sans Internet**, de trois façons :

| Mode | Ce qu'on ouvre | Comment |
|---|---|---|
| **Au clicker** | `index.html` | Chaque clic passe à l'étape suivante, comme un PowerPoint. |
| **Le film, qui défile seul** | `index.html?auto` | **Espace** ou clic : lecture / pause · **→** : +5 s · **←** ou clic droit : −5 s. Durée totale : **5:00**. |
| Ordinateur lent | `index.html?lite` | Moins d'étoiles. Se combine avec les autres : `index.html?auto&lite`. |

Pour ajouter `?auto` ou `?lite`, tapez-le dans la barre d'adresse juste après `index.html`.

La même présentation existe en vidéo MP4 : `../demo/AYYUR-pitch-5min.mp4`.

## Lancer la présentation (Windows)

1. Copiez tout le dossier `presentation` sur l'ordinateur, par exemple sur le Bureau. Gardez tous les sous-dossiers.
2. Double-cliquez sur `index.html` : la présentation s'ouvre dans **Chrome** ou **Edge**.
3. Appuyez sur **F** (ou **F5**) pour passer en plein écran.
4. L'écran reste vide, avec seulement les étoiles : c'est l'écran d'attente. Le premier clic lance la page de garde (l'équipe en orbite autour du croissant AYYUR).

## Avec un projecteur : la vue présentateur

1. Dans Windows, appuyez sur **Win + P** et choisissez **Étendre**.
2. Ouvrez `index.html`, glissez la fenêtre sur l'écran du projecteur, puis appuyez sur **F** pour le plein écran.
3. Appuyez sur **P**. Une deuxième fenêtre s'ouvre : glissez-la sur l'écran de l'ordinateur portable. Si Chrome bloque la fenêtre, autorisez les pop-ups pour ce fichier, puis appuyez de nouveau sur P.
4. La vue présentateur affiche :
   - le texte à dire ;
   - le chronomètre (objectif : 5:00 ; il passe en orange après 5 minutes) ;
   - l'heure ;
   - l'image actuelle et l'image du clic suivant.
5. Le clicker fonctionne dans les deux fenêtres.

## Les touches (mode clicker)

| Touche | Effet |
|---|---|
| Clicker « suivant », → ↓, Page suivante, Espace, Entrée, clic gauche | Clic suivant. Un clic pendant une animation la termine aussitôt, puis continue. |
| Clicker « précédent », ← ↑, Page précédente, Retour arrière, clic droit | Retour (l'animation se joue à l'envers, plus vite). |
| Un numéro puis Entrée, ou **G** | Aller à cette page (le petit numéro en bas à droite). |
| **O** ou Tab | Vue d'ensemble de toutes les pages et de tous les clics. |
| **P** | Vue présentateur. |
| **B** ou `.` / **W** ou `,` | Écran noir / écran blanc. N'importe quelle touche fait revenir l'image. |
| **F** ou F5 | Plein écran. |
| **K** | Testeur de touches : montre ce qu'envoie chaque bouton du clicker. |
| **S** | Mode capture : cache le numéro et la ligne de progression. Capturez ensuite avec **Win + Shift + S**. |
| **H** ou ? | Aide. **Échap** ferme les panneaux. |

Si vous actualisez la page (F5 en dehors du plein écran, ou Ctrl+R), la présentation revient au même clic.

**Avant la présentation**, testez le clicker avec **K** : chaque bouton doit afficher « Next » ou « Back ».

## Le texte à dire (darija)

| Mode | Document |
|---|---|
| Film ou vidéo (temps de 0:00 à 5:00) | `docs/script-video-darija.md` |
| Clicker (clic par clic) | `docs/script-darija.md` |

Les notes de la vue présentateur sont dans `js/notes-darija.js`.

## Les 11 pages (26 clics)

0. Page de garde : l'équipe en orbite autour du croissant AYYUR, qui se change en vraie Lune.
1. Ils sont toujours là : la Lune, ses 10 sites, Mars, l'espace lointain, le nombre 13.
2. Des histoires éparpillées, et ce que demande le défi.
3. Le logo AYYUR et sa phrase.
4. La plateforme : Explorer, globe et chronologie, la chronologie qui fait tourner le globe, le modèle 3D, NASA Eyes.
5. Une histoire : Ingenuity, 5 vols prévus, 72 réalisés.
6. Le coin des explorateurs : Tiziri, puis les 5 jeux.
7. Quatre langues, dont l'arabe de droite à gauche.
8. De l'écran aux vraies mains : les cartes Memory, les livres de coloriage Apollo 11 et Pioneer 10, le modèle économique (prix proposés).
9. Notre règle : sources NASA, faits vérifiés, IA déclarée.
10. Conclusion.

## Ce que contient le dossier

| Fichier | Contenu |
|---|---|
| `index.html` | La page à ouvrir |
| `js/deck.js` | Les pages, les animations et les notes en anglais (le 2e texte de chaque `B.beat(...)`) |
| `js/notes-darija.js` | Les notes du présentateur en darija |
| `js/video-timing.js` | La durée de chaque image dans le film (`?auto` et MP4), une ligne par image, en secondes |
| `js/engine.js`, `js/tools.js` | Le moteur (clicker, `?auto`, `?record` pour enregistrer le MP4) et les outils de présentation |
| `js/globe.js`, `js/background.js` | Les globes NASA qui tournent, le fond étoilé |
| `js/logo.js` | Le logo AYYUR de l'équipe |
| `assets/img/` | Images des globes calculées à partir des modèles 3D NASA, photos NASA, captures du site, pages des livres, photos de l'équipe |
| `assets/fonts/` | Polices (Space Grotesk, Inter, Noto Kufi Arabic) |
| `vendor/gsap.min.js` | La bibliothèque d'animation GSAP 3 |
| `docs/sources.md` | D'où vient chaque information affichée |

Si vous changez une durée dans `js/video-timing.js`, il faut ensuite réenregistrer le MP4.
