import React from "react";
import { Page, Block, BlockTitle, Link } from "framework7-react";

class Impressum extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Page name="Impressum">
        <Link back iconOnly iconF7="arrow_left"></Link>
        <BlockTitle>
          <h1>About Know-Where-You-Go</h1>
        </BlockTitle>
        <Block strong>
          <p>
            {" "}
            Know-Where-You-Go ist eine Webanwendung, die Ihnen hilft, herauszufinden, wo Sie sind und wohin Sie gehen.
          </p>
          <p>
            Es basiert auf dem <Link href="https://www.openstreetmap.org/">OpenStreetMap-Projekt</Link> und verwendet
            die <Link href="https://www.openstreetmap.org/">OpenStreetMap-API</Link>, um die Daten zu erhalten.
          </p>
          <p>
            Die Anwendung ist open source und kann auf{" "}
            <Link href="https://github.com/DHBW-FN-TIT20/know-where-you-go">GitHub</Link> gefunden werden.
          </p>
          <p>Die App wird von Studenten der DHBW Friedrichshafen entwickelt:</p>
          <ul>
            <li>
              <Link href="https://github.com/baldur132">Baldur Siegel</Link>
            </li>
            <li>
              <Link href="https://github.com/schuler-henry">Henry Schuler</Link>
            </li>
            <li>
              <Link href="https://github.com/Floqueboque">Florian Herkommer</Link>
            </li>
            <li>
              <Link href="https://github.com/Floskinner">Florian Glaser</Link>
            </li>
            <li>
              <Link href="https://github.com/johannesbrandenburger">Johannes Brandenburger</Link>
            </li>
            <li>
              <Link href="https://github.com/screetox">David Felder</Link>
            </li>
            <li>
              <Link href="https://github.com/lukasbraundev">Lukas Braun</Link>
            </li>
            <li>
              <Link href="https://github.com/PhillippPatzelt">Phillipp Patzelt</Link>
            </li>
          </ul>
        </Block>
        <BlockTitle>
          <h1>Impressum</h1>
        </BlockTitle>
        <BlockTitle>
          <h2>Kontakt</h2>
        </BlockTitle>
        <Block strong>
          <p>Angaben gemäß § 5 TMG</p>
          <p>
            Florian Glaser<br></br>
          </p>
          <p>
            Fallenbrunnen 2<br></br>
            88045 Friedrichshafen<br></br>
            Telefon: 49-123456789
          </p>
          E-Mail:{" "}
          <a href="mailto: glaser.florian-it20@it.dhbw-ravensburg.de">glaser.florian-it20@it.dhbw-ravensburg.de</a>
        </Block>
        <BlockTitle>
          <h2>Haftungsausschluss:</h2>
        </BlockTitle>
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
          <h3>Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
            die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
            Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
            Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </Block>
        <Block>
          Website Impressum erstellt durch <Link href="https://www.impressum-generator.de">impressum-generator.de</Link>{" "}
          von der{" "}
          <Link href="https://www.kanzlei-hasselbach.de/" rel="nofollow">
            Kanzlei Hasselbach
          </Link>
        </Block>
      </Page>
    );
  }
}

export default Impressum;
