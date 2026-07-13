<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>TripMate</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            Выйти
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Мои путешествия</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="store.activeTrips.length" class="section-header">Активные</div>
      <ion-card v-for="trip in store.activeTrips" :key="trip.id" class="trip-card" button @click="openTrip(trip.id)">
        <ion-card-content>
          <div class="trip-card-header">
            <span class="trip-flag">{{ trip.countryFlag }}</span>
            <div class="trip-card-info">
              <h2 class="trip-name">{{ trip.name }}</h2>
              <p class="trip-dates">{{ formatDates(trip.startDate, trip.endDate) }}</p>
            </div>
            <ion-badge color="primary" class="trip-badge">{{ trip.members.length }} чел.</ion-badge>
          </div>

          <div v-if="countdown(trip.startDate) !== null" class="trip-countdown">
            <template v-if="countdown(trip.startDate)! > 0">
              Через {{ countdown(trip.startDate) }} {{ pluralDays(countdown(trip.startDate)!) }}
            </template>
            <template v-else-if="isOngoing(trip.startDate, trip.endDate)">
              Сейчас в поездке
            </template>
          </div>

          <div v-if="trip.budget" class="trip-budget">
            <div class="progress-bar">
              <div class="progress-bar-fill" :class="budgetClass(trip)" :style="{ width: budgetPercent(trip) + '%' }" />
            </div>
            <span class="budget-text">{{ getTripSpent(trip.id).toLocaleString() }} / {{ trip.budget.toLocaleString() }} ₽</span>
          </div>
        </ion-card-content>
      </ion-card>

      <div v-if="store.archivedTrips.length" class="section-header">Архив</div>
      <ion-card v-for="trip in store.archivedTrips" :key="trip.id" class="trip-card archived" button @click="openTrip(trip.id)">
        <ion-card-content>
          <div class="trip-card-header">
            <span class="trip-flag">{{ trip.countryFlag }}</span>
            <div class="trip-card-info">
              <h2 class="trip-name">{{ trip.name }}</h2>
              <p class="trip-dates">{{ formatDates(trip.startDate, trip.endDate) }}</p>
            </div>
            <ion-badge color="medium">Архив</ion-badge>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonBadge, IonButtons, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useTripsStore } from '../stores/trips'
import { useAuthStore } from '../stores/auth'
import type { Trip } from '../types'

const router = useRouter()
const store = useTripsStore()
const auth = useAuthStore()

function openTrip(tripId: string) {
  router.push(`/trip/${tripId}/main`)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function formatDates(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${s.getDate()} ${months[s.getMonth()]} — ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`
}

function countdown(startDate: string): number | null {
  const now = new Date()
  const start = new Date(startDate)
  const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff >= -30 ? diff : null
}

function isOngoing(start: string, end: string) {
  const now = new Date()
  return now >= new Date(start) && now <= new Date(end)
}

function pluralDays(n: number) {
  const abs = Math.abs(n)
  if (abs % 10 === 1 && abs % 100 !== 11) return 'день'
  if ([2,3,4].includes(abs % 10) && ![12,13,14].includes(abs % 100)) return 'дня'
  return 'дней'
}

function getTripSpent(tripId: string) {
  return store.getSharedExpenses(tripId).reduce((sum, e) => sum + e.amount, 0)
}

function budgetPercent(trip: Trip) {
  if (!trip.budget) return 0
  return Math.min(100, (getTripSpent(trip.id) / trip.budget) * 100)
}

function budgetClass(trip: Trip) {
  const pct = budgetPercent(trip)
  if (pct > 100) return 'danger'
  if (pct > 85) return 'warning'
  return ''
}
</script>

<style scoped>
.trip-card {
  border-radius: 16px;
  margin: 8px 0;
  border: 1px solid var(--color-border);
  box-shadow: none;
}

.trip-card.archived { opacity: 0.5; }
.trip-card-header { display: flex; align-items: center; gap: 12px; }
.trip-flag { font-size: 36px; }
.trip-card-info { flex: 1; }
.trip-name { font-size: 18px; font-weight: 700; margin: 0; color: var(--color-text-1); }
.trip-dates { font-size: 15px; color: var(--color-text-2); margin: 2px 0 0; }
.trip-badge { --border-radius: 12px; font-size: 12px; }
.trip-countdown { margin-top: 12px; font-size: 15px; font-weight: 700; color: var(--color-accent); }
.trip-budget { margin-top: 12px; }
.budget-text { font-size: 12px; color: var(--color-text-2); font-variant-numeric: tabular-nums; }
</style>
