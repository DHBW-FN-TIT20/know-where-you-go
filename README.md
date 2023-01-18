<p align="center">
<img src="design\kwyg-logo-background.svg" alt="Logog"
    style="display: block;
        margin-left: auto;
        margin-right: auto;
        width: 30%;"/>
</p>

<h1 style="text-align: center;"> Know Where You Go </h1>

![Website](https://img.shields.io/website?up_color=green&up_message=online&url=https%3A%2F%2Fknow-where-you-go.de) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/DHBW-FN-TIT20/know-where-you-go)

Know-Where-You-Go ist eine Webanwendung die Ihnen hilft herauszufinden wo Sie sind und wohin Sie gehen.

# &#128270; Features

- Bekomme Informationen über jeden Ort mithilfe von [Wikipedia](https://de.wikipedia.org)
- Anzeigen deines aktuellen Standortes mit reverse geocoding mithilfe von [OpenStreetMap](https://www.openstreetmap.de)
- Lass dir die schnellsten Routen zu einem Ort deiner Wahl zeigen
- Kann auf jedem Endgerät installiert werden
- Selbst ohne Internetzugang kannst du deine letzten Inhalte sehen
- Hoste die Anwendung auf deinem eigenem Server mit Docker 

# &#128051; Deploy mit Docker

Clonen des Repos:
```bash
git clone https://github.com/DHBW-FN-TIT20/know-where-you-go.git
```

Bauen und starten eines eigenen Image:
```bash
# Bauen eines Containers mit dem namen know-where-you-go
cd know-where-you-go
docker build buildx -t know-where-you-go .

# Bei einer alten Docker Version verwende
docker build -t know-where-you-go .

# Starten des Containers
docker run -d --name know-where-you-go know-where-you-go
```

Alternativ mit `docker-compose`:
```bash
cd know-where-you-go
docker compose up -d

# Bei einer alten Docker / docker-compose Version verwende
docker-compose up -d
```

# &#128640; Deploy Manuell 

Ein Pre-Build ist unter [Releases](https://github.com/DHBW-FN-TIT20/know-where-you-go/releases) zu finden.

Entpacke die Datei `release.tar.gz` unter Windows mit 7-Zip oder vergleichbaren.<br/>
Unter Linux kann folgender Befehl eingegeben werden:
```bash
tar -xzvf release.tar.gz
```

Die Daten im Ordner `www` können nun mit einem Beliebigen Server wie z.B. [Apache](https://httpd.apache.org) bereitgestellt werden.

# &#128736; Bauen der Anwendung
Es kann der `www` Ordner auch selbst gebaut werden.

Node Version >= 16 wird vorausgesetzt.<br/>
Eine Anleitung ist hier zu finden: https://nodejs.org/en/

```bash
git clone https://github.com/DHBW-FN-TIT20/know-where-you-go.git
cd know-where-you-go
npm install
npm run build
```

Die Daten befinden sich im Ordner `www`.

# &#129299; Entwickler
 
- [Henry Schuler](https://github.com/schuler-henry)
- [Florian Herrkommer](https://github.com/Floqueboque) 
- [Florian Glaser](https://github.com/Floskinner)
- [Baldur Siegel](https://github.com/baldur132)
- [Johannes Brandenburger](https://github.com/johannesbrandenburger)
- [David Felder](https://github.com/screetox)
- [Lukas Braun](https://github.com/lukasbraundev)
- [Phillipp Patzelt](https://github.com/PhillippPatzelt)

