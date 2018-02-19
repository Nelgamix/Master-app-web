<?php

// Partie commune
define("DEBUG", false); // print debug messages
define("DEBUGWEB", false); // if debug = true, then all debug messages will be formatted as html
define("TRUEOUTPUT", true); // show final result?
define("LOCAL", true); // local installation?

// Evenements infos
define("SERVERNAME", "skysurfoatnico.mysql.db");
define("DBNAME", "skysurfoatnico");
define("USERNAME", "skysurfoatnico");
define("PASSWORD", "eE80fdNQ");

// Don't change this
define("LOCALDB", "mysql:host=localhost;dbname=" . DBNAME); // adresse bd locale
define("WEBDB", "mysql:host=" . SERVERNAME . ";dbname=" . DBNAME); // adresse bd distante
define("DB", (LOCAL ? LOCALDB : WEBDB)); // define db selon local ou pas

// Partie EV
// Les mots de passe disponibles
define("ADMINMDP", [
    "mdptest",
    "loictest"
]);

// Partie ET
define("ADEURL", "https://ade6-ujf.grenet.fr/direct/index.jsp?resources=9756&projectId=2&data=1d04874d83cdeb532b5be82d6dc7b4928036957750ce9817205161f6e22f6829f9355e402da57010f6819307ed738001824027a8904c9a5cef6f1a28ea35c418c025f5e16438a90e7406158408bd7b08");
define("URLTIMEOUT", 5); // request timeout before considering that ADE is down
define("REFRESHINTERVAL", 2 * 60); // Refresh ical each REFRESHINTERVAL minutes
define("FLUSHICAL", false);
define("ADEICALURL", "http://ade6-ujf-ro.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=9756&projectId=2&calType=ical&firstDate=%s&lastDate=%s");
