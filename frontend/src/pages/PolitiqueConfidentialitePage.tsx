import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Politique de confidentialité</h1>
        <p className="text-slate-400 text-sm mb-10">
          Dernière mise à jour : mars 2026 — Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés
        </p>

        <Section title="1. Responsable du traitement">
          <p><strong>Cleaning 16</strong> — SIRET 943 904 201 00010</p>
          <p>Représentée par Mme Adjele AGBEKODO (Présidente)</p>
          <p>Contact : <a href="mailto:topcleaning16@gmail.com" className="text-blue-600 hover:underline">topcleaning16@gmail.com</a></p>
        </Section>

        <Section title="2. Données collectées et finalités">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 border border-slate-200 font-semibold text-slate-700">Données</th>
                <th className="text-left p-3 border border-slate-200 font-semibold text-slate-700">Finalité</th>
                <th className="text-left p-3 border border-slate-200 font-semibold text-slate-700">Base légale</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr>
                <td className="p-3 border border-slate-200">Nom, prénom</td>
                <td className="p-3 border border-slate-200">Identification du client, gestion de la prestation</td>
                <td className="p-3 border border-slate-200">Exécution du contrat</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 border border-slate-200">Adresse email</td>
                <td className="p-3 border border-slate-200">Envoi de confirmations et documents</td>
                <td className="p-3 border border-slate-200">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200">Numéro de téléphone</td>
                <td className="p-3 border border-slate-200">Contact pour organiser la prestation</td>
                <td className="p-3 border border-slate-200">Exécution du contrat</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 border border-slate-200">Adresse du chantier</td>
                <td className="p-3 border border-slate-200">Réalisation de la prestation</td>
                <td className="p-3 border border-slate-200">Exécution du contrat</td>
              </tr>
              <tr>
                <td className="p-3 border border-slate-200">Mot de passe (hashé)</td>
                <td className="p-3 border border-slate-200">Authentification à l'espace client</td>
                <td className="p-3 border border-slate-200">Intérêt légitime (sécurité)</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 border border-slate-200">Historique des commandes</td>
                <td className="p-3 border border-slate-200">Suivi des prestations, facturation</td>
                <td className="p-3 border border-slate-200">Obligation légale (5 ans)</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="3. Durée de conservation">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Données de commande et facturation :</strong> 5 ans (obligation légale comptable)</li>
            <li><strong>Compte client :</strong> 3 ans après la dernière connexion ou activité</li>
            <li><strong>Données de contact (sans achat) :</strong> 1 an</li>
            <li><strong>Logs de connexion :</strong> 1 an (sécurité)</li>
          </ul>
        </Section>

        <Section title="4. Destinataires des données">
          <p>Vos données sont traitées par les sous-traitants suivants, dans le cadre strict de leur mission :</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Railway Inc.</strong> (hébergement des données) — États-Unis, couvert par les clauses contractuelles types UE</li>
            <li><strong>Brevo SAS</strong> (envoi d'emails transactionnels) — France, conforme RGPD</li>
          </ul>
          <p className="mt-2">Aucune donnée n'est vendue ou partagée à des fins commerciales.</p>
        </Section>

        <Section title="5. Vos droits">
          <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Droit d'accès</strong> (art. 15) : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> (art. 16) : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> (art. 17) : supprimer vos données («&nbsp;droit à l'oubli&nbsp;»)</li>
            <li><strong>Droit à la portabilité</strong> (art. 20) : recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition</strong> (art. 21) : vous opposer à un traitement</li>
            <li><strong>Droit à la limitation</strong> (art. 18) : limiter l'utilisation de vos données</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, envoyez un email à{' '}
            <a href="mailto:topcleaning16@gmail.com" className="text-blue-600 hover:underline">topcleaning16@gmail.com</a>{' '}
            avec une copie de votre pièce d'identité. Nous répondrons dans un délai d'1 mois.
          </p>
          <p className="mt-2">
            En cas de réponse insatisfaisante, vous pouvez déposer une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CNIL</a>.
          </p>
        </Section>

        <Section title="6. Cookies et traceurs">
          <p>Ce site utilise uniquement des cookies techniques <strong>strictement nécessaires</strong> à son fonctionnement :</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Token d'authentification :</strong> maintien de la session client ou admin (durée : session ou 7 jours)</li>
          </ul>
          <p className="mt-2">
            Aucun cookie publicitaire, de suivi ou d'analyse (Google Analytics, etc.) n'est déposé sur ce site.
            Aucun consentement supplémentaire n'est donc requis pour ces cookies (exemption CNIL).
          </p>
        </Section>

        <Section title="7. Sécurité">
          <p>
            Cleaning 16 met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            chiffrement des mots de passe (bcrypt), transmission sécurisée (HTTPS), accès restreint par authentification JWT,
            hébergement sur infrastructure sécurisée.
          </p>
        </Section>

        <Section title="8. Modifications">
          <p>
            Cette politique peut être mise à jour à tout moment. La date de dernière mise à jour est indiquée en haut de page.
            En cas de modification substantielle, vous serez informé par email si vous disposez d'un compte client.
          </p>
        </Section>

        <div className="mt-10 pt-6 border-t border-slate-100 text-sm text-slate-400">
          <Link to="/" className="text-blue-600 hover:underline">← Retour à l'accueil</Link>
          {' · '}
          <Link to="/mentions-legales" className="text-blue-600 hover:underline">Mentions légales</Link>
          {' · '}
          <Link to="/cgv" className="text-blue-600 hover:underline">CGV</Link>
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
