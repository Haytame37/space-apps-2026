# Pitch AYYUR — 5 minutes devant le jury

Ce dossier contient tout ce qu'il faut pour présenter AYYUR. Il est séparé du site : il n'est pas mis en ligne sur Vercel.

```
pitch/
├── demo/AYYUR-pitch-5min.mp4   la vidéo de 5 minutes (1080p, 30 fps)
└── presentation/               la présentation web : clicker, film automatique, vue présentateur
```

## Que choisir le jour J ?

| Situation | Ce qu'on ouvre | Comment |
|---|---|---|
| **On parle pendant que la vidéo tourne** (recommandé) | `demo/AYYUR-pitch-5min.mp4` | Ouvrir avec VLC ou Films et TV, plein écran, lancer en disant « Salam ». |
| Pas de lecteur vidéo, ou on veut le même film dans le navigateur | `presentation/index.html?auto` | Chrome ou Edge → **F** (plein écran) → **Espace** pour lancer ou mettre en pause. |
| On veut avancer soi-même, au clicker | `presentation/index.html` | Chrome ou Edge → **F** → chaque clic passe à l'étape suivante. **P** ouvre la vue présentateur. |

Tout marche **sans Internet** : il suffit de copier le dossier `pitch` en entier. Le mode d'emploi complet (touches, projecteur, vue présentateur) est dans [`presentation/README.md`](presentation/README.md).

## Le texte à dire (darija)

| Mode | Document |
|---|---|
| Vidéo ou film automatique (temps de 0:00 à 5:00) | `presentation/docs/script-video-darija.md` |
| Clicker (clic par clic) | `presentation/docs/script-darija.md` |

Les chiffres en **gras** doivent être dits exactement. Le reste se dit avec ses propres mots.

## Ce que montre la présentation

1. **L'équipe** en orbite autour du croissant AYYUR.
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

- **Textes, animations, notes du présentateur** : `presentation/js/deck.js` et `presentation/js/notes-darija.js`.
- **Durée de chaque image du film** : `presentation/js/video-timing.js`. Après un changement, la vidéo MP4 doit être réenregistrée.
- **Sources de chaque chiffre** : `presentation/docs/sources.md`.
