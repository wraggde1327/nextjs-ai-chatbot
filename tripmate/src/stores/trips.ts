import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, Expense, ChatMessage, ChatMessageType, TripEvent, Task, Poll, Link, Fund } from '../types'
import {
  mockTrips, mockExpenses, mockMessages, mockEvents,
  mockTasks, mockPolls, mockLinks, mockFund, mockUsers,
} from '../data/mock'

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<Trip[]>([...mockTrips])
  const expenses = ref<Expense[]>([...mockExpenses])
  const messages = ref<ChatMessage[]>([...mockMessages])
  const events = ref<TripEvent[]>([...mockEvents])
  const tasks = ref<Task[]>([...mockTasks])
  const polls = ref<Poll[]>([...mockPolls])
  const links = ref<Link[]>([...mockLinks])
  const fund = ref<Fund | null>({ ...mockFund })

  const activeTrips = computed(() => trips.value.filter(t => !t.isArchived))
  const archivedTrips = computed(() => trips.value.filter(t => t.isArchived))

  function getUserName(userId: string): string {
    return mockUsers[userId]?.name ?? 'Неизвестный'
  }

  function getTripExpenses(tripId: string) {
    return expenses.value.filter(e => e.tripId === tripId && !e.isDeleted)
  }

  function getSharedExpenses(tripId: string) {
    return getTripExpenses(tripId).filter(e => e.type === 'shared')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function getPersonalExpenses(tripId: string, userId: string) {
    return getTripExpenses(tripId).filter(e => e.type === 'personal' && e.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function getDeposits(tripId: string) {
    return getTripExpenses(tripId).filter(e => e.type === 'deposit')
  }

  function getTripMessages(tripId: string) {
    return messages.value.filter(m => m.tripId === tripId).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }

  function getTripEvents(tripId: string) {
    return events.value.filter(e => e.tripId === tripId).sort((a, b) => {
      const da = `${a.date}T${a.time}`
      const db = `${b.date}T${b.time}`
      return da.localeCompare(db)
    })
  }

  function getEventsForDate(tripId: string, date: string) {
    return getTripEvents(tripId).filter(e => e.date === date)
  }

  function getTripTasks(tripId: string) {
    return tasks.value.filter(t => t.tripId === tripId)
  }

  function getTaskSections(tripId: string): string[] {
    const secs = new Set(getTripTasks(tripId).map(t => t.section))
    return Array.from(secs)
  }

  function getTripPolls(tripId: string) {
    return polls.value.filter(p => p.tripId === tripId)
  }

  function getTripLinks(tripId: string) {
    return links.value.filter(l => l.tripId === tripId)
  }

  function getTripFund(tripId: string) {
    return fund.value?.tripId === tripId ? fund.value : null
  }

  function calculateBalances(tripId: string) {
    const shared = getTripExpenses(tripId).filter(e => e.type === 'shared')
    const balances: Record<string, number> = {}
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip) return { balances: {}, transfers: [] }

    trip.members.forEach(m => { balances[m.userId] = 0 })
    shared.forEach(exp => {
      exp.paidBy.forEach(p => { balances[p.userId] = (balances[p.userId] || 0) + p.amount })
      exp.splits.forEach(s => { balances[s.userId] = (balances[s.userId] || 0) - s.amount })
    })

    const debtors = Object.entries(balances).filter(([, v]) => v < 0).map(([k, v]) => ({ id: k, amount: -v })).sort((a, b) => b.amount - a.amount)
    const creditors = Object.entries(balances).filter(([, v]) => v > 0).map(([k, v]) => ({ id: k, amount: v })).sort((a, b) => b.amount - a.amount)
    const transfers: { from: string; to: string; amount: number }[] = []
    let di = 0, ci = 0
    while (di < debtors.length && ci < creditors.length) {
      const amt = Math.min(debtors[di].amount, creditors[ci].amount)
      if (amt > 0) transfers.push({ from: debtors[di].id, to: creditors[ci].id, amount: Math.round(amt) })
      debtors[di].amount -= amt
      creditors[ci].amount -= amt
      if (debtors[di].amount < 1) di++
      if (creditors[ci].amount < 1) ci++
    }
    return { balances, transfers }
  }

  // ===== CREATE =====

  function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'isDeleted'>) {
    const newExp: Expense = { ...expense, id: `exp-${Date.now()}`, createdAt: new Date().toISOString(), isDeleted: false }
    expenses.value.push(newExp)
    messages.value.push({ id: `msg-${Date.now()}`, tripId: expense.tripId, type: 'expense', referenceId: newExp.id, text: expense.title, createdBy: expense.createdBy, createdAt: newExp.createdAt })
    return newExp
  }

  function addMessage(tripId: string, text: string, userId: string) {
    const msg: ChatMessage = { id: `msg-${Date.now()}`, tripId, type: 'text', text, createdBy: userId, createdAt: new Date().toISOString() }
    messages.value.push(msg)
    return msg
  }

  function addEvent(tripId: string, title: string, date: string, time: string, location: string, userId: string) {
    const evt: TripEvent = { id: `evt-${Date.now()}`, tripId, title, date, time, location: location || undefined, reminderMinutes: 30, createdBy: userId }
    events.value.push(evt)
    messages.value.push({ id: `msg-${Date.now()}`, tripId, type: 'event', referenceId: evt.id, text: title, createdBy: userId, createdAt: new Date().toISOString() })
    return evt
  }

  function addTask(tripId: string, title: string, section: string, assigneeId: string | undefined, userId: string) {
    const task: Task = { id: `task-${Date.now()}`, tripId, title, section, assigneeId, isCompleted: false, createdBy: userId }
    tasks.value.push(task)
    return task
  }

  function addTaskFromChat(tripId: string, title: string, section: string, assigneeId: string | undefined, userId: string) {
    const task = addTask(tripId, title, section, assigneeId, userId)
    messages.value.push({ id: `msg-${Date.now()}`, tripId, type: 'task' as ChatMessageType, referenceId: task.id, text: title, createdBy: userId, createdAt: new Date().toISOString() })
    return task
  }

  function addPoll(tripId: string, question: string, optionTexts: string[], userId: string) {
    const poll: Poll = { id: `poll-${Date.now()}`, tripId, question, options: optionTexts.map(text => ({ text, votes: [] })), createdBy: userId }
    polls.value.push(poll)
    messages.value.push({ id: `msg-${Date.now()}`, tripId, type: 'poll', referenceId: poll.id, createdBy: userId, createdAt: new Date().toISOString() })
    return poll
  }

  function addLink(tripId: string, url: string, title: string, category: string, userId: string) {
    const link: Link = { id: `link-${Date.now()}`, tripId, url, title, category, createdBy: userId }
    links.value.push(link)
    return link
  }

  // ===== UPDATE =====

  function toggleTask(taskId: string, userId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) { task.isCompleted = !task.isCompleted; task.completedBy = task.isCompleted ? userId : undefined }
  }

  function votePoll(pollId: string, optionIndex: number, userId: string) {
    const poll = polls.value.find(p => p.id === pollId)
    if (!poll) return
    poll.options.forEach((opt, i) => { opt.votes = opt.votes.filter(v => v !== userId); if (i === optionIndex) opt.votes.push(userId) })
  }

  function updateExpense(expenseId: string, updates: Partial<Pick<Expense, 'title' | 'amount' | 'category' | 'type' | 'splitMode' | 'splits'>>) {
    const exp = expenses.value.find(e => e.id === expenseId)
    if (exp) Object.assign(exp, updates)
  }

  function updateEvent(eventId: string, updates: Partial<Pick<TripEvent, 'title' | 'date' | 'time' | 'location'>>) {
    const evt = events.value.find(e => e.id === eventId)
    if (evt) Object.assign(evt, updates)
  }

  function updateTask(taskId: string, updates: Partial<Pick<Task, 'title' | 'section' | 'assigneeId'>>) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) Object.assign(task, updates)
  }

  // ===== DELETE =====

  function deleteExpense(expenseId: string) {
    const exp = expenses.value.find(e => e.id === expenseId)
    if (exp) {
      exp.isDeleted = true
      messages.value.push({ id: `msg-${Date.now()}`, tripId: exp.tripId, type: 'system', text: `🗑 Трата «${exp.title}» удалена`, createdBy: exp.createdBy, createdAt: new Date().toISOString() })
    }
  }

  function deleteEvent(eventId: string) {
    const idx = events.value.findIndex(e => e.id === eventId)
    if (idx >= 0) {
      const evt = events.value[idx]
      events.value.splice(idx, 1)
      messages.value.push({ id: `msg-${Date.now()}`, tripId: evt.tripId, type: 'system', text: `🗑 Событие «${evt.title}» удалено`, createdBy: evt.createdBy, createdAt: new Date().toISOString() })
    }
  }

  function deleteTask(taskId: string) {
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx >= 0) tasks.value.splice(idx, 1)
  }

  function deleteLink(linkId: string) {
    const idx = links.value.findIndex(l => l.id === linkId)
    if (idx >= 0) links.value.splice(idx, 1)
  }

  function deletePoll(pollId: string) {
    const idx = polls.value.findIndex(p => p.id === pollId)
    if (idx >= 0) polls.value.splice(idx, 1)
  }

  return {
    trips, expenses, messages, events, tasks, polls, links, fund,
    activeTrips, archivedTrips,
    getUserName,
    getTripExpenses, getSharedExpenses, getPersonalExpenses, getDeposits,
    getTripMessages, getTripEvents, getEventsForDate,
    getTripTasks, getTaskSections, getTripPolls, getTripLinks, getTripFund,
    calculateBalances,
    addExpense, addMessage, addEvent, addTask, addTaskFromChat, addPoll, addLink,
    toggleTask, votePoll,
    updateExpense, updateEvent, updateTask,
    deleteExpense, deleteEvent, deleteTask, deleteLink, deletePoll,
  }
})
