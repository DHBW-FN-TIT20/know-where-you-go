import React from "react";
import { Page, Block, BlockTitle, Link } from "framework7-react";

class Impressum extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Page name="Impressum">
        <Block className="mt-2 mb-1">
          <Link back iconF7="arrow_left" iconSize={20} style={{ fontSize: "20px" }}>
            &nbsp;Zur&uuml;ck
          </Link>
        </Block>
        <Block className="mt-1 mb-1">
          <img src="/img/KWYGLogo.svg" style={{ maxWidth: "100%", transition: "inherit" }}></img>
        </Block>
        <Block strong className="mt-1">
          <p>
            {" "}
            Know-Where-You-Go ist eine Webanwendung, die Ihnen hilft, herauszufinden, wo Sie sind und wohin Sie gehen.
          </p>
          <p>
            Sie basiert auf dem{" "}
            <Link external target="_blank" href="https://www.openstreetmap.org/">
              OpenStreetMap-Projekt
            </Link>{" "}
            und verwendet die{" "}
            <Link external target="_blank" href="https://www.openstreetmap.org/wiki/API">
              OpenStreetMap-API
            </Link>
            , um die Daten zu erhalten.
          </p>
          <p>
            Die Anwendung ist open source und kann auf{" "}
            <Link external target="_blank" href="https://github.com/DHBW-FN-TIT20/know-where-you-go">
              GitHub
            </Link>{" "}
            gefunden werden.
          </p>
          <p>Die App wird von Studenten der DHBW Friedrichshafen entwickelt:</p>
          <ul>
            <li>
              <Link external target="_blank" href="https://github.com/johannesbrandenburger">
                Johannes Brandenburger
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/lukasbraundev">
                Lukas Braun
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/screetox">
                David Felder
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/Floskinner">
                Florian Glaser
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/Floqueboque">
                Florian Herkommer
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/PhillippPatzelt">
                Phillipp Patzelt
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/schuler-henry">
                Henry Schuler
              </Link>
            </li>
            <li>
              <Link external target="_blank" href="https://github.com/baldur132">
                Baldur Siegel
              </Link>
            </li>
          </ul>
        </Block>
        <BlockTitle large>Impressum</BlockTitle>
        <BlockTitle medium>Kontakt</BlockTitle>
        <Block strong>
          <p>Angaben gemäß § 5 TMG</p>
          <p>
            Florian Glaser<br></br>
            Duale Hochschule Baden-Württemberg Ravensburg<br></br>
            Campus Friedrichshafen<br></br>
          </p>
          <p>
            Fallenbrunnen 2<br></br>
            88045 Friedrichshafen<br></br>
            Telefon: +49 751 18999 2700
          </p>
          E-Mail:{" "}
          <Link external target="_blank" href="mailto:glaser.florian-it20@it.dhbw-ravensburg.de">
            {" "}
            glaser.florian-it20@it.dhbw-ravensburg.de
          </Link>
        </Block>
        <BlockTitle medium>Haftungsausschluss</BlockTitle>
        <Block strong>
          <h3>Haftung für Inhalte</h3>
          <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
            Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7
            Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
            10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
            bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
            konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
            Inhalte umgehend entfernen.
          </p>
          <h3>Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
            wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
            Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
            jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </Block>
        <Block className="font-light text-center">&#169; FKW Software Solutions, 2022</Block>
      </Page>
    );
  }
}

export default Impressum;
