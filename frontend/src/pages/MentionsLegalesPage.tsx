import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Mentions légales</h1>
        <p className="text-slate-400 text-sm mb-10">Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)</p>

        <Section title="1. Éditeur du site">
          <p><strong>Dénomination sociale :</strong> Cleaning 16</p>
          <p><strong>Forme juridique :</strong> Entreprise individuelle</p>
          <p><strong>SIRET :</strong> 943 904 201 00010</p>
          <p><strong>SIREN :</strong> 943 904 201</p>
          <p><strong>Responsable de la publication :</strong> Mme Adjele AGBEKODO (Présidente)</p>
          <p><strong>Email :</strong> <a href="mailto:topcleaning16@gmail.com" className="text-blue-600 hover:underline">topcleaning16@gmail.com</a></p>
          <p><strong>Téléphone :</strong> <a href="tel:0610854918" className="text-blue-600 hover:underline">06 10 85 49 18</a></p>
          <p><strong>Zone d'intervention :</strong> Nouvelle-Aquitaine & Paris</p>
        </Section>

        <Section title="2. Hébergement">
          <p><strong>Hébergeur :</strong> Railway Inc.</p>
          <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
          <p><strong>Site web :</strong> <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">railway.app</a></p>
        </Section>

        <Section title="3. Propriété intellectuelle">
          <p>
            L'ensemble du contenu de ce site (textes, images, logos, icônes, structure) est la propriété exclusive de Cleaning 16 ou de ses partenaires.
            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est interdite sans autorisation préalable écrite de Cleaning 16.
          </p>
        </Section>

        <Section title="4. Données personnelles">
          <p>
            Les données personnelles collectées sur ce site font l'objet d'un traitement informatique destiné à la gestion des demandes de prestation et à la communication avec les clients.
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition
            aux données vous concernant.
          </p>
          <p>Pour exercer ces droits, contactez : <a href="mailto:topcleaning16@gmail.com" className="text-blue-600 hover:underline">topcleaning16@gmail.com</a></p>
          <p>Pour plus d'informations, consultez notre <Link to="/politique-confidentialite" className="text-blue-600 hover:underline">Politique de confidentialité</Link>.</p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Ce site utilise des cookies strictement nécessaires à son fonctionnement (authentification, session).
            Aucun cookie de traçage ou de publicité n'est utilisé.
            Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
          </p>
        </Section>

        <Section title="6. Limitation de responsabilité">
          <p>
            Cleaning 16 s'efforce d'assurer l'exactitude des informations diffusées sur ce site mais ne peut garantir leur exhaustivité ni leur mise à jour permanente.
            Cleaning 16 ne saurait être tenu responsable de dommages directs ou indirects résultant de l'accès au site ou de l'utilisation de son contenu.
          </p>
        </Section>

        <Section title="7. Droit applicable">
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </Section>

        <div className="mt-10 pt-6 border-t border-slate-100 text-sm text-slate-400">
          <Link to="/" className="text-blue-600 hover:underline">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-2 text-slate-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
