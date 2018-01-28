# MasterEtWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.3.

## Angular CLI
### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Project notes
### Organisation
Front-end: Angular 4+, dossier src/app

Back-end: PHP 7+, dossier src/php

Le build se fait avec:
* `ng build`
* `ng build --prod`

Pour dév en local, trois choses à changer:
* [.htaccess](src/.htaccess): changer 3] `RewriteBase /` en `RewriteBase /xxx/yyy/`
avec xxx/yyy/ étant le chemin depuis la racine web
* [index.html](src/index.html): changer 6] `<base href="/">` en `<base href="/xxx/yyy/">`,
pareil qu'au dessus
* [commons.php](src/php/commons.php): changer 5] `define("LOCAL", false);` en `define("LOCAL", true);`
pour activer le mode local. Ne pas oublier de changer les valeurs des constantes pour la connexion à
la BD!

Quelques logiciels à installer:
* [XAMPP](https://www.apachefriends.org/fr/index.html): serveur web + BD
* [IntelliJ IDE](http://www.jetbrains.com/): Des IDE pour dév

Les images/icons: [Font Awesome](https://www.flaticon.com/packs/font-awesome)

### TODO
* Page "News"?
* Fixer style de la page d'accueil, de l'et
* Fixer les couleurs de ev
