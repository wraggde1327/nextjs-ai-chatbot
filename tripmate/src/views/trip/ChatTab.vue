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
          <div v-if="msg.type === 'system'" class="card-system">{{ msg.text }}</div>

          <!-- Expense card -->
          <div v-else-if="msg.type === 'expense' && getExpense(msg.referenceId)" class="chat-card-wrapper" @click="openCardActions(msg)">
            <div class="compact-card expense-card">
              <div class="compact-row">
                <span class="compact-icon">💰</span>
                <span class="compact-title">{{ getExpense(msg.referenceId)!.title }}</span>
                <span class="compact-amount">{{ getExpense(msg.referenceId)!.amount.toLocaleString() }} ₽</span>
              </div>
              <div class="compact-meta">
                {{ store.getUserName(msg.createdBy) }} · {{ getExpenseSplitText(getExpense(msg.referenceId)!) }}
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Event card -->
          <div v-else-if="msg.type === 'event' && getEvent(msg.referenceId)" class="chat-card-wrapper" @click="openCardActions(msg)">
            <div class="compact-card event-card">
              <div class="compact-row">
                <span class="compact-icon">📅</span>
                <span class="compact-title">{{ getEvent(msg.referenceId)!.title }}</span>
                <span class="compact-amount">{{ getEvent(msg.referenceId)!.time }}</span>
              </div>
              <div class="compact-meta">
                {{ formatEventDate(getEvent(msg.referenceId)!.date) }}
                <template v-if="getEvent(msg.referenceId)!.location"> · 📍 {{ getEvent(msg.referenceId)!.location }}</template>
                · 🔔 {{ getEvent(msg.referenceId)!.reminderMinutes }} мин
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Poll card -->
          <div v-else-if="msg.type === 'poll' && getPoll(msg.referenceId)" class="chat-card-wrapper">
            <div class="compact-card poll-card">
              <div class="compact-row" @click="openCardActions(msg)">
                <span class="compact-icon">📊</span>
                <span class="compact-title">{{ getPoll(msg.referenceId)!.question }}</span>
              </div>
              <div class="poll-options">
                <div
                  v-for="(opt, i) in getPoll(msg.referenceId)!.options" :key="i"
                  class="poll-option"
                  :class="{ voted: opt.votes.includes(currentUserId) }"
                  @click="handleVote(msg.referenceId!, i)"
                >
                  <div class="poll-option-bar" :style="{ width: pollPercent(msg.referenceId!, i) + '%' }" />
                  <span class="poll-option-text">{{ opt.text }}</span>
                  <span class="poll-option-count">{{ opt.votes.length }}</span>
                </div>
              </div>
              <div class="compact-meta">
                {{ store.getUserName(msg.createdBy) }}
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Task card -->
          <div v-else-if="msg.type === 'task' && getTask(msg.referenceId)" class="chat-card-wrapper" @click="openCardActions(msg)">
            <div class="compact-card task-card">
              <div class="compact-row">
                <span class="compact-icon">{{ getTask(msg.referenceId)!.isCompleted ? '✅' : '☑️' }}</span>
                <span class="compact-title" :class="{ 'task-done': getTask(msg.referenceId)!.isCompleted }">{{ getTask(msg.referenceId)!.title }}</span>
              </div>
              <div class="compact-meta">
                {{ store.getUserName(msg.createdBy) }}
                <template v-if="getTask(msg.referenceId)!.assigneeId"> · 👤 {{ store.getUserName(getTask(msg.referenceId)!.assigneeId!) }}</template>
                · {{ getTask(msg.referenceId)!.section }}
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Text message -->
          <div v-else-if="msg.type === 'text'" class="chat-bubble-wrapper">
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
            <ion-icon :icon="showActions ? closeCircleOutline : addCircleOutline" />
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
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddPoll">
            📊 Опрос
          </ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddTask">
            ✅ Задача
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- ========== Expense Modal ========== -->
    <ion-modal :is-open="showExpenseModal" @did-dismiss="showExpenseModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start"><ion-button @click="showExpenseModal = false">Отмена</ion-button></ion-buttons>
          <ion-title>{{ editingExpenseId ? 'Редактировать' : 'Новая трата' }}</ion-title>
          <ion-buttons slot="end"><ion-button @click="saveExpense" :disabled="!expenseTitle || !expenseAmount" strong>Сохранить</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="expenseTitle" label="Что" label-placement="floating" placeholder="Такси, ужин..." />
        </ion-item>
        <ion-item>
          <ion-input v-model.number="expenseAmount" label="Сумма (₽)" label-placement="floating" type="number" placeholder="0" inputmode="numeric" />
        </ion-item>
        <ion-item>
          <ion-select v-model="expenseCategory" label="Категория" label-placement="floating" interface="action-sheet">
            <ion-select-option value="food">🍽 Еда</ion-select-option>
            <ion-select-option value="transport">🚗 Транспорт</ion-select-option>
            <ion-select-option value="housing">🏨 Жильё</ion-select-option>
            <ion-select-option value="fun">🎭 Развлечения</ion-select-option>
            <ion-select-option value="shopping">🛍 Покупки</ion-select-option>
            <ion-select-option value="other">📦 Другое</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select v-model="expenseType" label="Тип" label-placement="floating" interface="action-sheet">
            <ion-select-option value="shared">👥 Общая</ion-select-option>
            <ion-select-option value="personal">👤 Личная</ion-select-option>
          </ion-select>
        </ion-item>

        <template v-if="expenseType === 'shared'">
          <div class="section-header">Делим на</div>
          <ion-segment v-model="expenseSplitMode" class="split-segment">
            <ion-segment-button value="equal_all">
              <ion-label>Все</ion-label>
            </ion-segment-button>
            <ion-segment-button value="equal_selected">
              <ion-label>Выбрать</ion-label>
            </ion-segment-button>
            <ion-segment-button value="custom">
              <ion-label>Суммы</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- Preview for equal_all -->
          <div v-if="expenseSplitMode === 'equal_all' && expenseAmount && trip" class="split-preview">
            👥 {{ trip.members.length }} чел. · по {{ Math.round(expenseAmount / trip.members.length).toLocaleString() }} ₽
          </div>

          <!-- Select participants -->
          <div v-if="expenseSplitMode === 'equal_selected'" class="participants-list">
            <ion-item v-for="m in trip?.members" :key="m.userId" lines="none" class="participant-item">
              <ion-checkbox
                slot="start"
                :checked="selectedMembers.includes(m.userId)"
                @ion-change="toggleMember(m.userId)"
              />
              <ion-label>{{ store.getUserName(m.userId) }}</ion-label>
              <ion-note v-if="selectedMembers.includes(m.userId) && selectedMembers.length && expenseAmount" slot="end" color="primary">
                {{ Math.round(expenseAmount / selectedMembers.length).toLocaleString() }} ₽
              </ion-note>
            </ion-item>
            <div v-if="selectedMembers.length && expenseAmount" class="split-preview">
              👥 {{ selectedMembers.length }} чел. · по {{ Math.round(expenseAmount / selectedMembers.length).toLocaleString() }} ₽
            </div>
            <div v-else-if="!selectedMembers.length" class="split-hint">
              Выберите участников
            </div>
          </div>

          <!-- Custom amounts -->
          <div v-if="expenseSplitMode === 'custom'" class="custom-amounts">
            <ion-item v-for="m in trip?.members" :key="m.userId">
              <ion-label>{{ store.getUserName(m.userId) }}</ion-label>
              <ion-input
                slot="end"
                type="number" inputmode="numeric"
                :value="customAmounts[m.userId] || 0"
                @ion-input="customAmounts[m.userId] = Number(($event.target as any)?.value || 0)"
                style="text-align:right;max-width:100px"
              />
              <ion-note slot="end">₽</ion-note>
            </ion-item>
            <div class="split-preview" :class="{ 'split-error': customTotal !== expenseAmount }">
              Итого: {{ customTotal.toLocaleString() }} / {{ (expenseAmount || 0).toLocaleString() }} ₽
              <template v-if="customTotal !== expenseAmount"> · Разница: {{ (expenseAmount - customTotal).toLocaleString() }} ₽</template>
            </div>
          </div>
        </template>
      </ion-content>
    </ion-modal>

    <!-- ========== Event Modal ========== -->
    <ion-modal :is-open="showEventModal" @did-dismiss="showEventModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start"><ion-button @click="showEventModal = false">Отмена</ion-button></ion-buttons>
          <ion-title>{{ editingEventId ? 'Редактировать' : 'Новое событие' }}</ion-title>
          <ion-buttons slot="end"><ion-button @click="saveEvent" :disabled="!eventTitle || !eventDate || !eventTime" strong>Сохранить</ion-button></ion-buttons>
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
      </ion-content>
    </ion-modal>

    <!-- ========== Poll Modal ========== -->
    <ion-modal :is-open="showPollModal" @did-dismiss="showPollModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start"><ion-button @click="showPollModal = false">Отмена</ion-button></ion-buttons>
          <ion-title>Новый опрос</ion-title>
          <ion-buttons slot="end"><ion-button @click="savePoll" :disabled="!pollQuestion || pollOptions.filter(o => o.trim()).length < 2" strong>Создать</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="pollQuestion" label="Вопрос" label-placement="floating" placeholder="Где ужинаем?" />
        </ion-item>
        <div class="section-header">Варианты ответов</div>
        <ion-item v-for="(_, i) in pollOptions" :key="i">
          <ion-input v-model="pollOptions[i]" :label="'Вариант ' + (i + 1)" label-placement="floating" :placeholder="'Вариант ' + (i + 1)" />
          <ion-button v-if="pollOptions.length > 2" fill="clear" slot="end" @click="pollOptions.splice(i, 1)">✕</ion-button>
        </ion-item>
        <ion-button v-if="pollOptions.length < 6" fill="clear" expand="block" @click="pollOptions.push('')">
          + Добавить вариант
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- ========== Task Modal ========== -->
    <ion-modal :is-open="showTaskModal" @did-dismiss="showTaskModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start"><ion-button @click="showTaskModal = false">Отмена</ion-button></ion-buttons>
          <ion-title>{{ editingTaskId ? 'Редактировать' : 'Новая задача' }}</ion-title>
          <ion-buttons slot="end"><ion-button @click="saveTask" :disabled="!taskTitle" strong>{{ editingTaskId ? 'Сохранить' : 'Создать' }}</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="taskTitle" label="Задача" label-placement="floating" placeholder="Что нужно сделать" />
        </ion-item>
        <ion-item>
          <ion-select v-model="taskSection" label="Секция" label-placement="floating" interface="action-sheet">
            <ion-select-option v-for="s in sections" :key="s" :value="s">{{ s }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select v-model="taskAssignee" label="Ответственный" label-placement="floating" interface="action-sheet">
            <ion-select-option value="">Все</ion-select-option>
            <ion-select-option v-for="m in trip?.members" :key="m.userId" :value="m.userId">
              {{ store.getUserName(m.userId) }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- ========== Action Sheet ========== -->
    <ion-action-sheet
      :is-open="showActionSheet"
      :header="actionSheetHeader"
      :buttons="actionSheetButtons"
      @did-dismiss="showActionSheet = false"
    />

    <!-- ========== Delete Confirm ========== -->
    <ion-alert
      :is-open="showDeleteConfirm"
      header="Удалить?"
      message="Это действие нельзя отменить."
      :buttons="deleteConfirmButtons"
      @did-dismiss="showDeleteConfirm = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButtons, IonButton, IonBackButton, IonIcon, IonInput, IonBadge,
  IonModal, IonItem, IonSelect, IonSelectOption, IonCheckbox, IonLabel, IonNote,
  IonSegment, IonSegmentButton, IonActionSheet, IonAlert,
} from '@ionic/vue'
import { addCircleOutline, closeCircleOutline, sendOutline, peopleOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import type { Expense, ChatMessage } from '../../types'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const chatMessages = computed(() => store.getTripMessages(tripId.value))
const currentUserId = computed(() => auth.user?.id ?? '')
const sections = computed(() => {
  const s = store.getTaskSections(tripId.value)
  return s.length ? s : ['До поездки', 'Что взять', 'В поездке']
})

const contentRef = ref()
const newMessage = ref('')
const showActions = ref(false)

// Expense form
const showExpenseModal = ref(false)
const editingExpenseId = ref<string | null>(null)
const expenseTitle = ref('')
const expenseAmount = ref<number>(0)
const expenseCategory = ref('food')
const expenseType = ref('shared')
const expenseSplitMode = ref('equal_all')
const selectedMembers = ref<string[]>([])
const customAmounts = reactive<Record<string, number>>({})
const customTotal = computed(() => Object.values(customAmounts).reduce((s, v) => s + (v || 0), 0))

// Event form
const showEventModal = ref(false)
const editingEventId = ref<string | null>(null)
const eventTitle = ref('')
const eventDate = ref('')
const eventTime = ref('')
const eventLocation = ref('')

// Poll form
const showPollModal = ref(false)
const pollQuestion = ref('')
const pollOptions = ref<string[]>(['', ''])

// Task form
const showTaskModal = ref(false)
const editingTaskId = ref<string | null>(null)
const taskTitle = ref('')
const taskSection = ref('До поездки')
const taskAssignee = ref('')

// Action sheet / Delete confirm
const showActionSheet = ref(false)
const actionSheetHeader = ref('')
const actionSheetButtons = ref<any[]>([])
const showDeleteConfirm = ref(false)
const deleteConfirmButtons = ref<any[]>([])
const pendingDeleteAction = ref<(() => void) | null>(null)

function getExpense(id?: string) { return id ? store.expenses.find(e => e.id === id && !e.isDeleted) : undefined }
function getEvent(id?: string) { return id ? store.events.find(e => e.id === id) : undefined }
function getPoll(id?: string) { return id ? store.polls.find(p => p.id === id) : undefined }
function getTask(id?: string) { return id ? store.tasks.find(t => t.id === id) : undefined }

function getExpenseSplitText(exp: Expense) {
  if (exp.type === 'personal') return '👤 Личная'
  const n = exp.splits.length
  if (exp.splitMode === 'equal') return `${n} чел. · по ${Math.round(exp.amount / n).toLocaleString()} ₽`
  if (exp.splitMode === 'itemized') return `По позициям · ${n} чел.`
  if (exp.splitMode === 'selected') return `${n} из ${trip.value?.members.length ?? n} чел.`
  if (exp.splitMode === 'custom') return `Свои суммы · ${n} чел.`
  return `${n} чел.`
}

function pollPercent(pollId: string, optIdx: number) {
  const poll = getPoll(pollId)
  if (!poll) return 0
  const total = poll.options.reduce((s, o) => s + o.votes.length, 0)
  return total === 0 ? 0 : (poll.options[optIdx].votes.length / total) * 100
}

function handleVote(pollId: string, optIdx: number) { store.votePoll(pollId, optIdx, currentUserId.value) }

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function toggleMember(userId: string) {
  const idx = selectedMembers.value.indexOf(userId)
  if (idx >= 0) selectedMembers.value.splice(idx, 1)
  else selectedMembers.value.push(userId)
}

// ===== Card Actions (Edit/Delete) =====
function openCardActions(msg: ChatMessage) {
  const buttons: any[] = []
  if (msg.type === 'expense' && msg.referenceId) {
    const exp = getExpense(msg.referenceId)
    if (!exp) return
    actionSheetHeader.value = exp.title
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditExpense(exp) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteExpense(exp.id)) })
  } else if (msg.type === 'event' && msg.referenceId) {
    const evt = getEvent(msg.referenceId)
    if (!evt) return
    actionSheetHeader.value = evt.title
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditEvent(evt) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteEvent(evt.id)) })
  } else if (msg.type === 'task' && msg.referenceId) {
    const task = getTask(msg.referenceId)
    if (!task) return
    actionSheetHeader.value = task.title
    buttons.push({ text: task.isCompleted ? '↩️ Вернуть' : '✅ Выполнить', handler: () => store.toggleTask(task.id, currentUserId.value) })
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditTask(task) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteTask(task.id)) })
  } else if (msg.type === 'poll' && msg.referenceId) {
    const poll = getPoll(msg.referenceId)
    if (!poll) return
    actionSheetHeader.value = poll.question
    buttons.push({ text: '🗑 Удалить опрос', role: 'destructive', handler: () => confirmDelete(() => store.deletePoll(poll.id)) })
  } else {
    return
  }
  buttons.push({ text: 'Отмена', role: 'cancel' })
  actionSheetButtons.value = buttons
  showActionSheet.value = true
}

function confirmDelete(action: () => void) {
  pendingDeleteAction.value = action
  deleteConfirmButtons.value = [
    { text: 'Отмена', role: 'cancel' },
    { text: 'Удалить', role: 'destructive', handler: () => { action(); pendingDeleteAction.value = null } },
  ]
  showDeleteConfirm.value = true
}

// ===== Edit Expense =====
function openEditExpense(exp: Expense) {
  editingExpenseId.value = exp.id
  expenseTitle.value = exp.title
  expenseAmount.value = exp.amount
  expenseCategory.value = exp.category
  expenseType.value = exp.type
  if (exp.type === 'personal') {
    expenseSplitMode.value = 'equal_all'
    selectedMembers.value = []
  } else if (exp.splitMode === 'selected') {
    expenseSplitMode.value = 'equal_selected'
    selectedMembers.value = exp.splits.map(s => s.userId)
  } else if (exp.splitMode === 'custom' || exp.splitMode === 'itemized') {
    expenseSplitMode.value = 'custom'
    selectedMembers.value = []
    Object.keys(customAmounts).forEach(k => delete customAmounts[k])
    exp.splits.forEach(s => { customAmounts[s.userId] = s.amount })
    trip.value?.members.forEach(m => { if (!(m.userId in customAmounts)) customAmounts[m.userId] = 0 })
  } else {
    expenseSplitMode.value = 'equal_all'
    selectedMembers.value = []
  }
  showExpenseModal.value = true
}

// ===== Edit Event =====
function openEditEvent(evt: { id: string; title: string; date: string; time: string; location?: string }) {
  editingEventId.value = evt.id
  eventTitle.value = evt.title
  eventDate.value = evt.date
  eventTime.value = evt.time
  eventLocation.value = evt.location ?? ''
  showEventModal.value = true
}

// ===== Edit Task =====
function openEditTask(task: { id: string; title: string; section: string; assigneeId?: string }) {
  editingTaskId.value = task.id
  taskTitle.value = task.title
  taskSection.value = task.section
  taskAssignee.value = task.assigneeId ?? ''
  showTaskModal.value = true
}

// ===== Send/Create =====
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
  editingExpenseId.value = null
  expenseTitle.value = ''
  expenseAmount.value = 0
  expenseCategory.value = 'food'
  expenseType.value = 'shared'
  expenseSplitMode.value = 'equal_all'
  selectedMembers.value = trip.value?.members.map(m => m.userId) ?? []
  Object.keys(customAmounts).forEach(k => delete customAmounts[k])
  trip.value?.members.forEach(m => { customAmounts[m.userId] = 0 })
  showExpenseModal.value = true
}

function openAddEvent() {
  showActions.value = false
  editingEventId.value = null
  eventTitle.value = ''
  eventDate.value = ''
  eventTime.value = ''
  eventLocation.value = ''
  showEventModal.value = true
}

function openAddPoll() {
  showActions.value = false
  pollQuestion.value = ''
  pollOptions.value = ['', '']
  showPollModal.value = true
}

function openAddTask() {
  showActions.value = false
  editingTaskId.value = null
  taskTitle.value = ''
  taskSection.value = sections.value[0] || 'До поездки'
  taskAssignee.value = ''
  showTaskModal.value = true
}

function saveExpense() {
  if (!expenseTitle.value || !expenseAmount.value) return
  const members = trip.value?.members ?? []
  const isPersonal = expenseType.value === 'personal'
  let splits: { userId: string; amount: number }[]
  let splitMode: 'equal' | 'selected' | 'custom' = 'equal'

  if (isPersonal) {
    splits = [{ userId: currentUserId.value, amount: expenseAmount.value }]
  } else if (expenseSplitMode.value === 'equal_selected') {
    splitMode = 'selected'
    const sel = selectedMembers.value.length > 0 ? selectedMembers.value : members.map(m => m.userId)
    splits = sel.map(uid => ({ userId: uid, amount: Math.round(expenseAmount.value / sel.length) }))
  } else if (expenseSplitMode.value === 'custom') {
    splitMode = 'custom'
    splits = members.filter(m => (customAmounts[m.userId] || 0) > 0)
      .map(m => ({ userId: m.userId, amount: customAmounts[m.userId] }))
  } else {
    splits = members.map(m => ({ userId: m.userId, amount: Math.round(expenseAmount.value / members.length) }))
  }

  if (editingExpenseId.value) {
    store.updateExpense(editingExpenseId.value, {
      title: expenseTitle.value,
      amount: expenseAmount.value,
      category: expenseCategory.value as any,
      type: expenseType.value as any,
      splitMode,
      splits,
    })
  } else {
    store.addExpense({
      tripId: tripId.value,
      title: expenseTitle.value,
      amount: expenseAmount.value,
      currency: '₽',
      category: expenseCategory.value as any,
      type: expenseType.value as any,
      splitMode,
      source: 'personal_payment',
      paidBy: [{ userId: currentUserId.value, amount: expenseAmount.value }],
      splits,
      createdBy: currentUserId.value,
    })
  }
  showExpenseModal.value = false
  scrollToBottom()
}

function saveEvent() {
  if (!eventTitle.value || !eventDate.value || !eventTime.value) return
  if (editingEventId.value) {
    store.updateEvent(editingEventId.value, {
      title: eventTitle.value,
      date: eventDate.value,
      time: eventTime.value,
      location: eventLocation.value || undefined,
    })
  } else {
    store.addEvent(tripId.value, eventTitle.value, eventDate.value, eventTime.value, eventLocation.value, currentUserId.value)
  }
  showEventModal.value = false
  scrollToBottom()
}

function savePoll() {
  const validOptions = pollOptions.value.filter(o => o.trim())
  if (!pollQuestion.value || validOptions.length < 2) return
  store.addPoll(tripId.value, pollQuestion.value, validOptions, currentUserId.value)
  showPollModal.value = false
  scrollToBottom()
}

function saveTask() {
  if (!taskTitle.value) return
  if (editingTaskId.value) {
    store.updateTask(editingTaskId.value, {
      title: taskTitle.value,
      section: taskSection.value,
      assigneeId: taskAssignee.value || undefined,
    })
  } else {
    store.addTaskFromChat(tripId.value, taskTitle.value, taskSection.value, taskAssignee.value || undefined, currentUserId.value)
  }
  showTaskModal.value = false
  scrollToBottom()
}

function scrollToBottom() { nextTick(() => { contentRef.value?.$el?.scrollToBottom?.(300) }) }
watch(chatMessages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.chat-content { --background: #F3F4F6; }
.chat-messages { padding: 8px 0 16px; }
.chat-bubble-wrapper { display: flex; padding: 2px 8px; }
.bubble-time { font-size: 11px; opacity: 0.6; text-align: right; margin-top: 2px; }

.chat-card-wrapper { padding: 3px 8px; cursor: pointer; }
.chat-card-wrapper:active .compact-card { opacity: 0.8; transform: scale(0.98); }

.compact-card {
  background: white;
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-left: 4px solid #D1D5DB;
  transition: opacity 0.15s, transform 0.15s;
}
.expense-card { border-left-color: #10B981; }
.event-card { border-left-color: #4F46E5; }
.poll-card { border-left-color: #F59E0B; }
.task-card { border-left-color: #8B5CF6; }

.compact-row { display: flex; align-items: center; gap: 8px; }
.compact-icon { font-size: 16px; flex-shrink: 0; }
.compact-title { flex: 1; font-size: 14px; font-weight: 600; color: #1F2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.compact-amount { font-size: 15px; font-weight: 700; color: var(--ion-color-primary); flex-shrink: 0; }

.compact-meta { font-size: 12px; color: #9CA3AF; margin-top: 3px; padding-left: 24px; }
.compact-time { float: right; }

.task-done { text-decoration: line-through; opacity: 0.5; }

.poll-options { margin: 6px 0 4px; }
.poll-option {
  position: relative; padding: 8px 10px; margin: 4px 0;
  border-radius: 8px; background: #F3F4F6; cursor: pointer;
  overflow: hidden; font-size: 13px;
}
.poll-option.voted { background: #EEF2FF; }
.poll-option-bar {
  position: absolute; top: 0; left: 0; height: 100%;
  background: rgba(79, 70, 229, 0.12); border-radius: 8px; transition: width 0.3s ease;
}
.poll-option-text { position: relative; }
.poll-option-count { position: relative; float: right; font-weight: 600; color: var(--ion-color-primary); }

.chat-input-toolbar { --background: white; padding: 4px 0; }
.chat-input-row { display: flex; align-items: center; padding: 0 4px; }
.chat-input {
  flex: 1; --background: #F3F4F6; --border-radius: 20px;
  --padding-start: 14px; --padding-end: 14px; font-size: 15px;
}
.plus-btn { --color: var(--ion-color-primary); font-size: 24px; }
.quick-actions { display: flex; gap: 6px; padding: 6px 12px; overflow-x: auto; }

.split-segment { margin: 8px 0; }
.participants-list { margin: 8px 0; }
.participant-item { --min-height: 44px; }
.custom-amounts { margin: 8px 0; }
.split-preview {
  padding: 8px 16px; font-size: 13px;
  color: var(--ion-color-primary); font-weight: 600;
}
.split-hint {
  padding: 8px 16px; font-size: 13px; color: #9CA3AF;
}
.split-error { color: var(--ion-color-danger); }
</style>
