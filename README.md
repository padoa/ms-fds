# ms-fds

Microservice de gestion des FDS

## Prequisites

Installer les librairies suivantes à l'aide de `brew`

```bash
brew install gs graphicsmagick
```

## Init project

### Submodules

Initialiser le submodule ci-tools

```bash
git submodule init && git submodule update
```

Ou utiliser
```bash
git submodule foreach --recursive git reset --hard && git submodule update --init --recursive
```

### Node modules

Installer les dépendances du projet
```bash
npm run yarn
```

## Use project

### Serve

#### Serve depuis ms-fds

Utiliser la commande suivante
```bash
npm run start:dev
```

#### Mode debug

Le mode debug permet d'afficher les requêtes SQL :
```bash
npm run start:debug
```

### Dev dataset referential

Pour avoir un jeu de données de dev, il faut lancer
```bash
npm run init-data
```

### Lancer les tests unitaires

Pour lancer les TU, il faut utiliser la commande :
```bash
npm run test
```

### Modifier une table

Si vous devez ajouter/modifier/supprimer une table ou une colonne, il faut faire une migration.
Pour cela, lancer `npm run migration:create {nom du fichier}`
Un fichier sera créé dans `ms-fds/src/migrations`

Pour tester la migration, il faut :
- Lancer `npm run init-data` AVANT la création du fichier (ou le déplacer temporairement hors du répertoire `migrations`, lancer l'init-data et remettre le fichier à sa place)
- Lancer `npm run migrate` pour lancer la migration ⚠️ ATTENTION en cas d'ajout de colonne, il faut penser à la remplir dans le script de migration.
