<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Деньги</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="tab">
          <ion-segment-button value="shared">👥 Общие</ion-segment-button>
          <ion-segment-button value="personal">👤 Личные</ion-segment-button>
          <ion-segment-button value="fund">🏦 Фонд</ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Shared expenses -->
      <template v-if="tab === 'shared'">
        <div class="stat-card" @click="openBudgetModal" style="cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="stat-label">Общие траты</div>
              <div class="stat-value">{{ totalShared.toLocaleString() }} ₽</div>
            </div>
            <div style="text-align:right">
              <div class="stat-label">На человека</div>
              <div class="stat-value">~{{ perPerson.toLocaleString() }} ₽</div>
            </div>
          </div>
          <div v-if="trip?.budget" style="margin-top:12px">
            <div class="progress-bar">
              <div class="progress-bar-fill" :class="budgetBarClass" :style="{ width: budgetPct + '%' }" />
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#6B7280">
              <span>{{ budgetPct }}% бюджета</span>
              <span>Бюджет: {{ trip.budget.toLocaleString() }} ₽</span>
            </div>
          </div>
          <div v-else style="margin-top:8px;text-align:center;font-size:13px;color:var(--ion-color-primary)">
            + Установить бюджет
          </div>
        </div>

        <div class="section-header">Кто → Кому</div>
        <ion-list>
          <ion-item v-for="t in transfers" :key="`${t.from}-${t.to}`">
            <ion-label>
              <h3>{{ store.getUserName(t.from) }} → {{ store.getUserName(t.to) }}</h3>
            </ion-label>
            <ion-badge slot="end" color="warning">{{ t.amount.toLocaleString() }} ₽</ion-badge>
          </ion-item>
          <ion-item v-if="!transfers.length">
            <ion-label color="medium">Все расчёты завершены ✓</ion-label>
          </ion-item>
        </ion-list>

        <div class="section-header">По категориям</div>
        <div class="stat-card">
          <div v-for="cat in categoryStats" :key="cat.key" class="category-row">
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-amount">{{ cat.amount.toLocaleString() }} ₽</span>
            <span class="category-pct">{{ cat.percent }}%</span>
          </div>
        </div>

        <div class="section-header">Депозиты / Залоги</div>
        <ion-list>
          <ion-item v-for="d in deposits" :key="d.id">
            <ion-icon :icon="lockClosedOutline" slot="start" color="warning" />
            <ion-label>
              <h3>{{ d.title }}</h3>
              <p>{{ store.getUserName(d.paidBy[0]?.userId ?? '') }} · {{ depositStatusText(d.depositStatus) }}</p>
            </ion-label>
            <ion-note slot="end">{{ d.amount.toLocaleString() }} ₽</ion-note>
          </ion-item>
          <ion-item v-if="!deposits.length">
            <ion-label color="medium">Нет залогов</ion-label>
          </ion-item>
        </ion-list>

        <div class="section-header">История трат</div>
        <ion-list>
          <ion-item-sliding v-for="exp in sharedExpenses" :key="exp.id">
            <ion-item button @click="openEditExpense(exp)">
              <span slot="start" class="emoji-icon">{{ categoryIcon(exp.category) }}</span>
              <ion-label>
                <h3>{{ exp.title }}</h3>
                <p>{{ store.getUserName(exp.createdBy) }} · {{ formatDate(exp.createdAt) }}</p>
              </ion-label>
              <ion-note slot="end">{{ exp.amount.toLocaleString() }} ₽</ion-note>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="primary" @click="openEditExpense(exp)">✏️</ion-item-option>
              <ion-item-option color="danger" @click="confirmDeleteExpense(exp)">🗑</ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </template>

      <!-- Personal expenses -->
      <template v-if="tab === 'personal'">
        <div class="stat-card">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="stat-label">Общие (доля)</div>
              <div class="stat-value">{{ myShare.toLocaleString() }} ₽</div>
            </div>
            <div style="text-align:right">
              <div class="stat-label">Личные</div>
              <div class="stat-value">{{ totalPersonal.toLocaleString() }} ₽</div>
            </div>
          </div>
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between">
            <span style="font-weight:700;font-size:16px">Итого за поездку</span>
            <span style="font-weight:700;font-size:18px;color:var(--ion-color-primary)">{{ (myShare + totalPersonal).toLocaleString() }} ₽</span>
          </div>
        </div>

        <div class="section-header">Мои личные траты</div>
        <ion-list>
          <ion-item-sliding v-for="exp in personalExpenses" :key="exp.id">
            <ion-item button @click="openEditExpense(exp)">
              <span slot="start" class="emoji-icon">{{ categoryIcon(exp.category) }}</span>
              <ion-label>
                <h3>{{ exp.title }}</h3>
                <p>{{ formatDate(exp.createdAt) }}</p>
              </ion-label>
              <ion-note slot="end">{{ exp.amount.toLocaleString() }} ₽</ion-note>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="primary" @click="openEditExpense(exp)">✏️</ion-item-option>
              <ion-item-option color="danger" @click="confirmDeleteExpense(exp)">🗑</ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
          <ion-item v-if="!personalExpenses.length">
            <ion-label color="medium">Нет личных трат</ion-label>
          </ion-item>
        </ion-list>
      </template>

      <!-- Fund -->
      <template v-if="tab === 'fund'">
        <template v-if="tripFund">
          <div class="stat-card">
            <div class="stat-label">Общий фонд</div>
            <div class="stat-value">{{ tripFund.totalCollected.toLocaleString() }} ₽</div>
            <div class="progress-bar" style="margin:8px 0">
              <div class="progress-bar-fill" :style="{ width: fundSpentPct + '%' }" />
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#6B7280">
              <span>Потрачено: {{ tripFund.totalSpent.toLocaleString() }} ₽</span>
              <span>Остаток: {{ (tripFund.totalCollected - tripFund.totalSpent).toLocaleString() }} ₽</span>
            </div>
          </div>

          <div class="section-header">Взносы</div>
          <ion-list>
            <ion-item v-for="c in tripFund.contributions" :key="c.userId" button @click="openContributionAction(c)">
              <ion-label>
                <h3>{{ store.getUserName(c.userId) }}</h3>
                <p>{{ c.paidAmount.toLocaleString() }} / {{ c.expectedAmount.toLocaleString() }} ₽</p>
              </ion-label>
              <ion-badge slot="end" :color="contributionColor(c.status)">
                {{ contributionStatusText(c.status) }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </template>
        <div v-else class="empty-state">
          <p>Общий фонд не создан</p>
          <p style="font-size:13px;margin-bottom:16px">Все скидываются определённую сумму на общие расходы</p>
          <ion-button @click="showCreateFundModal = true">Создать фонд</ion-button>
        </div>
      </template>
    </ion-content>

    <!-- Edit Expense Modal -->
    <ion-modal :is-open="showEditModal" @did-dismiss="showEditModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start"><ion-button @click="showEditModal = false">Отмена</ion-button></ion-buttons>
          <ion-title>Редактировать</ion-title>
          <ion-buttons slot="end"><ion-button @click="saveEditedExpense" :disabled="!editTitle || !editAmount" strong>Сохранить</ion-button></ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="editTitle" label="Что" label-placement="floating" />
        </ion-item>
        <ion-item>
          <ion-input v-model.number="editAmount" label="Сумма (₽)" label-placement="floating" type="number" inputmode="numeric" />
        </ion-item>
        <ion-item>
          <ion-select v-model="editCategory" label="Категория" label-placement="floating" interface="action-sheet">
            <ion-select-option value="food">🍽 Еда</ion-select-option>
            <ion-select-option value="transport">🚗 Транспорт</ion-select-option>
            <ion-select-option value="housing">🏨 Жильё</ion-select-option>
            <ion-select-option value="fun">🎭 Развлечения</ion-select-option>
            <ion-select-option value="shopping">🛍 Покупки</ion-select-option>
            <ion-select-option value="other">📦 Другое</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Delete Confirm -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Удалить трату?"
      :message="'«' + deletingTitle + '» будет удалена.'"
      :buttons="deleteAlertButtons"
      @did-dismiss="showDeleteAlert = false"
    />

    <!-- Budget Modal -->
    <ion-modal :is-open="showBudgetModal" @did-dismiss="showBudgetModal = false" :initial-breakpoint="0.35" :breakpoints="[0, 0.35]">
      <ion-header><ion-toolbar>
        <ion-title>Бюджет</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveBudget" strong>Сохранить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model.number="budgetInput" label="Общий бюджет (₽)" label-placement="floating" type="number" inputmode="numeric" placeholder="0" />
        </ion-item>
        <p style="font-size:13px;color:#6B7280;padding:8px 16px">На человека: ~{{ budgetInput && memberCount ? Math.round(budgetInput / memberCount).toLocaleString() : '0' }} ₽</p>
        <ion-button v-if="trip?.budget" fill="clear" color="danger" expand="block" @click="clearBudget">Убрать бюджет</ion-button>
      </ion-content>
    </ion-modal>

    <!-- Create Fund Modal -->
    <ion-modal :is-open="showCreateFundModal" @did-dismiss="showCreateFundModal = false" :initial-breakpoint="0.4" :breakpoints="[0, 0.4]">
      <ion-header><ion-toolbar>
        <ion-title>Создать фонд</ion-title>
        <ion-buttons slot="end"><ion-button @click="createFund" :disabled="!fundAmountInput" strong>Создать</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model.number="fundAmountInput" label="Сумма с человека (₽)" label-placement="floating" type="number" inputmode="numeric" placeholder="20000" />
        </ion-item>
        <p style="font-size:13px;color:#6B7280;padding:8px 16px">
          {{ memberCount }} участников · Итого: {{ (fundAmountInput * memberCount).toLocaleString() }} ₽
        </p>
      </ion-content>
    </ion-modal>

    <!-- Contribution Action Sheet -->
    <ion-action-sheet
      :is-open="showContribSheet"
      :header="contribSheetHeader"
      :buttons="contribSheetButtons"
      @did-dismiss="showContribSheet = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon, IonButton, IonButtons,
  IonAlert, IonModal, IonInput, IonSelect, IonSelectOption, IonActionSheet,
  IonItemSliding, IonItemOptions, IonItemOption,
} from '@ionic/vue'
import { lockClosedOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import type { Expense, ExpenseCategory, DepositStatus } from '../../types'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()
const tab = ref('shared')

// Budget
const showBudgetModal = ref(false)
const budgetInput = ref(0)

// Fund creation
const showCreateFundModal = ref(false)
const fundAmountInput = ref(20000)

// Contribution action
const showContribSheet = ref(false)
const contribSheetHeader = ref('')
const contribSheetButtons = ref<any[]>([])

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const sharedExpenses = computed(() => store.getSharedExpenses(tripId.value))
const personalExpenses = computed(() => store.getPersonalExpenses(tripId.value, auth.user?.id ?? ''))
const deposits = computed(() => store.getDeposits(tripId.value))
const tripFund = computed(() => store.getTripFund(tripId.value))

const totalShared = computed(() => sharedExpenses.value.reduce((s, e) => s + e.amount, 0))
const totalPersonal = computed(() => personalExpenses.value.reduce((s, e) => s + e.amount, 0))
const memberCount = computed(() => store.getActiveMembers(tripId.value).length || 1)
const perPerson = computed(() => Math.round(totalShared.value / memberCount.value))

const myShare = computed(() => {
  const uid = auth.user?.id ?? ''
  return sharedExpenses.value.reduce((sum, exp) => {
    const split = exp.splits.find(s => s.userId === uid)
    return sum + (split?.amount ?? 0)
  }, 0)
})

const transfers = computed(() => store.calculateBalances(tripId.value).transfers)

const budgetPct = computed(() => {
  if (!trip.value?.budget) return 0
  return Math.min(100, Math.round((totalShared.value / trip.value.budget) * 100))
})
const budgetBarClass = computed(() => {
  if (budgetPct.value > 100) return 'danger'
  if (budgetPct.value > 85) return 'warning'
  return ''
})

const fundSpentPct = computed(() => {
  if (!tripFund.value || tripFund.value.totalCollected === 0) return 0
  return Math.round((tripFund.value.totalSpent / tripFund.value.totalCollected) * 100)
})

const categoryStats = computed(() => {
  const cats: Record<string, { icon: string; name: string; amount: number }> = {
    housing: { icon: '🏨', name: 'Жильё', amount: 0 },
    transport: { icon: '🚗', name: 'Транспорт', amount: 0 },
    food: { icon: '🍽', name: 'Еда', amount: 0 },
    fun: { icon: '🎭', name: 'Развлечения', amount: 0 },
    shopping: { icon: '🛍', name: 'Покупки', amount: 0 },
    other: { icon: '📦', name: 'Другое', amount: 0 },
  }
  sharedExpenses.value.forEach(e => { if (cats[e.category]) cats[e.category].amount += e.amount })
  return Object.entries(cats)
    .filter(([, v]) => v.amount > 0)
    .map(([key, v]) => ({ key, ...v, percent: totalShared.value > 0 ? Math.round((v.amount / totalShared.value) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
})

// Edit expense
const showEditModal = ref(false)
const editingId = ref('')
const editTitle = ref('')
const editAmount = ref(0)
const editCategory = ref('food')

function openEditExpense(exp: Expense) {
  editingId.value = exp.id
  editTitle.value = exp.title
  editAmount.value = exp.amount
  editCategory.value = exp.category
  showEditModal.value = true
}

function saveEditedExpense() {
  if (!editTitle.value || !editAmount.value) return
  store.updateExpense(editingId.value, { title: editTitle.value, amount: editAmount.value, category: editCategory.value as ExpenseCategory })
  showEditModal.value = false
}

// Delete expense
const showDeleteAlert = ref(false)
const deletingId = ref('')
const deletingTitle = ref('')
const deleteAlertButtons = computed(() => [
  { text: 'Отмена', role: 'cancel' },
  { text: 'Удалить', role: 'destructive', handler: () => { store.deleteExpense(deletingId.value) } },
])

function confirmDeleteExpense(exp: Expense) {
  deletingId.value = exp.id
  deletingTitle.value = exp.title
  showDeleteAlert.value = true
}

function categoryIcon(cat: ExpenseCategory) {
  const icons: Record<string, string> = { housing: '🏨', transport: '🚗', food: '🍽', fun: '🎭', shopping: '🛍', other: '📦' }
  return icons[cat] ?? '📦'
}

function depositStatusText(s?: DepositStatus) {
  if (s === 'returned') return 'Возвращён ✅'
  if (s === 'lost') return 'Не вернули ❌'
  if (s === 'partial') return 'Частично'
  return 'Ожидает ⏳'
}

function contributionColor(s: string) {
  if (s === 'confirmed') return 'success'
  if (s === 'paid') return 'warning'
  return 'medium'
}

function contributionStatusText(s: string) {
  if (s === 'confirmed') return '✅ Подтверждён'
  if (s === 'paid') return '⏳ Ожидает'
  return 'Не внёс'
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

function createFund() {
  if (!fundAmountInput.value) return
  store.createFund(tripId.value, fundAmountInput.value, auth.user?.id ?? '')
  showCreateFundModal.value = false
}

function openContributionAction(c: { userId: string; status: string; paidAmount: number; expectedAmount: number }) {
  const name = store.getUserName(c.userId)
  contribSheetHeader.value = `${name} — ${c.paidAmount.toLocaleString()} / ${c.expectedAmount.toLocaleString()} ₽`
  const buttons: any[] = []
  if (c.status !== 'confirmed') {
    buttons.push({ text: '✅ Подтвердить оплату', handler: () => store.updateContribution(tripId.value, c.userId, 'confirmed') })
  }
  if (c.status !== 'paid') {
    buttons.push({ text: '💳 Отметить как оплачено', handler: () => store.updateContribution(tripId.value, c.userId, 'paid') })
  }
  if (c.status !== 'pending') {
    buttons.push({ text: '↩️ Сбросить статус', handler: () => store.updateContribution(tripId.value, c.userId, 'pending') })
  }
  buttons.push({ text: 'Отмена', role: 'cancel' })
  contribSheetButtons.value = buttons
  showContribSheet.value = true
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
.stat-label { font-size: 13px; color: #6B7280; }
.stat-value { font-size: 22px; font-weight: 700; color: #1F2937; }
.category-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.category-icon { font-size: 20px; }
.category-name { flex: 1; font-size: 14px; }
.category-amount { font-weight: 600; font-size: 14px; }
.category-pct { font-size: 13px; color: #6B7280; width: 40px; text-align: right; }
.empty-state { text-align: center; padding: 40px 20px; color: #6B7280; }
</style>
