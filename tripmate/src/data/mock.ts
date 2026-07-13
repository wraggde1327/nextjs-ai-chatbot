import type { User, Trip, Expense, ChatMessage, TripEvent, Task, Poll, Link, Fund, CountryInfo } from '../types'

export const testUser: User = {
  id: 'user-1',
  name: 'Test',
  avatar: '',
  email: 'test@tripmate.app',
  defaultCurrency: '₽',
  defaultReminderMinutes: 30,
}

export const mockUsers: Record<string, User> = {
  'user-1': testUser,
  'user-2': { id: 'user-2', name: 'Аня', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 30 },
  'user-3': { id: 'user-3', name: 'Дима', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 30 },
  'user-4': { id: 'user-4', name: 'Катя', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 30 },
  'user-5': { id: 'user-5', name: 'Олег', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 15 },
  'user-6': { id: 'user-6', name: 'Лиза', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 30 },
  'user-7': { id: 'user-7', name: 'Саша', avatar: '', defaultCurrency: '₽', defaultReminderMinutes: 60 },
}

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Турция 2026',
    country: 'Турция',
    countryFlag: '🇹🇷',
    city: 'Анталья',
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    budget: 200000,
    baseCurrency: '₽',
    members: [
      { userId: 'user-1', role: 'organizer', joinedAt: '2026-05-01' },
      { userId: 'user-2', role: 'member', joinedAt: '2026-05-02' },
      { userId: 'user-3', role: 'member', joinedAt: '2026-05-02' },
      { userId: 'user-4', role: 'member', joinedAt: '2026-05-03' },
      { userId: 'user-5', role: 'member', joinedAt: '2026-05-03' },
      { userId: 'user-6', role: 'member', joinedAt: '2026-05-04' },
      { userId: 'user-7', role: 'member', joinedAt: '2026-05-05' },
    ],
    wallets: [
      { id: 'w-1', tripId: 'trip-1', name: 'Test и Лиза', memberIds: ['user-1', 'user-6'] },
      { id: 'w-2', tripId: 'trip-1', memberIds: ['user-2'] },
      { id: 'w-3', tripId: 'trip-1', name: 'Дима и Катя', memberIds: ['user-3', 'user-4'] },
      { id: 'w-4', tripId: 'trip-1', memberIds: ['user-5'] },
      { id: 'w-5', tripId: 'trip-1', memberIds: ['user-7'] },
    ],
    isArchived: false,
    createdBy: 'user-1',
  },
  {
    id: 'trip-2',
    name: 'Грузия 2025',
    country: 'Грузия',
    countryFlag: '🇬🇪',
    city: 'Тбилиси',
    startDate: '2025-09-10',
    endDate: '2025-09-17',
    baseCurrency: '₽',
    members: [
      { userId: 'user-1', role: 'organizer', joinedAt: '2025-07-01' },
      { userId: 'user-2', role: 'member', joinedAt: '2025-07-02' },
      { userId: 'user-3', role: 'member', joinedAt: '2025-07-03' },
    ],
    wallets: [],
    isArchived: true,
    createdBy: 'user-1',
  },
]

export const mockExpenses: Expense[] = [
  {
    id: 'exp-1', tripId: 'trip-1', title: 'Отель Sunrise', amount: 84000, currency: '₽',
    category: 'housing', type: 'shared', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 84000 }],
    splits: [
      { userId: 'user-1', amount: 12000 }, { userId: 'user-2', amount: 12000 },
      { userId: 'user-3', amount: 12000 }, { userId: 'user-4', amount: 12000 },
      { userId: 'user-5', amount: 12000 }, { userId: 'user-6', amount: 12000 },
      { userId: 'user-7', amount: 12000 },
    ],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-05-10T10:00:00',
  },
  {
    id: 'exp-2', tripId: 'trip-1', title: 'Авиабилеты', amount: 42000, currency: '₽',
    category: 'transport', type: 'shared', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-3', amount: 42000 }],
    splits: [
      { userId: 'user-1', amount: 6000 }, { userId: 'user-2', amount: 6000 },
      { userId: 'user-3', amount: 6000 }, { userId: 'user-4', amount: 6000 },
      { userId: 'user-5', amount: 6000 }, { userId: 'user-6', amount: 6000 },
      { userId: 'user-7', amount: 6000 },
    ],
    isDeleted: false, createdBy: 'user-3', createdAt: '2026-05-12T14:00:00',
  },
  {
    id: 'exp-3', tripId: 'trip-1', title: 'Ресторан Mozaik', amount: 7000, currency: '₽',
    category: 'food', type: 'shared', splitMode: 'itemized', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 7000 }],
    splits: [
      { userId: 'user-1', amount: 1250 }, { userId: 'user-2', amount: 800 },
      { userId: 'user-3', amount: 1250 }, { userId: 'user-4', amount: 600 },
      { userId: 'user-5', amount: 1550 }, { userId: 'user-6', amount: 1050 },
      { userId: 'user-7', amount: 500 },
    ],
    items: [
      { title: 'Пицца', amount: 800, userIds: ['user-2'] },
      { title: 'Стейк', amount: 1800, userIds: ['user-1', 'user-3'] },
      { title: 'Паста', amount: 700, userIds: ['user-6'] },
      { title: 'Детское меню', amount: 500, userIds: ['user-7'] },
      { title: 'Салат', amount: 600, userIds: ['user-4'] },
      { title: 'Кебаб', amount: 1200, userIds: ['user-5'] },
      { title: 'Вино', amount: 1400, userIds: ['user-1', 'user-3', 'user-5', 'user-6'] },
    ],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-07-16T20:30:00',
  },
  {
    id: 'exp-4', tripId: 'trip-1', title: 'Прокат авто', amount: 18200, currency: '₽',
    category: 'transport', type: 'shared', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-3', amount: 18200 }],
    splits: [
      { userId: 'user-1', amount: 2600 }, { userId: 'user-2', amount: 2600 },
      { userId: 'user-3', amount: 2600 }, { userId: 'user-4', amount: 2600 },
      { userId: 'user-5', amount: 2600 }, { userId: 'user-6', amount: 2600 },
      { userId: 'user-7', amount: 2600 },
    ],
    isDeleted: false, createdBy: 'user-3', createdAt: '2026-07-15T10:00:00',
  },
  {
    id: 'exp-5', tripId: 'trip-1', title: 'Экскурсия Памуккале', amount: 12500, currency: '₽',
    category: 'fun', type: 'shared', splitMode: 'selected', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 8000 }, { userId: 'user-3', amount: 4500 }],
    splits: [
      { userId: 'user-1', amount: 2500 }, { userId: 'user-2', amount: 2500 },
      { userId: 'user-3', amount: 2500 }, { userId: 'user-5', amount: 2500 },
      { userId: 'user-7', amount: 2500 },
    ],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-07-18T09:00:00',
  },
  {
    id: 'exp-6', tripId: 'trip-1', title: 'Сувениры', amount: 3200, currency: '₽',
    category: 'shopping', type: 'personal', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 3200 }],
    splits: [{ userId: 'user-1', amount: 3200 }],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-07-17T15:00:00',
  },
  {
    id: 'exp-7', tripId: 'trip-1', title: 'Такси в аэропорт', amount: 2400, currency: '₽',
    category: 'transport', type: 'shared', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 2400 }],
    splits: [
      { userId: 'user-1', amount: 343 }, { userId: 'user-2', amount: 343 },
      { userId: 'user-3', amount: 343 }, { userId: 'user-4', amount: 343 },
      { userId: 'user-5', amount: 343 }, { userId: 'user-6', amount: 343 },
      { userId: 'user-7', amount: 342 },
    ],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-07-15T06:00:00',
  },
  {
    id: 'exp-deposit-1', tripId: 'trip-1', title: 'Залог за виллу', amount: 30000, currency: '₽',
    category: 'housing', type: 'deposit', depositStatus: 'pending', splitMode: 'equal', source: 'personal_payment',
    paidBy: [{ userId: 'user-1', amount: 30000 }],
    splits: [],
    isDeleted: false, createdBy: 'user-1', createdAt: '2026-06-20T12:00:00',
  },
]

export const mockFund: Fund = {
  id: 'fund-1',
  tripId: 'trip-1',
  holderId: 'user-1',
  contributions: [
    { userId: 'user-1', expectedAmount: 20000, paidAmount: 20000, status: 'confirmed' },
    { userId: 'user-2', expectedAmount: 20000, paidAmount: 20000, status: 'confirmed' },
    { userId: 'user-3', expectedAmount: 20000, paidAmount: 20000, status: 'confirmed' },
    { userId: 'user-4', expectedAmount: 20000, paidAmount: 20000, status: 'confirmed' },
    { userId: 'user-5', expectedAmount: 20000, paidAmount: 0, status: 'pending' },
    { userId: 'user-6', expectedAmount: 20000, paidAmount: 20000, status: 'paid' },
    { userId: 'user-7', expectedAmount: 20000, paidAmount: 20000, status: 'confirmed' },
  ],
  totalCollected: 120000,
  totalSpent: 84000,
}

export const mockMessages: ChatMessage[] = [
  { id: 'msg-1', tripId: 'trip-1', type: 'system', text: 'Test создал путешествие «Турция 2026»', createdBy: 'user-1', createdAt: '2026-05-01T10:00:00' },
  { id: 'msg-2', tripId: 'trip-1', type: 'system', text: 'Аня присоединилась', createdBy: 'user-2', createdAt: '2026-05-02T11:00:00' },
  { id: 'msg-3', tripId: 'trip-1', type: 'text', text: 'Привет всем! Начинаю бронировать отель 🏨', createdBy: 'user-1', createdAt: '2026-05-10T09:00:00' },
  { id: 'msg-4', tripId: 'trip-1', type: 'expense', referenceId: 'exp-1', text: 'Забронил отель!', createdBy: 'user-1', createdAt: '2026-05-10T10:00:00' },
  { id: 'msg-5', tripId: 'trip-1', type: 'text', text: 'Круто! Я займусь билетами ✈️', createdBy: 'user-3', createdAt: '2026-05-10T10:30:00' },
  { id: 'msg-6', tripId: 'trip-1', type: 'expense', referenceId: 'exp-2', text: 'Билеты куплены на всех', createdBy: 'user-3', createdAt: '2026-05-12T14:00:00' },
  { id: 'msg-7', tripId: 'trip-1', type: 'text', text: 'Не забудьте страховки оформить!', createdBy: 'user-2', createdAt: '2026-05-15T08:00:00' },
  { id: 'msg-8', tripId: 'trip-1', type: 'poll', referenceId: 'poll-1', createdBy: 'user-2', createdAt: '2026-06-01T12:00:00' },
  { id: 'msg-9', tripId: 'trip-1', type: 'event', referenceId: 'evt-1', text: 'Завтрак завтра в 8:30!', createdBy: 'user-1', createdAt: '2026-07-16T21:00:00' },
  { id: 'msg-10', tripId: 'trip-1', type: 'expense', referenceId: 'exp-3', text: 'Отличный ужин!', createdBy: 'user-1', createdAt: '2026-07-16T20:30:00' },
  { id: 'msg-11', tripId: 'trip-1', type: 'text', text: 'Кто завтра на экскурсию? 🏛', createdBy: 'user-5', createdAt: '2026-07-17T20:00:00' },
]

export const mockEvents: TripEvent[] = [
  { id: 'evt-1', tripId: 'trip-1', title: 'Завтрак в отеле', date: '2026-07-17', time: '08:30', location: 'Hotel Sunrise, ресторан', reminderMinutes: 30, createdBy: 'user-1' },
  { id: 'evt-2', tripId: 'trip-1', title: 'Вылет МСК → Анталья', date: '2026-07-15', time: '06:30', location: 'Шереметьево, Терминал B', reminderMinutes: 180, createdBy: 'user-1' },
  { id: 'evt-3', tripId: 'trip-1', title: 'Заселение в отель', date: '2026-07-15', time: '14:00', location: 'Hotel Sunrise, Lara Cd. No:12', reminderMinutes: 30, createdBy: 'user-1' },
  { id: 'evt-4', tripId: 'trip-1', title: 'Пляж Коньяалты', date: '2026-07-16', time: '10:00', reminderMinutes: 30, createdBy: 'user-2' },
  { id: 'evt-5', tripId: 'trip-1', title: 'Ужин в Mozaik', date: '2026-07-16', time: '19:30', location: 'Selçuk Mh., Kaleiçi', mapsUrl: 'https://maps.google.com', reminderMinutes: 30, createdBy: 'user-1' },
  { id: 'evt-6', tripId: 'trip-1', title: 'Забрать авто', date: '2026-07-17', time: '09:00', location: 'Europcar, аэропорт', reminderMinutes: 30, createdBy: 'user-3' },
  { id: 'evt-7', tripId: 'trip-1', title: 'Экскурсия Памуккале', date: '2026-07-18', time: '10:00', reminderMinutes: 60, createdBy: 'user-1' },
  { id: 'evt-8', tripId: 'trip-1', title: 'Вылет Анталья → МСК', date: '2026-07-22', time: '16:45', location: 'Аэропорт Анталья', reminderMinutes: 180, createdBy: 'user-1' },
]

export const mockTasks: Task[] = [
  { id: 'task-1', tripId: 'trip-1', title: 'Купить билеты', section: 'До поездки', assigneeId: 'user-1', isCompleted: true, completedBy: 'user-1', createdBy: 'user-1' },
  { id: 'task-2', tripId: 'trip-1', title: 'Забронить отель', section: 'До поездки', assigneeId: 'user-1', isCompleted: true, completedBy: 'user-1', createdBy: 'user-1' },
  { id: 'task-3', tripId: 'trip-1', title: 'Оформить страховку', section: 'До поездки', assigneeId: 'user-2', isCompleted: true, completedBy: 'user-2', createdBy: 'user-1' },
  { id: 'task-4', tripId: 'trip-1', title: 'Арендовать машину', section: 'До поездки', assigneeId: 'user-3', isCompleted: true, completedBy: 'user-3', createdBy: 'user-1' },
  { id: 'task-5', tripId: 'trip-1', title: 'Обменять валюту', section: 'До поездки', assigneeId: 'user-1', deadline: '2026-07-14', isCompleted: false, createdBy: 'user-1' },
  { id: 'task-6', tripId: 'trip-1', title: 'Скачать оффлайн-карту', section: 'До поездки', assigneeId: undefined, deadline: '2026-07-14', isCompleted: false, createdBy: 'user-2' },
  { id: 'task-7', tripId: 'trip-1', title: 'Загранпаспорт', section: 'Что взять', isCompleted: false, createdBy: 'user-1' },
  { id: 'task-8', tripId: 'trip-1', title: 'Солнцезащитный крем', section: 'Что взять', assigneeId: 'user-4', isCompleted: false, createdBy: 'user-1' },
  { id: 'task-9', tripId: 'trip-1', title: 'Аптечка', section: 'Что взять', assigneeId: 'user-2', isCompleted: false, createdBy: 'user-2' },
  { id: 'task-10', tripId: 'trip-1', title: 'Переходник розетки', section: 'Что взять', assigneeId: 'user-3', isCompleted: false, createdBy: 'user-3' },
  { id: 'task-11', tripId: 'trip-1', title: 'Лукум для мамы', section: 'Покупки', assigneeId: 'user-2', isCompleted: false, createdBy: 'user-2' },
]

export const mockPolls: Poll[] = [
  {
    id: 'poll-1', tripId: 'trip-1', question: 'Какой отель лучше?',
    options: [
      { text: 'Sunrise Resort', votes: ['user-1', 'user-3', 'user-6'] },
      { text: 'Palm Garden', votes: ['user-2', 'user-4', 'user-5', 'user-7'] },
    ],
    createdBy: 'user-2',
  },
]

export const mockLinks: Link[] = [
  { id: 'link-1', tripId: 'trip-1', url: 'https://booking.com/hotel-sunrise', title: 'Отель Sunrise', category: 'Жильё', comment: 'Наш отель', createdBy: 'user-1' },
  { id: 'link-2', tripId: 'trip-1', url: 'https://tripadvisor.com/mozaik', title: 'Ресторан Mozaik', category: 'Еда', comment: 'Нам советовали', createdBy: 'user-2' },
  { id: 'link-3', tripId: 'trip-1', url: 'https://youtube.com/top10-antalya', title: 'Топ-10 мест Анталья', category: 'Что посмотреть', createdBy: 'user-3' },
]

export const turkeyInfo: CountryInfo = {
  visa: 'Не нужна до 60 дней',
  passport: 'Загранпаспорт, срок от 6 месяцев',
  currency: 'Турецкая лира (TRY)',
  currencyCode: 'TRY',
  exchangeRate: '1 ₽ ≈ 0.37 TRY',
  cards: 'Visa/MC работают, МИР — нет',
  tips: '10% в ресторанах',
  sockets: 'Тип C/F (как в России ✓)',
  voltage: '220V',
  water: 'Только бутилированная',
  timezone: 'UTC+3 (как Москва)',
  emergency: '112',
  police: '155',
  embassy: 'Посольство РФ в Анкаре',
  embassyPhone: '+90 312 439-21-22',
  phrases: [
    { ru: 'Спасибо', local: 'Teşekkürler' },
    { ru: 'Здравствуйте', local: 'Merhaba' },
    { ru: 'Сколько стоит?', local: 'Ne kadar?' },
    { ru: 'Где туалет?', local: 'Tuvalet nerede?' },
    { ru: 'Счёт, пожалуйста', local: 'Hesap lütfen' },
    { ru: 'Помогите!', local: 'İmdat!' },
    { ru: 'Вызовите врача', local: 'Doktor çağırın' },
    { ru: 'Вкусно!', local: 'Çok lezzetli!' },
    { ru: 'Да', local: 'Evet' },
    { ru: 'Нет', local: 'Hayır' },
  ],
}
