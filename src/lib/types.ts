export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
  avatar?: string;
  bio?: string;
  phone?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  company?: string;
  phone?: string;
  rating: number;
  totalEvents: number;
}

export interface EventReview {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  location: string;
  address?: string;
  date: string;
  time: string;
  endTime?: string;
  capacity: number;
  price: number;
  categoryId: string;
  category?: EventCategory;
  organizerId: string;
  organizer?: EventOrganizer;
  latitude?: number;
  longitude?: number;
  availableSpots?: number;
  isUserRegistered?: boolean;
  qrCode?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  rating: number;
  totalReviews: number;
  totalRevenue: number;
  imageUrl?: string;
  tags?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Inscription {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITING' | 'CHECKED_IN';
  qrCode: string;
  checkedInAt?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentId?: string;
  user?: User;
  event?: Event;
}

export interface CreateEventData {
  title: string;
  description: string;
  detailedDescription?: string;
  location: string;
  address?: string;
  date: string;
  time: string;
  endTime?: string;
  capacity: number;
  price: number;
  categoryId: string;
  tags?: string[];
  requirements?: string[];
  imageUrl?: string;
}

export interface EventStats {
  totalRegistrations: number;
  totalRevenue: number;
  checkedInCount: number;
  averageRating: number;
  totalReviews: number;
  registrationsByDay: { date: string; count: number }[];
  revenueByDay: { date: string; amount: number }[];
}

export interface QRCodeScan {
  id: string;
  eventId: string;
  inscriptionId: string;
  scannedAt: string;
  scannedBy: string;
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'EXPIRED';
} 