## Description
Un cours perso est un cours particulier: il est défini par l'utilisateur et ne vient pas de l'emploi
du temps exporté d'ADE.

Un cours perso est défini sur l'échelle d'une semaine et est composé de:
* début (e.g. Mardi 9h00),
* fin (e.g. Mardi 11h30),
* description (e.g. Stage d'enseignement et de recherche),
* nom (e.g. TER),
* *opt:* type (e.g. TP),
* *opt:* professeur (e.g. Alexandre Demeure),
* *opt:* salle/bâtiment (e.g. IMAG).

Donc, celui-ci étant particulier, il s'applique selon différents critères;
* une fois par jour,
* une fois par semaine,
* une toutes les deux semaines,
* tous les mois.

Sinon, un cours perso peut aussi être défini de manière unique. Dans ce cas, il n'y a aucune
récurrence et il ne s'applique qu'une fois aux date de début et de fin données par
l'utilisateur.

Ces cours sont définis par l'utilisateur et ne peuvent pas être exclus de l'emploi
du temps par les exclusions.

Ils s'ajoutent après l'ajout des cours normaux (exportés d'ADE).
