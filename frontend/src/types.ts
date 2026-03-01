export interface Order {
  id: number;
  service: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  address: string;
  date: string;
  time_slot: string;
  surface_area?: string | null;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Stats {
  total: number;
  pending: number;
  today: number;
  completed: number;
}

export interface Service {
  id: string;
  label: string;
  description: string;
  icon: string;
  price: string;
  details: string[];
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: number;
  reference: string;
  type: 'devis' | 'facture';
  orderId?: number | null;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  items: QuoteItem[];
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  validUntil?: string | null;
  status: 'sent' | 'viewed' | 'signed' | 'refused' | 'paid';
  signedAt: string | null;
  createdAt: string;
}

export interface ClientUser {
  id: number;
  name: string;
  email: string;
}

export const SERVICES: Service[] = [
  {
    id: 'conteneurs',
    label: 'Conteneurs',
    description: 'Nettoyage et désinfection de vos conteneurs poubelles',
    icon: '🗑️',
    price: 'À partir de 30 €',
    details: ['Bacs à ordures', 'Conteneurs professionnels', 'Désinfection complète', 'Élimination des odeurs'],
  },
  {
    id: 'domicile',
    label: 'Domicile',
    description: 'Ménage complet de votre appartement ou maison',
    icon: '🏠',
    price: 'À partir de 60 €',
    details: ['Appartements & maisons', 'Ménage régulier ou ponctuel', 'Produits inclus', 'Personnel qualifié'],
  },
  {
    id: 'bureau',
    label: 'Bureau / Local',
    description: 'Entretien de vos espaces professionnels',
    icon: '🏢',
    price: 'À partir de 80 €',
    details: ['Bureaux & open-spaces', 'Locaux commerciaux', 'Sanitaires & cuisine', 'Intervention hors heures'],
  },
  {
    id: 'travaux',
    label: 'Après travaux',
    description: 'Remise en état complète après chantier',
    icon: '🔨',
    price: 'À partir de 150 €',
    details: ['Élimination gravats & poussière', 'Nettoyage des vitres', 'Sols & murs', 'Prêt à emménager'],
  },
  {
    id: 'vitres',
    label: 'Vitres / Façades',
    description: 'Lavage de vitres et nettoyage de façades',
    icon: '🪟',
    price: 'À partir de 50 €',
    details: ['Vitres intérieur / extérieur', 'Façades & balcons', 'Châssis & encadrements', 'Hauteur sur devis'],
  },
];

export const STATUS_CONFIG = {
  pending:     { label: 'En attente', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  confirmed:   { label: 'Confirmé',   color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  in_progress: { label: 'En cours',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  completed:   { label: 'Terminé',    color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled:   { label: 'Annulé',     color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
} as const;

export const QUOTE_STATUS_CONFIG = {
  sent:    { label: 'En attente de signature', color: 'bg-amber-100 text-amber-700' },
  viewed:  { label: 'Consulté',               color: 'bg-blue-100 text-blue-700' },
  signed:  { label: 'Signé',                  color: 'bg-emerald-100 text-emerald-700' },
  refused: { label: 'Refusé',                 color: 'bg-red-100 text-red-700' },
  paid:    { label: 'Payé',                   color: 'bg-purple-100 text-purple-700' },
} as const;

export const TIME_SLOTS = [
  '08h00 – 10h00',
  '10h00 – 12h00',
  '14h00 – 16h00',
  '16h00 – 18h00',
];
