<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="" />
        </ion-buttons>
        <ion-title>{{ trip?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="peopleOutline" />
            <ion-badge color="primary" style="margin-left:4px">{{ trip?.members.length }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" class="chat-content">
      <div class="chat-messages">
        <template v-for="msg in chatMessages" :key="msg.id">
          <div v-if="msg.type === 'system'" class="card-system">
            {{ msg.text }}
          </div>

          <div v-else-if="msg.type === 'expense'" class="chat-card-wrapper">
            <ion-card class="chat-smart-card card-expense" button>
              <ion-card-content>
                <div class="smart-card-header">
                  <span>💰</span>
                  <strong>{{ store.getUserName(msg.createdBy) }}</strong>
                  <span class="smart-card-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div v-if="getExpense(msg.referenceId)" class="smart-card-body">
                  <div class="expense-title">{{ getExpense(msg.referenceId)!.title }}</div>
                  <div class="expense-amount">{{ getExpense(msg.referenceId)!.amount.toLocaleString() }} ₽</div>
                  <div class="expense-split">
                    {{ getExpenseSplitText(getExpense(msg.referenceId)!) }}
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div v-else-if="msg.type === 'event'" class="chat-card-wrapper">
            <ion-card class="chat-smart-card card-event">
              <ion-card-content>
                <div class="smart-card-header">
                  <span>📅</span>
                  <strong>{{ store.getUserName(msg.createdBy) }}</strong>
                  <span class="smart-card-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div v-if="getEvent(msg.referenceId)" class="smart-card-body">
                  <div class="expense-title">{{ getEvent(msg.referenceId)!.title }}</div>
                  <div class="expense-split">
                    {{ getEvent(msg.referenceId)!.date }} в {{ getEvent(msg.referenceId)!.time }}
                  </div>
                  <div v-if="getEvent(msg.referenceId)!.location" class="expense-split">
                    📍 {{ getEvent(msg.referenceId)!.location }}
                  </div>
                  <div class="expense-split">🔔 Напоминание за {{ getEvent(msg.referenceId)!.reminderMinutes }} мин</div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div v-else-if="msg.type === 'poll'" class="chat-card-wrapper">
            <ion-card class="chat-smart-card card-poll">
              <ion-card-content>
                <div class="smart-card-header">
                  <span>📊</span>
                  <strong>{{ store.getUserName(msg.createdBy) }}</strong>
                  <span class="smart-card-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div v-if="getPoll(msg.referenceId)" class="poll-body">
                  <div class="expense-title">{{ getPoll(msg.referenceId)!.question }}</div>
                  <div v-for="(opt, i) in getPoll(msg.referenceId)!.options" :key="i" class="poll-option" @click="handleVote(msg.referenceId!, i)">
                    <div class="poll-option-bar" :style="{ width: pollPercent(msg.referenceId!, i) + '%' }" />
                    <span class="poll-option-text">{{ opt.text }}</span>
                    <span class="poll-option-count">{{ opt.votes.length }}</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div v-else class="chat-bubble-wrapper">
            <div class="chat-bubble" :class="msg.createdBy === currentUserId ? 'mine' : 'other'">
              <div v-if="msg.createdBy !== currentUserId" class="sender">{{ store.getUserName(msg.createdBy) }}</div>
              {{ msg.text }}
              <div class="bubble-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>
        </template>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar class="chat-input-toolbar">
        <div class="chat-input-row">
          <ion-button fill="clear" size="small" class="plus-btn" @click="showActions = !showActions">
            <ion-icon :icon="addCircleOutline" />
          </ion-button>
          <ion-input
            v-model="newMessage"
            placeholder="Сообщение..."
            class="chat-input"
            @keyup.enter="sendMessage"
          />
          <ion-button fill="clear" size="small" @click="sendMessage" :disabled="!newMessage.trim()">
            <ion-icon :icon="sendOutline" />
          </ion-button>
        </div>
        <div v-if="showActions" class="quick-actions">
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddExpense">
            💰 Трата
          </ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddEvent">
            📅 Событие
          </ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" disabled>
            📊 Опрос
          </ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" disabled>
            ✅ Задача
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- Add Expense Modal -->
    <ion-modal :is-open="showExpenseModal" @did-dismiss="showExpenseModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Новая трата</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showExpenseModal = false">Закрыть</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="expenseTitle" label="Что" label-placement="floating" placeholder="Такси, ужин..." />
        </ion-item>
        <ion-item>
          <ion-input v-model.number="expenseAmount" label="Сумма (₽)" label-placement="floating" type="number" placeholder="0" />
        </ion-item>
        <ion-item>
          <ion-select v-model="expenseCategory" label="Категория" label-placement="floating">
            <ion-select-option value="food">🍽 Еда</ion-select-option>
            <ion-select-option value="transport">🚗 Транспорт</ion-select-option>
            <ion-select-option value="housing">🏨 Жильё</ion-select-option>
            <ion-select-option value="fun">🎭 Развлечения</ion-select-option>
            <ion-select-option value="shopping">🛍 Покупки</ion-select-option>
            <ion-select-option value="other">📦 Другое</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select v-model="expenseType" label="Тип" label-placement="floating">
            <ion-select-option value="shared">👥 Общая</ion-select-option>
            <ion-select-option value="personal">👤 Личная</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="saveExpense" :disabled="!expenseTitle || !expenseAmount">
          Сохранить
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- Add Event Modal -->
    <ion-modal :is-open="showEventModal" @did-dismiss="showEventModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Новое событие</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEventModal = false">Закрыть</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="eventTitle" label="Что" label-placement="floating" placeholder="Завтрак, экскурсия..." />
        </ion-item>
        <ion-item>
          <ion-input v-model="eventDate" label="Дата" label-placement="floating" type="date" />
        </ion-item>
        <ion-item>
          <ion-input v-model="eventTime" label="Время" label-placement="floating" type="time" />
        </ion-item>
        <ion-item>
          <ion-input v-model="eventLocation" label="Место (необязательно)" label-placement="floating" />
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="saveEvent" :disabled="!eventTitle || !eventDate || !eventTime">
          Сохранить
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButtons, IonButton, IonBackButton, IonIcon, IonInput, IonBadge,
  IonCard, IonCardContent, IonModal, IonItem, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { addCircleOutline, sendOutline, peopleOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import type { Expense } from '../../types'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const chatMessages = computed(() => store.getTripMessages(tripId.value))
const currentUserId = computed(() => auth.user?.id ?? '')

const contentRef = ref()
const newMessage = ref('')
const showActions = ref(false)

const showExpenseModal = ref(false)
const expenseTitle = ref('')
const expenseAmount = ref<number>(0)
const expenseCategory = ref('food')
const expenseType = ref('shared')

const showEventModal = ref(false)
const eventTitle = ref('')
const eventDate = ref('')
const eventTime = ref('')
const eventLocation = ref('')

function getExpense(id?: string) {
  return id ? store.expenses.find(e => e.id === id) : undefined
}

function getEvent(id?: string) {
  return id ? store.events.find(e => e.id === id) : undefined
}

function getPoll(id?: string) {
  return id ? store.polls.find(p => p.id === id) : undefined
}

function getExpenseSplitText(exp: Expense) {
  if (exp.type === 'personal') return '👤 Личная трата'
  const n = exp.splits.length
  if (exp.splitMode === 'equal') return `На ${n} чел. · по ${Math.round(exp.amount / n).toLocaleString()} ₽`
  if (exp.splitMode === 'itemized') return `По позициям · ${n} чел.`
  return `На ${n} чел.`
}

function pollPercent(pollId: string, optIdx: number) {
  const poll = getPoll(pollId)
  if (!poll) return 0
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0)
  if (total === 0) return 0
  return (poll.options[optIdx].votes.length / total) * 100
}

function handleVote(pollId: string, optIdx: number) {
  store.votePoll(pollId, optIdx, currentUserId.value)
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return
  store.addMessage(tripId.value, text, currentUserId.value)
  newMessage.value = ''
  showActions.value = false
  scrollToBottom()
}

function openAddExpense() {
  showActions.value = false
  expenseTitle.value = ''
  expenseAmount.value = 0
  expenseCategory.value = 'food'
  expenseType.value = 'shared'
  showExpenseModal.value = true
}

function openAddEvent() {
  showActions.value = false
  eventTitle.value = ''
  eventDate.value = ''
  eventTime.value = ''
  eventLocation.value = ''
  showEventModal.value = true
}

function saveExpense() {
  if (!expenseTitle.value || !expenseAmount.value) return
  const members = trip.value?.members ?? []
  const isPersonal = expenseType.value === 'personal'
  const splits = isPersonal
    ? [{ userId: currentUserId.value, amount: expenseAmount.value }]
    : members.map(m => ({ userId: m.userId, amount: Math.round(expenseAmount.value / members.length) }))

  store.addExpense({
    tripId: tripId.value,
    title: expenseTitle.value,
    amount: expenseAmount.value,
    currency: '₽',
    category: expenseCategory.value as any,
    type: expenseType.value as any,
    splitMode: 'equal',
    source: 'personal_payment',
    paidBy: [{ userId: currentUserId.value, amount: expenseAmount.value }],
    splits,
    createdBy: currentUserId.value,
  })
  showExpenseModal.value = false
  scrollToBottom()
}

function saveEvent() {
  if (!eventTitle.value || !eventDate.value || !eventTime.value) return
  store.addEvent(tripId.value, eventTitle.value, eventDate.value, eventTime.value, eventLocation.value, currentUserId.value)
  showEventModal.value = false
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    contentRef.value?.$el?.scrollToBottom?.(300)
  })
}

watch(chatMessages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.chat-content {
  --background: #F3F4F6;
}

.chat-messages {
  padding: 8px 0 16px;
}

.chat-bubble-wrapper {
  display: flex;
  padding: 2px 8px;
}

.bubble-time {
  font-size: 11px;
  opacity: 0.6;
  text-align: right;
  margin-top: 4px;
}

.chat-card-wrapper {
  padding: 4px 8px;
}

.chat-smart-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.smart-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 6px;
}

.smart-card-time {
  margin-left: auto;
  font-size: 12px;
}

.smart-card-body {
  padding-left: 2px;
}

.expense-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.expense-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin: 4px 0;
}

.expense-split {
  font-size: 13px;
  color: #6B7280;
}

.poll-body {
  margin-top: 4px;
}

.poll-option {
  position: relative;
  padding: 10px 12px;
  margin: 6px 0;
  border-radius: 8px;
  background: #F3F4F6;
  cursor: pointer;
  overflow: hidden;
}

.poll-option-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(79, 70, 229, 0.15);
  border-radius: 8px;
  transition: width 0.3s ease;
}

.poll-option-text {
  position: relative;
  font-size: 14px;
}

.poll-option-count {
  position: relative;
  float: right;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.chat-input-toolbar {
  --background: white;
  padding: 4px 0;
}

.chat-input-row {
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.chat-input {
  flex: 1;
  --background: #F3F4F6;
  --border-radius: 20px;
  --padding-start: 14px;
  --padding-end: 14px;
  font-size: 15px;
}

.plus-btn {
  --color: var(--ion-color-primary);
  font-size: 24px;
}

.quick-actions {
  display: flex;
  gap: 6px;
  padding: 6px 12px;
  overflow-x: auto;
  flex-wrap: nowrap;
}
</style>
