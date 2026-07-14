export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  phone?: string
  defaultCurrency: string
  defaultReminderMinutes: number
}

export interface AuthProvider {
  userId: string
  provider: 'email' | 'apple' | 'google' | 'telegram' | 'phone'
  email?: string
}

export type TripRole = 'organizer' | 'member'

export interface TripMember {
  userId: string
  role: TripRole
  joinedAt: string
  leftAt?: string
}

export interface Wallet {
  id: string
  tripId: string
  name?: string
  memberIds: string[]
}

export interface Trip {
  id: string
  name: string
  country: string
  countryFlag: string
  city: string
  startDate: string
  endDate: string
  budget?: number
  baseCurrency: string
  members: TripMember[]
  wallets: Wallet[]
  isArchived: boolean
  createdBy: string
}

export type ExpenseType = 'shared' | 'family' | 'personal' | 'deposit'
export type SplitMode = 'equal' | 'selected' | 'custom' | 'itemized'
export type DepositStatus = 'pending' | 'returned' | 'lost' | 'partial'
export type ExpenseCategory = 'housing' | 'transport' | 'food' | 'fun' | 'shopping' | 'other'

export interface ExpenseItem {
  title: string
  amount: number
  userIds: string[]
}

export interface Expense {
  id: string
  tripId: string
  title: string
  amount: number
  currency: string
  category: ExpenseCategory
  type: ExpenseType
  depositStatus?: DepositStatus
  splitMode: SplitMode
  paidBy: { userId: string; amount: number }[]
  splits: { userId: string; amount: number }[]
  items?: ExpenseItem[]
  source: 'fund' | 'personal_payment'
  receiptPhoto?: string
  isDeleted: boolean
  createdBy: string
  createdAt: string
}

export interface Fund {
  id: string
  tripId: string
  holderId: string
  contributions: {
    userId: string
    expectedAmount: number
    paidAmount: number
    status: 'pending' | 'paid' | 'confirmed'
  }[]
  totalCollected: number
  totalSpent: number
}

export type ChatMessageType = 'text' | 'expense' | 'event' | 'poll' | 'task' | 'system'

export interface ChatMessage {
  id: string
  tripId: string
  type: ChatMessageType
  text?: string
  referenceId?: string
  createdBy: string
  createdAt: string
}

export interface TripEvent {
  id: string
  tripId: string
  title: string
  date: string
  time: string
  location?: string
  mapsUrl?: string
  reminderMinutes: number
  createdBy: string
}

export interface Task {
  id: string
  tripId: string
  title: string
  section: string
  assigneeId?: string
  deadline?: string
  isCompleted: boolean
  completedBy?: string
  createdBy: string
}

export interface Poll {
  id: string
  tripId: string
  question: string
  options: { text: string; votes: string[] }[]
  createdBy: string
}

export interface Link {
  id: string
  tripId: string
  url: string
  title?: string
  category?: string
  comment?: string
  createdBy: string
}

export interface CountryInfo {
  visa: string
  passport: string
  currency: string
  currencyCode: string
  exchangeRate: string
  cards: string
  tips: string
  sockets: string
  voltage: string
  water: string
  timezone: string
  emergency: string
  police: string
  embassy: string
  embassyPhone: string
  phrases: { ru: string; local: string }[]
}

export interface ChangeLog {
  id: string
  entityType: 'expense' | 'event' | 'task'
  entityId: string
  action: 'created' | 'updated' | 'deleted' | 'restored'
  changedBy: string
  changedAt: string
  diff: { field: string; oldValue: string; newValue: string }[]
}
