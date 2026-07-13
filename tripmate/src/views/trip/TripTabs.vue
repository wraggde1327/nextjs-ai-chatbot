<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="chat" :href="`/trip/${tripId}/chat`">
          <ion-icon :icon="chatbubblesOutline" />
          <ion-label>Чат</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="money" :href="`/trip/${tripId}/money`">
          <ion-icon :icon="walletOutline" />
          <ion-label>Деньги</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="today" :href="`/trip/${tripId}/today`">
          <ion-icon :icon="calendarOutline" />
          <ion-label>Сегодня</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="tasks" :href="`/trip/${tripId}/tasks`">
          <ion-icon :icon="checkmarkCircleOutline" />
          <ion-label>Дела</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="info" :href="`/trip/${tripId}/info`">
          <ion-icon :icon="informationCircleOutline" />
          <ion-label>Инфо</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue'
import { chatbubblesOutline, walletOutline, calendarOutline, checkmarkCircleOutline, informationCircleOutline } from 'ionicons/icons'

const route = useRoute()
const tripId = computed(() => route.params.tripId as string)
</script>
