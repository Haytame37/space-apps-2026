# Pitch AYYUR — 5 minutes devant le jury

Ce dossier contient tout ce qu'il faut pour présenter AYYUR. Il est séparé du site : il n'est pas mis en ligne sur Vercel.

## Démo de 30 secondes (formulaire de soumission)

`demo/AYYUR-demo-30s.mp4` : film muet de 29,7 s en anglais, avec sous-titres, qui se termine sur **ayyuur.vercel.app**. Source : `demo-30s/`.

Le règlement demande un **lien public, sans mot de passe ni connexion** : mettre la vidéo sur YouTube en « Non répertoriée » (ou sur Google Drive en « Tous les utilisateurs disposant du lien »), puis vérifier le lien dans une fenêtre de navigation privée.

## Que choisir le jour J ?

| Situation | Ce qu'on ouvre | Comment |
|---|---|---|
| **On parle pendant que la vidéo tourne** (recommandé) | `demo/AYYUR-pitch-5min.mp4` | Ouvrir avec VLC ou Films et TV, plein écran, lancer en disant « Salam ». |
| Pas de lecteur vidéo, ou on veut le même film dans le navigateur | `presentation-video/index.html?auto` | Chrome ou Edge → **F** (plein écran) → **Espace** pour lancer ou mettre en pause. |
| On veut avancer soi-même, au clicker | `presentation/index.html` | Chrome ou Edge → **F** → chaque clic passe à l'étape suivante. **P** ouvre la vue présentateur. |

Tout marche **sans Internet** : il suffit de copier le dossier `pitch` en entier.

## Le texte à dire (darija)

| Version | Document |
|---|---|
| Vidéo (temps de 0:00 à 5:00) | `presentation-video/docs/script-video-darija.md` |
| Clicker (clic par clic) | `presentation/docs/script-darija.md` |

Les chiffres en **gras** doivent être dits exactement. Le reste se dit avec ses propres mots.

## Ce que montre la présentation

1. **L'équipe** en orbite autour du croissant AYYUR (version vidéo seulement).
2. **Les machines toujours là** : la Lune et ses 10 sites, Mars et ses 8 sites, l'espace lointain. 13 machines.
3. **Le problème** : des histoires éparpillées ; le défi demande de les raconter aux enfants.
4. **AYYUR** et sa phrase : *Some machines stopped working. Their stories never did.*
5. **La preuve** : la plateforme en vrai (globe, chronologie, modèle 3D NASA, NASA Eyes dans le site).
6. **Une histoire** : Ingenuity, 5 vols prévus, 72 réalisés.
7. **Les enfants** : Tiziri et les jeux.
8. **4 langues**, dont l'arabe de droite à gauche.
9. **La réalité** : cartes Memory, livres de coloriage Apollo 11 et Pioneer 10, modèle économique (prix proposés, alignés sur `docs/BUSINESS.md`).
10. **Notre règle** : 37 sources NASA, IA déclarée.

## À ne pas oublier en parlant

- Les **dessins des livres** et le **logo** ont été faits avec l'IA : le dire.
- Les **prix sont des propositions** : rien n'est encore en vente, le paiement n'est pas branché.
- Les positions dans l'espace lointain sont **symboliques**.

## Pour modifier

- **Textes, animations, notes du présentateur** : `js/deck.js` et `js/notes-darija.js` de chaque version.
- **Durée de chaque image de la vidéo** : `presentation-video/js/video-timing.js`. Après un changement, la vidéo MP4 doit être réenregistrée.
- **Sources de chaque chiffre** : `docs/sources.md` de chaque version.
