import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🧹</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Conditions Générales de Vente</h1>
                <p className="text-slate-500 text-sm">LumiNett — Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 1 — Objet et champ d'application</h2>
              <p className="text-sm leading-relaxed">Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des relations contractuelles entre <strong>LumiNett</strong> (ci-après « le Prestataire ») et toute personne physique ou morale (ci-après « le Client ») ayant recours à ses services de nettoyage professionnel. Toute commande ou signature d'un devis implique l'acceptation pleine et entière des présentes CGV.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 2 — Prestations proposées</h2>
              <p className="text-sm leading-relaxed mb-3">LumiNett propose les services suivants :</p>
              <ul className="space-y-1.5 text-sm">
                {[
                  'Nettoyage de conteneurs et bacs à ordures',
                  'Ménage à domicile (appartements et maisons)',
                  'Entretien de bureaux et locaux professionnels',
                  'Nettoyage après travaux et remise en état',
                  'Lavage de vitres et nettoyage de façades',
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>{s}</li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed mt-3">Les prestations peuvent être ponctuelles ou récurrentes, selon les modalités définies lors de la commande.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 3 — Tarifs et devis</h2>
              <p className="text-sm leading-relaxed mb-2">Les tarifs indiqués sur le site sont donnés à titre indicatif. Le prix définitif est celui figurant sur le devis accepté par le Client.</p>
              <p className="text-sm leading-relaxed mb-2">Les prix sont exprimés en euros, hors taxes (HT) et toutes taxes comprises (TTC) selon le taux de TVA applicable. LumiNett se réserve le droit de modifier ses tarifs à tout moment, sans que cela affecte les devis déjà acceptés.</p>
              <p className="text-sm leading-relaxed">Les suppléments éventuels (déplacements hors zone, matériaux spéciaux, accès difficile) seront précisés dans le devis.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 4 — Commande et confirmation</h2>
              <p className="text-sm leading-relaxed mb-2">Toute demande de prestation effectuée via le site internet ou par téléphone constitue une demande de devis. La commande est considérée comme ferme et définitive :</p>
              <ul className="space-y-1.5 text-sm mb-3">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Après signature électronique ou manuscrite du devis par le Client</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Après confirmation écrite (email) par le Prestataire</li>
              </ul>
              <p className="text-sm leading-relaxed">Un email de confirmation est envoyé au Client dans un délai de <strong>48 heures</strong> suivant la réception de la demande.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 5 — Modalités de paiement</h2>
              <p className="text-sm leading-relaxed mb-2">Le règlement s'effectue :</p>
              <ul className="space-y-1.5 text-sm mb-3">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Par virement bancaire, espèces ou chèque</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>À la date d'échéance figurant sur la facture</li>
              </ul>
              <p className="text-sm leading-relaxed mb-2">En cas de retard de paiement, des pénalités de retard égales à 3 fois le taux d'intérêt légal seront appliquées, ainsi qu'une indemnité forfaitaire de recouvrement de 40 € (article L.441-10 du Code de commerce).</p>
              <p className="text-sm leading-relaxed">Pour les particuliers, un acompte de 30% peut être demandé à la commande pour les prestations supérieures à 300 €.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 6 — Annulation et modification</h2>
              <p className="text-sm leading-relaxed mb-2">Toute demande d'annulation ou de modification doit être communiquée par email ou téléphone :</p>
              <ul className="space-y-1.5 text-sm mb-3">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><strong>Plus de 48h avant</strong> la prestation : annulation gratuite</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><strong>Entre 24h et 48h</strong> : facturation de 30% du montant du devis</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><strong>Moins de 24h ou le jour même</strong> : facturation de 50% du montant du devis</li>
              </ul>
              <p className="text-sm leading-relaxed">En cas d'annulation de la part de LumiNett (force majeure, indisponibilité), aucune pénalité ne sera appliquée et une nouvelle date sera proposée au Client.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 7 — Obligations du Client</h2>
              <p className="text-sm leading-relaxed mb-2">Le Client s'engage à :</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Assurer l'accès aux locaux à l'heure convenue</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Informer LumiNett de tout risque particulier (présence d'animaux, matériaux fragiles, zones inaccessibles)</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Mettre à disposition les ressources nécessaires (eau, électricité) si requis</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Régler les sommes dues dans les délais convenus</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 8 — Obligations du Prestataire</h2>
              <p className="text-sm leading-relaxed mb-2">LumiNett s'engage à :</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Réaliser les prestations avec professionnalisme et dans les règles de l'art</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Respecter les horaires et délais convenus</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Utiliser des produits adaptés et respectueux de l'environnement</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Respecter la confidentialité des informations du Client</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Justifier d'une assurance responsabilité civile professionnelle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 9 — Garantie satisfaction</h2>
              <p className="text-sm leading-relaxed">En cas de résultat non conforme aux attentes exprimées dans le devis, LumiNett s'engage à effectuer une reprise gratuite de la prestation dans un délai de <strong>48 heures</strong> suivant la réclamation du Client, à condition que celle-ci soit formulée dans les 24h suivant la réalisation de la prestation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 10 — Responsabilité</h2>
              <p className="text-sm leading-relaxed mb-2">La responsabilité de LumiNett ne saurait être engagée pour :</p>
              <ul className="space-y-1.5 text-sm mb-3">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Les dommages résultant d'informations incomplètes ou incorrectes fournies par le Client</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Les cas de force majeure (intempéries, pandémie, grève, etc.)</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>L'usure normale des matériaux et équipements</li>
              </ul>
              <p className="text-sm leading-relaxed">LumiNett dispose d'une assurance responsabilité civile professionnelle couvrant les dommages corporels et matériels survenus dans le cadre de ses interventions.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 11 — Protection des données personnelles (RGPD)</h2>
              <p className="text-sm leading-relaxed mb-2">Les données personnelles collectées (nom, email, téléphone, adresse) sont utilisées exclusivement pour :</p>
              <ul className="space-y-1.5 text-sm mb-3">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>La gestion des commandes et des relations commerciales</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>L'envoi de devis et factures</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Les communications relatives aux prestations</li>
              </ul>
              <p className="text-sm leading-relaxed mb-2">Conformément au RGPD, le Client dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données. Pour exercer ces droits, contactez-nous à : <strong>contact@luminett.fr</strong></p>
              <p className="text-sm leading-relaxed">Les données ne sont pas cédées à des tiers et sont conservées pour la durée légale applicable.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 12 — Signature électronique</h2>
              <p className="text-sm leading-relaxed">La signature électronique apposée via l'espace client de LumiNett constitue un accord ferme et contractuellement engageant au sens de la loi n° 2000-230 du 13 mars 2000 et du règlement européen eIDAS (n° 910/2014). Elle vaut acceptation des conditions du devis et des présentes CGV.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 13 — Réclamations</h2>
              <p className="text-sm leading-relaxed">Toute réclamation doit être adressée par email à <strong>contact@luminett.fr</strong> ou par téléphone au <strong>06 10 85 49 18</strong>. LumiNett s'engage à traiter les réclamations dans un délai de <strong>48 heures ouvrées</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">Article 14 — Droit applicable et juridiction</h2>
              <p className="text-sm leading-relaxed">Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord amiable, les tribunaux compétents du ressort du siège social de LumiNett seront saisis.</p>
            </section>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs">© {new Date().getFullYear()} LumiNett — Tous droits réservés</p>
            <div className="flex gap-3">
              <Link to="/" className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">Accueil</Link>
              <Link to="/commander" className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">Commander →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
