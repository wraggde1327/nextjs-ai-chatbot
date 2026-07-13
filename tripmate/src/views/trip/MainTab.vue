<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="" />
        </ion-buttons>
        <ion-title>{{ trip?.countryFlag }} {{ trip?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showMembersSheet = true">
            <ion-icon :icon="peopleOutline" />
            <ion-badge color="primary" style="margin-left:4px">{{ activeMembers.length }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" class="main-content">
      <!-- Upcoming events strip -->
      <div v-if="upcomingEvents.length" class="events-strip">
        <div class="events-strip-header">
          <span class="events-strip-title">📅 Ближайшее</span>
          <ion-button fill="clear" size="small" router-link="today" router-direction="forward">Всё →</ion-button>
        </div>
        <div class="events-list">
          <div
            v-for="evt in upcomingEvents" :key="evt.id"
            class="event-mini"
            :class="{ 'event-today': evt.date === today }"
          >
            <div class="event-mini-date">{{ formatEventDateShort(evt.date) }}</div>
            <div class="event-mini-time">{{ evt.time }}</div>
            <div class="event-mini-info">
              <div class="event-mini-title">{{ evt.title }}</div>
              <div v-if="evt.location" class="event-mini-loc">📍 {{ evt.location }}</div>
            </div>
          </div>
        </div>
      </div>

    <!-- Quick stats -->
    <div class="quick-stats">
      <div class="quick-stat" @click="openBudgetModal">
        <span class="qs-icon">💰</span>
        <template v-if="trip?.budget">
          <span class="qs-value">{{ budgetPct }}%</span>
          <span class="qs-label">бюджета</span>
        </template>
        <template v-else>
          <span class="qs-value">+</span>
          <span class="qs-label">бюджет</span>
        </template>
      </div>
      <div class="quick-stat">
        <span class="qs-icon">✅</span>
        <span class="qs-value">{{ completedTasks }}/{{ totalTasks }}</span>
        <span class="qs-label">дел</span>
      </div>
      <div class="quick-stat" v-if="transfers.length">
        <span class="qs-icon">🔄</span>
        <span class="qs-value">{{ transfers.length }}</span>
        <span class="qs-label">{{ transfersLabel }}</span>
      </div>
      <div class="quick-stat" v-if="daysInfo">
        <span class="qs-icon">🗓</span>
        <span class="qs-value">{{ daysInfo.value }}</span>
        <span class="qs-label">{{ daysInfo.label }}</span>
      </div>
    </div>

      <!-- Chat feed -->
      <div class="chat-messages">
        <template v-for="msg in chatMessages" :key="msg.id">
          <div v-if="msg.type === 'system'" class="card-system">{{ msg.text }}</div>

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
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="msg.type === 'poll' && getPoll(msg.referenceId)" class="chat-card-wrapper">
            <div class="compact-card poll-card">
              <div class="compact-row" @click="openCardActions(msg)">
                <span class="compact-icon">📊</span>
                <span class="compact-title">{{ getPoll(msg.referenceId)!.question }}</span>
              </div>
              <div class="poll-options">
                <div
                  v-for="(opt, i) in getPoll(msg.referenceId)!.options" :key="i"
                  class="poll-option" :class="{ voted: opt.votes.includes(currentUserId) }"
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

          <div v-else-if="msg.type === 'task' && getTask(msg.referenceId)" class="chat-card-wrapper" @click="openCardActions(msg)">
            <div class="compact-card task-card">
              <div class="compact-row">
                <span class="compact-icon">{{ getTask(msg.referenceId)!.isCompleted ? '✅' : '☑️' }}</span>
                <span class="compact-title" :class="{ 'task-done': getTask(msg.referenceId)!.isCompleted }">{{ getTask(msg.referenceId)!.title }}</span>
              </div>
              <div class="compact-meta">
                {{ store.getUserName(msg.createdBy) }}
                <template v-if="getTask(msg.referenceId)!.assigneeId"> · 👤 {{ store.getUserName(getTask(msg.referenceId)!.assigneeId!) }}</template>
                <span class="compact-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

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
          <ion-input v-model="newMessage" placeholder="Сообщение..." class="chat-input" @keyup.enter="sendMessage" />
          <ion-button fill="clear" size="small" @click="sendMessage" :disabled="!newMessage.trim()">
            <ion-icon :icon="sendOutline" />
          </ion-button>
        </div>
        <div v-if="showActions" class="quick-actions">
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddExpense">💰 Трата</ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddEvent">📅 Событие</ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddPoll">📊 Опрос</ion-button>
          <ion-button size="small" class="quick-action-btn" fill="outline" @click="openAddTask">✅ Задача</ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- ========== Expense Modal ========== -->
    <ion-modal :is-open="showExpenseModal" @did-dismiss="showExpenseModal = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showExpenseModal = false">Отмена</ion-button></ion-buttons>
        <ion-title>{{ editingExpenseId ? 'Редактировать' : 'Новая трата' }}</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveExpense" :disabled="!expenseTitle || !expenseAmount" strong>Сохранить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="expenseTitle" label="Что" label-placement="floating" placeholder="Такси, ужин..." /></ion-item>
        <ion-item><ion-input v-model.number="expenseAmount" label="Сумма (₽)" label-placement="floating" type="number" placeholder="0" inputmode="numeric" /></ion-item>
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
            <ion-segment-button value="equal_all"><ion-label>Все поровну</ion-label></ion-segment-button>
            <ion-segment-button value="select"><ion-label>Выбрать</ion-label></ion-segment-button>
          </ion-segment>
          <div v-if="expenseSplitMode === 'equal_all' && expenseAmount && activeMembers.length" class="split-preview">
            👥 {{ activeMembers.length }} чел. · по {{ Math.round(expenseAmount / activeMembers.length).toLocaleString() }} ₽
          </div>
          <div v-if="expenseSplitMode === 'select'" class="participants-list">
            <div v-for="m in activeMembers" :key="m.userId" class="split-member-row">
              <ion-checkbox :checked="selectedMembers.includes(m.userId)" @ion-change="toggleMember(m.userId)" />
              <span class="split-member-name" :class="{ 'split-member-off': !selectedMembers.includes(m.userId) }">{{ store.getUserName(m.userId) }}</span>
              <div class="split-amount-box" v-if="selectedMembers.includes(m.userId)">
                <input
                  type="number" inputmode="numeric" class="split-amount-input"
                  :value="customAmounts[m.userId] ?? 0"
                  @input="onCustomInput(m.userId, $event)"
                />
                <span class="split-amount-currency">₽</span>
              </div>
            </div>
            <div v-if="selectedMembers.length && expenseAmount" class="split-preview" :class="{ 'split-error': customTotal !== expenseAmount }">
              Итого: {{ customTotal.toLocaleString() }} / {{ (expenseAmount || 0).toLocaleString() }} ₽
              <template v-if="customTotal === expenseAmount"> ✓</template>
              <template v-else> · Разница: {{ (expenseAmount - customTotal).toLocaleString() }} ₽</template>
            </div>
            <div v-if="selectedMembers.length > 1 && expenseAmount" style="padding:0 16px 4px">
              <ion-button fill="clear" size="small" @click="distributeEqual">Поровну между выбранными</ion-button>
            </div>
            <div v-if="!selectedMembers.length" class="split-hint">Выберите участников</div>
          </div>
        </template>
      </ion-content>
    </ion-modal>

    <!-- ========== Event Modal ========== -->
    <ion-modal :is-open="showEventModal" @did-dismiss="showEventModal = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showEventModal = false">Отмена</ion-button></ion-buttons>
        <ion-title>{{ editingEventId ? 'Редактировать' : 'Новое событие' }}</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveEvent" :disabled="!eventTitle || !eventDate || !eventTime" strong>Сохранить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="eventTitle" label="Что" label-placement="floating" placeholder="Завтрак, экскурсия..." /></ion-item>
        <ion-item><ion-input v-model="eventDate" label="Дата" label-placement="floating" type="date" /></ion-item>
        <ion-item><ion-input v-model="eventTime" label="Время" label-placement="floating" type="time" /></ion-item>
        <ion-item><ion-input v-model="eventLocation" label="Место (необязательно)" label-placement="floating" /></ion-item>
      </ion-content>
    </ion-modal>

    <!-- ========== Poll Modal ========== -->
    <ion-modal :is-open="showPollModal" @did-dismiss="showPollModal = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showPollModal = false">Отмена</ion-button></ion-buttons>
        <ion-title>Новый опрос</ion-title>
        <ion-buttons slot="end"><ion-button @click="savePoll" :disabled="!pollQuestion || pollOptions.filter(o => o.trim()).length < 2" strong>Создать</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="pollQuestion" label="Вопрос" label-placement="floating" placeholder="Где ужинаем?" /></ion-item>
        <div class="section-header">Варианты ответов</div>
        <ion-item v-for="(_, i) in pollOptions" :key="i">
          <ion-input v-model="pollOptions[i]" :label="'Вариант ' + (i + 1)" label-placement="floating" />
          <ion-button v-if="pollOptions.length > 2" fill="clear" slot="end" @click="pollOptions.splice(i, 1)">✕</ion-button>
        </ion-item>
        <ion-button v-if="pollOptions.length < 6" fill="clear" expand="block" @click="pollOptions.push('')">+ Добавить вариант</ion-button>
      </ion-content>
    </ion-modal>

    <!-- ========== Task Modal ========== -->
    <ion-modal :is-open="showTaskModal" @did-dismiss="showTaskModal = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showTaskModal = false">Отмена</ion-button></ion-buttons>
        <ion-title>{{ editingTaskId ? 'Редактировать' : 'Новая задача' }}</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveTask" :disabled="!taskTitle" strong>{{ editingTaskId ? 'Сохранить' : 'Создать' }}</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="taskTitle" label="Задача" label-placement="floating" placeholder="Что нужно сделать" /></ion-item>
        <ion-item>
          <ion-select v-model="taskSection" label="Секция" label-placement="floating" interface="action-sheet">
            <ion-select-option v-for="s in sections" :key="s" :value="s">{{ s }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select v-model="taskAssignee" label="Ответственный" label-placement="floating" interface="action-sheet">
            <ion-select-option value="">Все</ion-select-option>
            <ion-select-option v-for="m in activeMembers" :key="m.userId" :value="m.userId">{{ store.getUserName(m.userId) }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Members Sheet -->
    <ion-modal :is-open="showMembersSheet" @did-dismiss="showMembersSheet = false" :initial-breakpoint="0.5" :breakpoints="[0, 0.5, 0.85]">
      <ion-header><ion-toolbar>
        <ion-title>Участники</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddMemberModal = true">
            <ion-icon :icon="addCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <div class="section-header">Активные ({{ activeMembers.length }})</div>
        <ion-list>
          <ion-item v-for="m in activeMembers" :key="m.userId">
            <ion-avatar slot="start" class="member-avatar"><div class="avatar-letter">{{ store.getUserName(m.userId)[0] }}</div></ion-avatar>
            <ion-label>
              <h3>{{ store.getUserName(m.userId) }} <span v-if="walletName(m.userId)" class="wallet-badge">{{ walletName(m.userId) }}</span></h3>
              <p>{{ m.role === 'organizer' ? '👑 Организатор' : 'Участник' }}</p>
            </ion-label>
            <ion-button v-if="m.role !== 'organizer'" fill="clear" slot="end" color="medium" @click="confirmRemoveMember(m.userId)">
              <ion-icon :icon="removeCircleOutline" />
            </ion-button>
          </ion-item>
        </ion-list>
        <template v-if="leftMembers.length">
          <div class="section-header">Вышли ({{ leftMembers.length }})</div>
          <ion-list>
            <ion-item v-for="m in leftMembers" :key="m.userId" class="left-member">
              <ion-avatar slot="start" class="member-avatar member-avatar-left"><div class="avatar-letter">{{ store.getUserName(m.userId)[0] }}</div></ion-avatar>
              <ion-label>
                <h3>{{ store.getUserName(m.userId) }}</h3>
                <p>Покинул(а) {{ formatShortDate(m.leftAt!) }}</p>
              </ion-label>
              <ion-button fill="clear" slot="end" color="primary" @click="store.restoreMember(tripId, m.userId)">
                <ion-icon :icon="addCircleOutline" />
              </ion-button>
            </ion-item>
          </ion-list>
        </template>
      </ion-content>
    </ion-modal>

    <!-- Budget Modal -->
    <ion-modal :is-open="showBudgetModal" @did-dismiss="showBudgetModal = false" :initial-breakpoint="0.35" :breakpoints="[0, 0.35]">
      <ion-header><ion-toolbar>
        <ion-title>Бюджет поездки</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveBudget" strong>Сохранить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model.number="budgetInput" label="Общий бюджет (₽)" label-placement="floating" type="number" inputmode="numeric" placeholder="0" />
        </ion-item>
        <p style="font-size:13px;color:#6B7280;padding:8px 16px">На человека: ~{{ budgetInput && activeMembers.length ? Math.round(budgetInput / activeMembers.length).toLocaleString() : '0' }} ₽</p>
        <ion-button v-if="trip?.budget" fill="clear" color="danger" expand="block" @click="clearBudget">Убрать бюджет</ion-button>
      </ion-content>
    </ion-modal>

    <!-- Add Member Modal -->
    <ion-modal :is-open="showAddMemberModal" @did-dismiss="showAddMemberModal = false" :initial-breakpoint="0.35" :breakpoints="[0, 0.35]">
      <ion-header><ion-toolbar>
        <ion-title>Добавить участника</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveNewMember" :disabled="!newMemberName.trim()" strong>Добавить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="newMemberName" label="Имя" label-placement="floating" placeholder="Как зовут?" @keyup.enter="saveNewMember" />
        </ion-item>
      </ion-content>
    </ion-modal>

    <ion-action-sheet :is-open="showActionSheet" :header="actionSheetHeader" :buttons="actionSheetButtons" @did-dismiss="showActionSheet = false" />
    <ion-alert :is-open="showDeleteConfirm" header="Удалить?" message="Это действие нельзя отменить." :buttons="deleteConfirmButtons" @did-dismiss="showDeleteConfirm = false" />
    <ion-alert :is-open="showRemoveMemberAlert" header="Убрать участника?" :message="removeMemberMsg" :buttons="removeMemberButtons" @did-dismiss="showRemoveMemberAlert = false" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButtons, IonButton, IonBackButton, IonIcon, IonInput, IonBadge,
  IonModal, IonItem, IonSelect, IonSelectOption, IonCheckbox, IonLabel, IonNote,
  IonSegment, IonSegmentButton, IonActionSheet, IonAlert, IonList, IonAvatar,
} from '@ionic/vue'
import { addCircleOutline, closeCircleOutline, sendOutline, peopleOutline, removeCircleOutline } from 'ionicons/icons'
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
const activeMembers = computed(() => store.getActiveMembers(tripId.value))
const leftMembers = computed(() => store.getLeftMembers(tripId.value))
const upcomingEvents = computed(() => store.getUpcomingEvents(tripId.value, 4))
const today = computed(() => new Date().toISOString().split('T')[0])
const sections = computed(() => {
  const s = store.getTaskSections(tripId.value)
  return s.length ? s : ['До поездки', 'Что взять', 'В поездке']
})

const allTasks = computed(() => store.getTripTasks(tripId.value))
const completedTasks = computed(() => allTasks.value.filter(t => t.isCompleted).length)
const totalTasks = computed(() => allTasks.value.length)
const transfers = computed(() => store.calculateBalances(tripId.value).transfers)
const transfersLabel = computed(() => {
  const n = transfers.value.length
  if (n === 1) return 'перевод'
  if (n >= 2 && n <= 4) return 'перевода'
  return 'переводов'
})

const totalShared = computed(() => store.getSharedExpenses(tripId.value).reduce((s, e) => s + e.amount, 0))
const budgetPct = computed(() => {
  if (!trip.value?.budget) return 0
  return Math.min(100, Math.round((totalShared.value / trip.value.budget) * 100))
})

const daysInfo = computed(() => {
  if (!trip.value) return null
  const now = new Date()
  const start = new Date(trip.value.startDate)
  const end = new Date(trip.value.endDate)
  if (now >= start && now <= end) {
    const day = Math.ceil((now.getTime() - start.getTime()) / 86400000) + 1
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
    return { value: `${day}/${total}`, label: 'день' }
  }
  const diff = Math.ceil((start.getTime() - now.getTime()) / 86400000)
  if (diff > 0 && diff <= 60) return { value: String(diff), label: diff === 1 ? 'день' : (diff <= 4 ? 'дня' : 'дней') }
  return null
})

const contentRef = ref()
const newMessage = ref('')
const showActions = ref(false)
const showMembersSheet = ref(false)

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

// Budget
const showBudgetModal = ref(false)
const budgetInput = ref(0)

// Add member
const showAddMemberModal = ref(false)
const newMemberName = ref('')

// Action sheet / Delete / Remove member
const showActionSheet = ref(false)
const actionSheetHeader = ref('')
const actionSheetButtons = ref<any[]>([])
const showDeleteConfirm = ref(false)
const deleteConfirmButtons = ref<any[]>([])
const showRemoveMemberAlert = ref(false)
const removeMemberMsg = ref('')
const removeMemberButtons = ref<any[]>([])

function getExpense(id?: string) { return id ? store.expenses.find(e => e.id === id && !e.isDeleted) : undefined }
function getEvent(id?: string) { return id ? store.events.find(e => e.id === id) : undefined }
function getPoll(id?: string) { return id ? store.polls.find(p => p.id === id) : undefined }
function getTask(id?: string) { return id ? store.tasks.find(t => t.id === id) : undefined }

function walletName(userId: string) {
  const w = store.getWalletForUser(tripId.value, userId)
  return w?.name ?? null
}

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

function formatEventDateShort(dateStr: string) {
  const d = new Date(dateStr)
  if (dateStr === today.value) return 'Сегодня'
  const tom = new Date(); tom.setDate(tom.getDate() + 1)
  if (dateStr === tom.toISOString().split('T')[0]) return 'Завтра'
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  return `${days[d.getDay()]} ${d.getDate()}`
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function toggleMember(userId: string) {
  const idx = selectedMembers.value.indexOf(userId)
  if (idx >= 0) {
    selectedMembers.value.splice(idx, 1)
    delete customAmounts[userId]
  } else {
    selectedMembers.value.push(userId)
    if (expenseAmount.value && selectedMembers.value.length) {
      const perPerson = Math.round(expenseAmount.value / selectedMembers.value.length)
      selectedMembers.value.forEach(uid => { customAmounts[uid] = perPerson })
    } else {
      customAmounts[userId] = 0
    }
  }
}

function openBudgetModal() {
  budgetInput.value = trip.value?.budget || 0
  showBudgetModal.value = true
}

function saveBudget() {
  store.updateTripBudget(tripId.value, budgetInput.value || undefined)
  showBudgetModal.value = false
}

function clearBudget() {
  store.updateTripBudget(tripId.value, undefined)
  showBudgetModal.value = false
}

function saveNewMember() {
  const name = newMemberName.value.trim()
  if (!name) return
  store.addMember(tripId.value, name)
  newMemberName.value = ''
  showAddMemberModal.value = false
}

function onCustomInput(userId: string, event: Event) {
  const val = Number((event.target as HTMLInputElement).value || 0)
  customAmounts[userId] = val
}

function distributeEqual() {
  if (!selectedMembers.value.length || !expenseAmount.value) return
  const perPerson = Math.round(expenseAmount.value / selectedMembers.value.length)
  selectedMembers.value.forEach(uid => { customAmounts[uid] = perPerson })
}

function confirmRemoveMember(userId: string) {
  const name = store.getUserName(userId)
  removeMemberMsg.value = `${name} будет убран(а) из поездки. Исторические данные сохранятся.`
  removeMemberButtons.value = [
    { text: 'Отмена', role: 'cancel' },
    { text: 'Убрать', role: 'destructive', handler: () => store.removeMember(tripId.value, userId) },
  ]
  showRemoveMemberAlert.value = true
}

// ===== Card Actions =====
function openCardActions(msg: ChatMessage) {
  const buttons: any[] = []
  if (msg.type === 'expense' && msg.referenceId) {
    const exp = getExpense(msg.referenceId); if (!exp) return
    actionSheetHeader.value = exp.title
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditExpense(exp) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteExpense(exp.id)) })
  } else if (msg.type === 'event' && msg.referenceId) {
    const evt = getEvent(msg.referenceId); if (!evt) return
    actionSheetHeader.value = evt.title
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditEvent(evt) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteEvent(evt.id)) })
  } else if (msg.type === 'task' && msg.referenceId) {
    const task = getTask(msg.referenceId); if (!task) return
    actionSheetHeader.value = task.title
    buttons.push({ text: task.isCompleted ? '↩️ Вернуть' : '✅ Выполнить', handler: () => store.toggleTask(task.id, currentUserId.value) })
    buttons.push({ text: '✏️ Редактировать', handler: () => openEditTask(task) })
    buttons.push({ text: '🗑 Удалить', role: 'destructive', handler: () => confirmDelete(() => store.deleteTask(task.id)) })
  } else if (msg.type === 'poll' && msg.referenceId) {
    const poll = getPoll(msg.referenceId); if (!poll) return
    actionSheetHeader.value = poll.question
    buttons.push({ text: '🗑 Удалить опрос', role: 'destructive', handler: () => confirmDelete(() => store.deletePoll(poll.id)) })
  } else return
  buttons.push({ text: 'Отмена', role: 'cancel' })
  actionSheetButtons.value = buttons
  showActionSheet.value = true
}

function confirmDelete(action: () => void) {
  deleteConfirmButtons.value = [
    { text: 'Отмена', role: 'cancel' },
    { text: 'Удалить', role: 'destructive', handler: action },
  ]
  showDeleteConfirm.value = true
}

// ===== Edit =====
function openEditExpense(exp: Expense) {
  editingExpenseId.value = exp.id; expenseTitle.value = exp.title; expenseAmount.value = exp.amount
  expenseCategory.value = exp.category; expenseType.value = exp.type
  Object.keys(customAmounts).forEach(k => delete customAmounts[k])
  if (exp.type === 'personal') {
    expenseSplitMode.value = 'equal_all'; selectedMembers.value = []
  } else if (exp.splitMode === 'equal' && exp.splits.length === activeMembers.value.length) {
    expenseSplitMode.value = 'equal_all'; selectedMembers.value = []
  } else {
    expenseSplitMode.value = 'select'
    selectedMembers.value = exp.splits.map(s => s.userId)
    exp.splits.forEach(s => { customAmounts[s.userId] = s.amount })
  }
  showExpenseModal.value = true
}
function openEditEvent(evt: { id: string; title: string; date: string; time: string; location?: string }) {
  editingEventId.value = evt.id; eventTitle.value = evt.title; eventDate.value = evt.date; eventTime.value = evt.time; eventLocation.value = evt.location ?? ''
  showEventModal.value = true
}
function openEditTask(task: { id: string; title: string; section: string; assigneeId?: string }) {
  editingTaskId.value = task.id; taskTitle.value = task.title; taskSection.value = task.section; taskAssignee.value = task.assigneeId ?? ''
  showTaskModal.value = true
}

// ===== Create / Open =====
function sendMessage() {
  const text = newMessage.value.trim(); if (!text) return
  store.addMessage(tripId.value, text, currentUserId.value)
  newMessage.value = ''; showActions.value = false; scrollToBottom()
}
function openAddExpense() {
  showActions.value = false; editingExpenseId.value = null; expenseTitle.value = ''; expenseAmount.value = 0
  expenseCategory.value = 'food'; expenseType.value = 'shared'; expenseSplitMode.value = 'equal_all'
  selectedMembers.value = []
  Object.keys(customAmounts).forEach(k => delete customAmounts[k])
  showExpenseModal.value = true
}
function openAddEvent() { showActions.value = false; editingEventId.value = null; eventTitle.value = ''; eventDate.value = ''; eventTime.value = ''; eventLocation.value = ''; showEventModal.value = true }
function openAddPoll() { showActions.value = false; pollQuestion.value = ''; pollOptions.value = ['', '']; showPollModal.value = true }
function openAddTask() { showActions.value = false; editingTaskId.value = null; taskTitle.value = ''; taskSection.value = sections.value[0] || 'До поездки'; taskAssignee.value = ''; showTaskModal.value = true }

// ===== Save =====
function saveExpense() {
  if (!expenseTitle.value || !expenseAmount.value) return
  const members = activeMembers.value
  const isPersonal = expenseType.value === 'personal'
  let splits: { userId: string; amount: number }[]; let splitMode: 'equal' | 'selected' | 'custom' = 'equal'

  if (isPersonal) {
    splits = [{ userId: currentUserId.value, amount: expenseAmount.value }]
  } else if (expenseSplitMode.value === 'select') {
    const sel = selectedMembers.value.length > 0 ? selectedMembers.value : members.map(m => m.userId)
    const allEqual = sel.every(uid => customAmounts[uid] === customAmounts[sel[0]])
    const perPerson = Math.round(expenseAmount.value / sel.length)
    const allEqualToAvg = sel.every(uid => (customAmounts[uid] || 0) === perPerson)

    if (allEqual || allEqualToAvg) {
      splitMode = sel.length === members.length ? 'equal' : 'selected'
      splits = sel.map(uid => ({ userId: uid, amount: perPerson }))
    } else {
      splitMode = 'custom'
      splits = sel.filter(uid => (customAmounts[uid] || 0) > 0).map(uid => ({ userId: uid, amount: customAmounts[uid] || 0 }))
    }
  } else {
    splits = members.map(m => ({ userId: m.userId, amount: Math.round(expenseAmount.value / members.length) }))
  }

  if (editingExpenseId.value) {
    store.updateExpense(editingExpenseId.value, { title: expenseTitle.value, amount: expenseAmount.value, category: expenseCategory.value as any, type: expenseType.value as any, splitMode, splits })
  } else {
    store.addExpense({ tripId: tripId.value, title: expenseTitle.value, amount: expenseAmount.value, currency: '₽', category: expenseCategory.value as any, type: expenseType.value as any, splitMode, source: 'personal_payment', paidBy: [{ userId: currentUserId.value, amount: expenseAmount.value }], splits, createdBy: currentUserId.value })
  }
  showExpenseModal.value = false; scrollToBottom()
}

function saveEvent() {
  if (!eventTitle.value || !eventDate.value || !eventTime.value) return
  if (editingEventId.value) store.updateEvent(editingEventId.value, { title: eventTitle.value, date: eventDate.value, time: eventTime.value, location: eventLocation.value || undefined })
  else store.addEvent(tripId.value, eventTitle.value, eventDate.value, eventTime.value, eventLocation.value, currentUserId.value)
  showEventModal.value = false; scrollToBottom()
}

function savePoll() {
  const validOptions = pollOptions.value.filter(o => o.trim())
  if (!pollQuestion.value || validOptions.length < 2) return
  store.addPoll(tripId.value, pollQuestion.value, validOptions, currentUserId.value)
  showPollModal.value = false; scrollToBottom()
}

function saveTask() {
  if (!taskTitle.value) return
  if (editingTaskId.value) store.updateTask(editingTaskId.value, { title: taskTitle.value, section: taskSection.value, assigneeId: taskAssignee.value || undefined })
  else store.addTaskFromChat(tripId.value, taskTitle.value, taskSection.value, taskAssignee.value || undefined, currentUserId.value)
  showTaskModal.value = false; scrollToBottom()
}

function scrollToBottom() { nextTick(() => { contentRef.value?.$el?.scrollToBottom?.(300) }) }
watch(chatMessages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.main-content { --background: #F3F4F6; }

/* Events strip */
.events-strip { background: white; padding: 12px 16px 8px; border-bottom: 1px solid #E5E7EB; }
.events-strip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.events-strip-title { font-size: 14px; font-weight: 700; color: #1F2937; }
.events-list { display: flex; flex-direction: column; gap: 6px; }
.event-mini {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 10px; border-radius: 10px; background: #F9FAFB;
}
.event-mini.event-today { background: #EEF2FF; }
.event-mini-date { font-size: 11px; font-weight: 600; color: var(--ion-color-primary); min-width: 52px; padding-top: 1px; }
.event-mini-time { font-size: 13px; font-weight: 700; color: #1F2937; min-width: 40px; }
.event-mini-info { flex: 1; }
.event-mini-title { font-size: 13px; font-weight: 600; color: #1F2937; }
.event-mini-loc { font-size: 11px; color: #6B7280; margin-top: 1px; }

/* Quick stats */
.quick-stats {
  display: flex; gap: 0; padding: 8px 12px;
  background: white; border-bottom: 1px solid #E5E7EB;
}
.quick-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 6px 4px; gap: 1px;
}
.qs-icon { font-size: 16px; }
.qs-value { font-size: 15px; font-weight: 700; color: #1F2937; }
.qs-label { font-size: 11px; color: #9CA3AF; }

/* Chat */
.chat-messages { padding: 8px 0 16px; }
.chat-bubble-wrapper { display: flex; padding: 2px 8px; }
.bubble-time { font-size: 11px; opacity: 0.6; text-align: right; margin-top: 2px; }
.chat-card-wrapper { padding: 3px 8px; cursor: pointer; }
.chat-card-wrapper:active .compact-card { opacity: 0.8; transform: scale(0.98); }

.compact-card {
  background: white; border-radius: 12px; padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #D1D5DB;
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
.poll-option { position: relative; padding: 8px 10px; margin: 4px 0; border-radius: 8px; background: #F3F4F6; cursor: pointer; overflow: hidden; font-size: 13px; }
.poll-option.voted { background: #EEF2FF; }
.poll-option-bar { position: absolute; top: 0; left: 0; height: 100%; background: rgba(79, 70, 229, 0.12); border-radius: 8px; transition: width 0.3s ease; }
.poll-option-text { position: relative; }
.poll-option-count { position: relative; float: right; font-weight: 600; color: var(--ion-color-primary); }

.chat-input-toolbar { --background: white; padding: 4px 0; }
.chat-input-row { display: flex; align-items: center; padding: 0 4px; }
.chat-input { flex: 1; --background: #F3F4F6; --border-radius: 20px; --padding-start: 14px; --padding-end: 14px; font-size: 15px; }
.plus-btn { --color: var(--ion-color-primary); font-size: 24px; }
.quick-actions { display: flex; gap: 6px; padding: 6px 12px; overflow-x: auto; }

.split-segment { margin: 8px 0; }
.participants-list { margin: 8px 0; }
.split-member-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 16px; min-height: 44px;
}
.split-member-name { flex: 1; font-size: 15px; font-weight: 500; color: #1F2937; }
.split-member-off { opacity: 0.45; }
.split-amount-box { display: flex; align-items: center; gap: 2px; }
.split-amount-input {
  width: 80px; text-align: right; border: 1px solid #D1D5DB; border-radius: 8px;
  padding: 6px 8px; font-size: 15px; font-weight: 600; color: var(--ion-color-primary);
  background: #F9FAFB; outline: none;
}
.split-amount-input:focus { border-color: var(--ion-color-primary); background: white; }
.split-amount-currency { font-size: 13px; color: #9CA3AF; }
.split-preview { padding: 8px 16px; font-size: 13px; color: var(--ion-color-primary); font-weight: 600; }
.split-hint { padding: 8px 16px; font-size: 13px; color: #9CA3AF; }
.split-error { color: var(--ion-color-danger); }

/* Members */
.member-avatar { --border-radius: 50%; width: 36px; height: 36px; }
.member-avatar-left { opacity: 0.4; }
.avatar-letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ion-color-primary); color: white; font-weight: 700; font-size: 16px; border-radius: 50%; }
.left-member { opacity: 0.6; }
.wallet-badge { font-size: 11px; background: #EEF2FF; color: var(--ion-color-primary); padding: 1px 6px; border-radius: 4px; margin-left: 4px; font-weight: 400; }
</style>
