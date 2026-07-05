export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: "admin" | "member";
  birthday?: string;
  subscriptionActive: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  month: number;
  year: number;
  isCurrent: boolean;
  rating: number;
  reviewCount: number;
}

export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  title: string;
  type: "book" | "date" | "place" | "other";
  deadline: string;
  isActive: boolean;
  totalMembers: number;
  votedCount: number;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  votes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: "monthly" | "quarterly";
  speakerName?: string;
  speakerInfo?: string;
  imageUrl?: string;
  isOnline: boolean;
  rsvpGoing: number;
  rsvpTotal: number;
  isPast: boolean;
  hasPhotos: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  bookId?: string;
  isPinned: boolean;
  lastMessage: string;
  lastMessageAuthor: string;
  lastMessageTime: string;
  unreadCount: number;
  icon: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isOwn: boolean;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  prize: string;
  deadline: string;
  imageUrl?: string;
  isActive: boolean;
  participantCount: number;
  winnerName?: string;
}

export interface Birthday {
  userId: string;
  userName: string;
  userAvatar: string;
  date: string;
}
