## Frontend
Contient le projet partie frontend en Angular 4.0+.

## Backend
Contient le projet partie backend en Php 7.1+.

## Utils
Contient les utilitaires.

## Build & serve
La partie backend doit être servie par Apache avec Php (simple copie
des fichiers dans le dossier backend de sortie).

La partie frontend doit être compilée (via `npm run build`),
puis servie par Apache (après compilation, simple copie des fichiers
du dossier dist dans le dossier frontend de sortie).

Attention: Les fichiers .htaccess doivent être présents et
le module Apache mod_rewriting activé pour l'URL rewriting.

Une organisation de structure des fichiers suivante est conseillée:

* frontend
    * index.html
    * ...
* backend
    * ET
    * EV
    * ...
* .htaccess

## Code
XAMPP
PHP
Angular

### Installer les pré-requis

### Configurer le serveur local
#### Ajout d'un VHost

Ajouter cette partie dans le fichier
C:\xampp\apache\conf\extra\httpd-vhost.conf
```
<VirtualHost *:80>
    DocumentRoot "C:/Users/Kryoxem/public_html/testredir"
    ServerName testredir.test
    ServerAlias www.testredir.test
</VirtualHost>
```
et changer la ligne DocumentRoot avec le chemin vers le projet servi,
changer le ServerName en nom du serveur voulu,
changer l'alias en ajoutant www. puis le ServerName.

#### Local DNS
Ajouter cette partie dans le fichier
C:\Windows\System32\drivers\etc\hosts
```
127.0.0.1         testredir.test
```
et changer le nom du domaine (ici testredir.test) avec le nom
donné dans le fichier de VHost pour Apache.