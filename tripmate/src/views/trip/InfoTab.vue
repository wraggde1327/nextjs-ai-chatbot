<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Инфо</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Countdown -->
      <div class="stat-card" style="text-align:center">
        <div style="font-size:14px;color:#6B7280">{{ trip?.countryFlag }} {{ trip?.name }}</div>
        <div v-if="daysUntil > 0" class="countdown-number">{{ daysUntil }}</div>
        <div v-else class="countdown-number" style="color:var(--ion-color-success)">Сейчас!</div>
        <div v-if="daysUntil > 0" style="font-size:14px;color:#6B7280">{{ pluralDays(daysUntil) }} до поездки</div>
        <div class="progress-bar" style="margin-top:12px">
          <div class="progress-bar-fill" :style="{ width: taskProgress + '%' }" />
        </div>
        <div style="font-size:13px;color:#6B7280">Дел выполнено: {{ completedTasks }} / {{ totalTasks }}</div>
      </div>

      <!-- Country info -->
      <ion-accordion-group :multiple="true">
        <ion-accordion value="visa">
          <ion-item slot="header">
            <ion-label><strong>📌 Въезд и визы</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Виза</span><span>{{ info.visa }}</span></div>
            <div class="info-row"><span class="info-label">Паспорт</span><span>{{ info.passport }}</span></div>
          </div>
        </ion-accordion>

        <ion-accordion value="money">
          <ion-item slot="header">
            <ion-label><strong>💱 Валюта и деньги</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Валюта</span><span>{{ info.currency }}</span></div>
            <div class="info-row"><span class="info-label">Курс</span><span>{{ info.exchangeRate }}</span></div>
            <div class="info-row"><span class="info-label">Карты</span><span>{{ info.cards }}</span></div>
            <div class="info-row"><span class="info-label">Чаевые</span><span>{{ info.tips }}</span></div>
          </div>
        </ion-accordion>

        <ion-accordion value="practical">
          <ion-item slot="header">
            <ion-label><strong>🔌 Практическое</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Розетки</span><span>{{ info.sockets }}</span></div>
            <div class="info-row"><span class="info-label">Напряжение</span><span>{{ info.voltage }}</span></div>
            <div class="info-row"><span class="info-label">Вода</span><span>{{ info.water }}</span></div>
            <div class="info-row"><span class="info-label">Часовой пояс</span><span>{{ info.timezone }}</span></div>
          </div>
        </ion-accordion>

        <ion-accordion value="emergency">
          <ion-item slot="header">
            <ion-label><strong>🆘 Экстренное</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Скорая / Пожарные</span><span>{{ info.emergency }}</span></div>
            <div class="info-row"><span class="info-label">Полиция</span><span>{{ info.police }}</span></div>
            <div class="info-row">
              <span class="info-label">Посольство</span>
              <span>
                {{ info.embassy }}
                <br />
                <a :href="'tel:' + info.embassyPhone">📞 {{ info.embassyPhone }}</a>
              </span>
            </div>
          </div>
        </ion-accordion>

        <ion-accordion value="docs">
          <ion-item slot="header">
            <ion-label><strong>📄 Документы</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="doc-item">
              <span>✈️ Билет МСК → Анталья (SU-2134)</span>
              <ion-button fill="clear" size="small">📄 Открыть</ion-button>
            </div>
            <div class="doc-item">
              <span>✈️ Билет Анталья → МСК (SU-2135)</span>
              <ion-button fill="clear" size="small">📄 Открыть</ion-button>
            </div>
            <div class="doc-item">
              <span>🏨 Hotel Sunrise</span>
              <ion-button fill="clear" size="small">📄 Открыть</ion-button>
            </div>
            <div class="doc-item">
              <span>🛡 Страховка АА-123456</span>
              <ion-button fill="clear" size="small">📄 Открыть</ion-button>
            </div>
          </div>
        </ion-accordion>

        <ion-accordion value="links">
          <ion-item slot="header">
            <ion-label><strong>🔗 Ссылки</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div v-for="link in tripLinks" :key="link.id" class="link-item">
              <div class="link-title">
                <a :href="link.url" target="_blank">{{ link.title || link.url }}</a>
              </div>
              <div class="link-meta">
                <span v-if="link.category" class="link-category">{{ link.category }}</span>
                · {{ store.getUserName(link.createdBy) }}
                <span v-if="link.comment"> · {{ link.comment }}</span>
              </div>
            </div>
            <ion-button fill="outline" expand="block" size="small" class="ion-margin-top" @click="showAddLink = true">
              + Добавить ссылку
            </ion-button>
          </div>
        </ion-accordion>

        <ion-accordion value="phrases">
          <ion-item slot="header">
            <ion-label><strong>💬 Разговорник: турецкий</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div v-for="(phrase, i) in info.phrases" :key="i" class="phrase-row">
              <span class="phrase-ru">{{ phrase.ru }}</span>
              <span class="phrase-local">{{ phrase.local }}</span>
              <ion-button fill="clear" size="small">🔊</ion-button>
            </div>
          </div>
        </ion-accordion>
      </ion-accordion-group>

      <!-- Participants -->
      <div class="section-header">👥 Участники ({{ trip?.members.length }})</div>
      <ion-list>
        <ion-item v-for="m in trip?.members" :key="m.userId">
          <ion-avatar slot="start" class="member-avatar">
            <div class="avatar-letter">{{ store.getUserName(m.userId)[0] }}</div>
          </ion-avatar>
          <ion-label>
            <h3>{{ store.getUserName(m.userId) }}</h3>
            <p>{{ m.role === 'organizer' ? '👑 Организатор' : 'Участник' }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-button fill="outline" expand="block" class="ion-margin">
        📤 Экспорт в PDF
      </ion-button>
    </ion-content>

    <ion-modal :is-open="showAddLink" @did-dismiss="showAddLink = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Новая ссылка</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddLink = false">Закрыть</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="linkUrl" label="URL" label-placement="floating" placeholder="https://..." />
        </ion-item>
        <ion-item>
          <ion-input v-model="linkTitle" label="Название" label-placement="floating" />
        </ion-item>
        <ion-item>
          <ion-select v-model="linkCategory" label="Категория" label-placement="floating">
            <ion-select-option value="Жильё">🏨 Жильё</ion-select-option>
            <ion-select-option value="Еда">🍽 Еда</ion-select-option>
            <ion-select-option value="Что посмотреть">🎭 Что посмотреть</ion-select-option>
            <ion-select-option value="Другое">📦 Другое</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="saveLink" :disabled="!linkUrl">
          Добавить
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonAccordionGroup, IonAccordion, IonButton, IonButtons, IonAvatar, IonModal,
  IonInput, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import { turkeyInfo } from '../../data/mock'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const tripLinks = computed(() => store.getTripLinks(tripId.value))
const info = turkeyInfo

const allTasks = computed(() => store.getTripTasks(tripId.value))
const completedTasks = computed(() => allTasks.value.filter(t => t.isCompleted).length)
const totalTasks = computed(() => allTasks.value.length)
const taskProgress = computed(() => totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0)

const daysUntil = computed(() => {
  if (!trip.value) return 0
  const now = new Date()
  const start = new Date(trip.value.startDate)
  return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
})

const showAddLink = ref(false)
const linkUrl = ref('')
const linkTitle = ref('')
const linkCategory = ref('Другое')

function pluralDays(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'дня'
  return 'дней'
}

function saveLink() {
  if (!linkUrl.value) return
  store.addLink(tripId.value, linkUrl.value, linkTitle.value, linkCategory.value, auth.user?.id ?? '')
  showAddLink.value = false
  linkUrl.value = ''
  linkTitle.value = ''
}
</script>

<style scoped>
.countdown-number {
  font-size: 48px;
  font-weight: 800;
  color: var(--ion-color-primary);
  line-height: 1.1;
  margin: 8px 0;
}
.accordion-content {
  padding: 8px 16px 16px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
  gap: 12px;
}
.info-label {
  color: #6B7280;
  min-width: 100px;
  flex-shrink: 0;
}
.doc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
}
.link-item {
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
}
.link-title a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-size: 14px;
}
.link-meta {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 2px;
}
.link-category {
  background: #EEF2FF;
  color: var(--ion-color-primary);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}
.phrase-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
  gap: 8px;
}
.phrase-ru {
  flex: 1;
  font-size: 14px;
  color: #1F2937;
}
.phrase-local {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-primary);
}
.member-avatar {
  --border-radius: 50%;
  width: 36px;
  height: 36px;
}
.avatar-letter {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-primary);
  color: white;
  font-weight: 700;
  font-size: 16px;
  border-radius: 50%;
}
</style>
