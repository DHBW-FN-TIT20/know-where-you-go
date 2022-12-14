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
          <p>Angaben gem???? ?? 5 TMG</p>
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
          <h3>Haftung f??r Inhalte</h3>
          <p>
            Die Inhalte unserer Seiten wurden mit gr????ter Sorgfalt erstellt. F??r die Richtigkeit, Vollst??ndigkeit und
            Aktualit??t der Inhalte k??nnen wir jedoch keine Gew??hr ??bernehmen. Als Diensteanbieter sind wir gem???? ?? 7
            Abs.1 TMG f??r eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach ???? 8 bis
            10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, ??bermittelte oder gespeicherte fremde
            Informationen zu ??berwachen oder nach Umst??nden zu forschen, die auf eine rechtswidrige T??tigkeit hinweisen.
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
            bleiben hiervon unber??hrt. Eine diesbez??gliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
            konkreten Rechtsverletzung m??glich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
            Inhalte umgehend entfernen.
          </p>
          <h3>Haftung f??r Links</h3>
          <p>
            Unser Angebot enth??lt Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Deshalb k??nnen wir f??r diese fremden Inhalte auch keine Gew??hr ??bernehmen. F??r die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
            wurden zum Zeitpunkt der Verlinkung auf m??gliche Rechtsverst????e ??berpr??ft. Rechtswidrige Inhalte waren zum
            Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
            jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
          <h3>Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Die Vervielf??ltigung, Bearbeitung, Verbreitung und jede Art der Verwertung au??erhalb der
            Grenzen des Urheberrechtes bed??rfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur f??r den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
            die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
            Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
            Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </Block>
        <Block>
          {/* // prettier-ignore */}
          Website Impressum erstellt durch <Link href="https://www.impressum-generator.de">
            impressum-generator.de
          </Link>{" "}
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
