export type RentalStatus = "ACTIVE" | "RETURNED" | "LATE";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface GameComponentsData {
  id?: string;
  gameId?: string;
  cards: number;
  tokens: number;
  dice: number;
  tiles: number;
  others: number;
  othersDescription?: string | null;
}

export interface GameWithComponents {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  minPlayers: number;
  maxPlayers: number;
  minAge: number;
  playtime: number;
  components?: GameComponentsData | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  _count?: {
    rentals: number;
    reservations: number;
  };
}

export interface RentalWithDetails {
  id: string;
  gameId: string;
  userId?: string | null;
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  startDate: Date;
  expectedEndDate: Date;
  returnDate?: Date | null;
  status: RentalStatus;
  game: {
    id: string;
    name: string;
    image: string;
    category: string;
    price: number;
    components?: GameComponentsData | null;
  };
  user?: UserData | null;
}

export interface ReservationWithDetails {
  id: string;
  gameId: string;
  userId?: string | null;
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  expectedEndDate: Date;
  status: ReservationStatus;
  createdAt: Date;
  game: {
    id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
  };
  user?: UserData | null;
}
