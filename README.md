# Know Where You Go

Prüfungsaufgabe im Modul "Web-Engineering 2" an der DHBW Ravensburg


von 
- [Henry Schuler](https://github.com/schuler-henry)
- [Florian Herrkommer](https://github.com/Floqueboque) 
- [Florian Glaser](https://github.com/Floskinner)
- [Baldur Siegel](https://github.com/baldur132)
- [Johannes Brandenburger](https://github.com/johannesbrandenburger)
- [David Felder](https://github.com/screetox)
- [Lukas Braun](https://github.com/lukasbraundev)
- [Phillipp Patzelt](https://github.com/PhillippPatzelt)

## Epic

Entwickeln Sie eine Web-Applikation die innerhalb eines Location-Based-Service eine Karte darstellt.
Innerhalb der Karte soll eine Position (oder aktueller Standort) mit ihren Geo-Koordinaten ausgewählt werden können. Über diese Koordinaten soll mittels [Reverse-Geocoding](https://nominatim.org/release-docs/develop/api/Overview/) der Ort ermittelt und über [Wikipedia](https://www.mediawiki.org/wiki/API:Tutorial) die entsprechenden Information zur Örtlichkeit ausgelesen und visualisiert werden.
Anschließend soll die [Fahrroute](https://www.liedman.net/leaflet-routing-machine) von der gegenwärtigen Position zum ausgewählten Ort dargestellt werden.

- Die Web-Applikation soll möglichst gemäß den Vorgaben einer PWA entsprechend (Progressive-WebApplication, mobile first, responsive,...) umgesetzt werden.
- Die App soll über "React/JSX", sowie über ein User Experience (Mobility/UI) wie "Framework7, Ionic oder Material UI" und dessen Standardkomponenten umgesetzt werden. Die Karten sollen über [OpenStreetMap](https://wiki.openstreetmap.org/wiki/DE:Hauptseite)
ggf. [Leaflet](https://leafletjs.com) eingebunden werden.
- Bilden Sie dazu kleine Sprint-Teams (ca. 4-7 Personen pro Sprint-Team) und zerlegen sie die Epic in die entsprechenden User-Stories und Sprints (Produkt-Backlog, Sprint-Backlog), so dass die Teams eine gleichmäßige Auslastung haben.
- Definieren Sie einen Scrum-Master (wenn nötig ggf. ein Team von 2 Personen) der das Produkt-Inkrement kontrolliert und dem Team beim Sprint-Inkrement beratend und unterstützend zur Seite steht, die (online)-Kommunikation untereinander aufrecht erhält, das Ziel ständig kontrolliert und den Product-Owner informiert.
- Die fertige Lösung soll ggf. auf einem GitHub-Repository lauffähig veröffentlicht und auf CD/DVD dem Sekretariat übergeben werden. Der Scrum-Master ist für die vollständige Auslieferung der PWA zum Ende des Vorlesungsquartals oder nach individueller Absprache mit dem Dozenten verantwortlich. 

## Bewertung

- Problemstellung (25%): Nachvollziehbare Darstellung und Abgrenzung der Problemstellung. Ist der Programmentwurf entsprechend der Problemstellung, Detailliertheit und Qualität von allen Kursbeteiligten umgesetzt worden?
- Aufbau (20%): Nachvollziehbarer Aufbau der Arbeit aus der Zielhierarchie. Schlüssigkeit der Struktur/ Methode der eigenen Bearbeitung.
- Gestaltung der Arbeit (20%): Übersichtlichkeit des Programmentwurfs auch
bezüglich: Intuitive Bedienbarkeit, User-Experience, App-Layout, Einheitlichkeit und Qualität der verwendeten Gestaltungselemente.
- Zielhierarchie (15%): Umsetzung des Finalziels sowie Ableitung von Modalzielen zur Erreichung des Finalziels (Scrum: Darstellung der User-Stories & Sprint-Teams).
- Eigenständigkeit (10%): Aufbauend auf die zur Verfügung stehende Quellenarbeit mit ausreichendem Eigenanteil für die Arbeit und Ableitung eigener Erkenntnisse.
- Dokumentation (10%): Ausreichende Dokumentation in den Quelltexten, so dass ein aussenstehender Programmierer die Arbeit übernehmen und darauf aufsetzen kann. [Siehe auch](https://t2informatik.de/blog/softwareentwicklung/dokumentation-im-code-pro-und-contra)