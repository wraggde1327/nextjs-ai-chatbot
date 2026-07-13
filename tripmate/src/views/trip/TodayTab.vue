<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Сегодня</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stat-card">
        <div class="today-header">
          <div>
            <div class="today-date">{{ todayFormatted }}</div>
            <div class="today-city">{{ trip?.city }}</div>
          </div>
          <div class="today-weather">
            <ion-icon :icon="sunnyOutline" style="font-size:20px;vertical-align:middle" /> 34°C
          </div>
        </div>
      </div>

      <div v-if="todayEvents.length" class="section-header">Расписание</div>
      <div v-for="evt in todayEvents" :key="evt.id" class="timeline-item">
        <div class="timeline-time">{{ evt.time }}</div>
        <div class="timeline-content">
          <div class="timeline-title">{{ evt.title }}</div>
          <div v-if="evt.location" class="timeline-location">
            <ion-icon :icon="locationOutline" style="font-size:12px;vertical-align:middle" /> {{ evt.location }}
            <ion-button v-if="evt.mapsUrl" fill="clear" size="small" @click="openMap(evt.mapsUrl)">
              <ion-icon :icon="mapOutline" slot="start" /> На карте
            </ion-button>
          </div>
          <div class="timeline-reminder">
            <ion-icon :icon="notificationsOutline" style="font-size:11px;vertical-align:middle" /> За {{ evt.reminderMinutes }} мин
          </div>
        </div>
      </div>

      <div v-if="!todayEvents.length" class="empty-state">
        <p>На сегодня ничего не запланировано</p>
      </div>

      <div v-if="tomorrowEvents.length" class="section-header">Завтра</div>
      <div v-for="evt in tomorrowEvents" :key="evt.id" class="timeline-item tomorrow">
        <div class="timeline-time">{{ evt.time }}</div>
        <div class="timeline-content">
          <div class="timeline-title">{{ evt.title }}</div>
          <div v-if="evt.location" class="timeline-location">
            <ion-icon :icon="locationOutline" style="font-size:12px;vertical-align:middle" /> {{ evt.location }}
          </div>
        </div>
      </div>

      <div v-if="todayTasks.length" class="section-header">Не забыть</div>
      <ion-list v-if="todayTasks.length">
        <ion-item v-for="task in todayTasks" :key="task.id" @click="toggleTask(task.id)">
          <ion-checkbox slot="start" :checked="task.isCompleted" @ion-change="toggleTask(task.id)" />
          <ion-label :class="{ completed: task.isCompleted }">{{ task.title }}</ion-label>
        </ion-item>
      </ion-list>

      <div class="stat-card" style="margin-top:16px">
        <div class="stat-label">Потрачено сегодня</div>
        <div class="stat-value num">{{ todaySpent.toLocaleString() }} ₽</div>
      </div>

      <div class="section-header">Всё расписание</div>
      <div v-for="day in allDays" :key="day.date" style="margin-bottom:16px">
        <div class="day-header">{{ formatDayHeader(day.date) }}</div>
        <div v-for="evt in day.events" :key="evt.id" class="timeline-item">
          <div class="timeline-time">{{ evt.time }}</div>
          <div class="timeline-content">
            <div class="timeline-title">{{ evt.title }}</div>
            <div v-if="evt.location" class="timeline-location">
              <ion-icon :icon="locationOutline" style="font-size:12px;vertical-align:middle" /> {{ evt.location }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonIcon } from '@ionic/vue'
import { sunnyOutline, locationOutline, mapOutline, notificationsOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const today = computed(() => new Date().toISOString().split('T')[0])
const tomorrow = computed(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })

const todayFormatted = computed(() => {
  const d = new Date()
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
})

const todayEvents = computed(() => store.getEventsForDate(tripId.value, today.value))
const tomorrowEvents = computed(() => store.getEventsForDate(tripId.value, tomorrow.value))
const todayTasks = computed(() => store.getTripTasks(tripId.value).filter(t => t.deadline === today.value || (!t.isCompleted && !t.deadline)).slice(0, 5))
const todaySpent = computed(() => store.getTripExpenses(tripId.value).filter(e => e.createdAt.startsWith(today.value)).reduce((s, e) => s + e.amount, 0))

const allDays = computed(() => {
  const evts = store.getTripEvents(tripId.value)
  const grouped: Record<string, typeof evts> = {}
  evts.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e) })
  return Object.entries(grouped).map(([date, events]) => ({ date, events })).sort((a, b) => a.date.localeCompare(b.date))
})

function toggleTask(taskId: string) { store.toggleTask(taskId, auth.user?.id ?? '') }
function openMap(url?: string) { if (url) window.open(url, '_blank') }

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr)
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]} (${days[d.getDay()]})`
}
</script>

<style scoped>
.today-header { display: flex; justify-content: space-between; align-items: center; }
.today-date { font-size: 18px; font-weight: 700; color: var(--color-text-1); }
.today-city { font-size: 15px; color: var(--color-text-2); }
.today-weather { font-size: 18px; font-weight: 700; color: var(--color-text-1); }
.stat-label { font-size: 12px; color: var(--color-text-2); }
.stat-value { font-size: 24px; font-weight: 700; color: var(--color-text-1); }
.timeline-item { display: flex; gap: 12px; padding: 12px 16px; border-left: 2px solid var(--color-accent); margin-left: 16px; margin-bottom: 2px; }
.timeline-item.tomorrow { border-left-color: var(--color-border); opacity: 0.6; }
.timeline-time { font-size: 15px; font-weight: 700; color: var(--color-accent); min-width: 48px; }
.timeline-title { font-size: 15px; font-weight: 700; color: var(--color-text-1); }
.timeline-location { font-size: 12px; color: var(--color-text-2); margin-top: 2px; }
.timeline-reminder { font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
.day-header { font-size: 15px; font-weight: 700; color: var(--color-text-1); padding: 8px 16px; }
.completed { text-decoration: line-through; opacity: 0.5; }
.empty-state { text-align: center; padding: 40px 20px; color: var(--color-text-2); }
</style>
