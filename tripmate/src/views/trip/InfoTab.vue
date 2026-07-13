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
        <div style="font-size:15px;color:var(--color-text-2)">{{ trip?.countryFlag }} {{ trip?.name }}</div>
        <div v-if="daysUntil > 0" class="countdown-number">{{ daysUntil }}</div>
        <div v-else class="countdown-number" style="color:var(--color-success)">Сейчас!</div>
        <div v-if="daysUntil > 0" style="font-size:15px;color:var(--color-text-2)">{{ pluralDays(daysUntil) }} до поездки</div>
        <div class="progress-bar" style="margin-top:12px">
          <div class="progress-bar-fill" :style="{ width: taskProgress + '%' }" />
        </div>
        <div style="font-size:12px;color:var(--color-text-2)">Дел выполнено: {{ completedTasks }} / {{ totalTasks }}</div>
      </div>

      <!-- Country info -->
      <ion-accordion-group :multiple="true">
        <ion-accordion value="visa">
          <ion-item slot="header">
            <ion-icon :icon="flagOutline" slot="start" color="medium" />
            <ion-label><strong>Въезд и визы</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Виза</span><span>{{ info.visa }}</span></div>
            <div class="info-row"><span class="info-label">Паспорт</span><span>{{ info.passport }}</span></div>
          </div>
        </ion-accordion>

        <ion-accordion value="money">
          <ion-item slot="header">
            <ion-icon :icon="cashOutline" slot="start" color="medium" />
            <ion-label><strong>Валюта и деньги</strong></ion-label>
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
            <ion-icon :icon="flashOutline" slot="start" color="medium" />
            <ion-label><strong>Практическое</strong></ion-label>
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
            <ion-icon :icon="warningOutline" slot="start" color="medium" />
            <ion-label><strong>Экстренное</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="info-row"><span class="info-label">Скорая / Пожарные</span><span>{{ info.emergency }}</span></div>
            <div class="info-row"><span class="info-label">Полиция</span><span>{{ info.police }}</span></div>
            <div class="info-row">
              <span class="info-label">Посольство</span>
              <span>{{ info.embassy }}<br /><a :href="'tel:' + info.embassyPhone">{{ info.embassyPhone }}</a></span>
            </div>
          </div>
        </ion-accordion>

        <ion-accordion value="docs">
          <ion-item slot="header">
            <ion-icon :icon="documentOutline" slot="start" color="medium" />
            <ion-label><strong>Документы</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div class="doc-item">
              <ion-icon :icon="airplaneOutline" style="font-size:16px;color:var(--color-text-2)" />
              <span>Билет МСК → Анталья (SU-2134)</span>
              <ion-button fill="clear" size="small"><ion-icon :icon="documentOutline" /></ion-button>
            </div>
            <div class="doc-item">
              <ion-icon :icon="airplaneOutline" style="font-size:16px;color:var(--color-text-2)" />
              <span>Билет Анталья → МСК (SU-2135)</span>
              <ion-button fill="clear" size="small"><ion-icon :icon="documentOutline" /></ion-button>
            </div>
            <div class="doc-item">
              <ion-icon :icon="bedOutline" style="font-size:16px;color:var(--color-text-2)" />
              <span>Hotel Sunrise</span>
              <ion-button fill="clear" size="small"><ion-icon :icon="documentOutline" /></ion-button>
            </div>
            <div class="doc-item">
              <ion-icon :icon="shieldCheckmarkOutline" style="font-size:16px;color:var(--color-text-2)" />
              <span>Страховка АА-123456</span>
              <ion-button fill="clear" size="small"><ion-icon :icon="documentOutline" /></ion-button>
            </div>
          </div>
        </ion-accordion>

        <ion-accordion value="links">
          <ion-item slot="header">
            <ion-icon :icon="linkOutline" slot="start" color="medium" />
            <ion-label><strong>Ссылки</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <ion-list>
              <ion-item-sliding v-for="link in tripLinks" :key="link.id">
                <ion-item lines="none" class="link-ion-item">
                  <ion-label>
                    <a :href="link.url" target="_blank" class="link-title-a">{{ link.title || link.url }}</a>
                    <p class="link-meta-text">
                      <span v-if="link.category" class="link-category">{{ link.category }}</span>
                      · {{ store.getUserName(link.createdBy) }}
                      <span v-if="link.comment"> · {{ link.comment }}</span>
                    </p>
                  </ion-label>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" @click="confirmDeleteLink(link)">Удалить</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>
            <ion-button fill="outline" expand="block" size="small" class="ion-margin-top" @click="showAddLink = true">
              <ion-icon :icon="addOutline" slot="start" /> Добавить ссылку
            </ion-button>
          </div>
        </ion-accordion>

        <ion-accordion value="phrases">
          <ion-item slot="header">
            <ion-icon :icon="chatbubbleOutline" slot="start" color="medium" />
            <ion-label><strong>Разговорник: турецкий</strong></ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <div v-for="(phrase, i) in info.phrases" :key="i" class="phrase-row">
              <span class="phrase-ru">{{ phrase.ru }}</span>
              <span class="phrase-local">{{ phrase.local }}</span>
              <ion-button fill="clear" size="small"><ion-icon :icon="volumeHighOutline" /></ion-button>
            </div>
          </div>
        </ion-accordion>
      </ion-accordion-group>

      <!-- Participants -->
      <div class="section-header">Участники ({{ activeMembers.length }})</div>
      <ion-list>
        <ion-item v-for="m in activeMembers" :key="m.userId">
          <ion-avatar slot="start" class="member-avatar"><div class="avatar-letter" :style="{ background: avatarColor(m.userId) }">{{ store.getUserName(m.userId)[0] }}</div></ion-avatar>
          <ion-label>
            <h3>{{ store.getUserName(m.userId) }} <span v-if="getWalletName(m.userId)" class="wallet-badge">{{ getWalletName(m.userId) }}</span></h3>
            <p>{{ m.role === 'organizer' ? 'Организатор' : 'Участник' }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <template v-if="leftMembers.length">
        <div class="section-header">Вышли из поездки</div>
        <ion-list>
          <ion-item v-for="m in leftMembers" :key="m.userId" class="left-member-item">
            <ion-avatar slot="start" class="member-avatar" style="opacity:0.4"><div class="avatar-letter" :style="{ background: avatarColor(m.userId) }">{{ store.getUserName(m.userId)[0] }}</div></ion-avatar>
            <ion-label>
              <h3>{{ store.getUserName(m.userId) }}</h3>
              <p>Покинул(а) {{ formatDate(m.leftAt!) }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>

      <ion-button fill="outline" expand="block" class="ion-margin" @click="showPdfAlert = true">
        <ion-icon :icon="shareOutline" slot="start" /> Экспорт в PDF
      </ion-button>
      <ion-alert :is-open="showPdfAlert" header="Экспорт в PDF" message="Генерация PDF будет доступна при подключении бэкенда." :buttons="['OK']" @did-dismiss="showPdfAlert = false" />
    </ion-content>

    <ion-modal :is-open="showAddLink" @did-dismiss="showAddLink = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showAddLink = false">Отмена</ion-button></ion-buttons>
        <ion-title>Новая ссылка</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveLink" :disabled="!linkUrl" strong>Добавить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="linkUrl" label="URL" label-placement="floating" placeholder="https://..." /></ion-item>
        <ion-item><ion-input v-model="linkTitle" label="Название" label-placement="floating" /></ion-item>
        <ion-item>
          <ion-select v-model="linkCategory" label="Категория" label-placement="floating">
            <ion-select-option value="Жильё">Жильё</ion-select-option>
            <ion-select-option value="Еда">Еда</ion-select-option>
            <ion-select-option value="Что посмотреть">Что посмотреть</ion-select-option>
            <ion-select-option value="Другое">Другое</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <ion-alert :is-open="showDeleteLinkAlert" header="Удалить ссылку?" :message="'«' + deletingLinkTitle + '» будет удалена.'" :buttons="deleteLinkButtons" @did-dismiss="showDeleteLinkAlert = false" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon,
  IonAccordionGroup, IonAccordion, IonButton, IonButtons, IonAvatar, IonModal,
  IonInput, IonSelect, IonSelectOption, IonAlert,
  IonItemSliding, IonItemOptions, IonItemOption,
} from '@ionic/vue'
import {
  flagOutline, cashOutline, flashOutline, warningOutline, documentOutline,
  linkOutline, chatbubbleOutline, volumeHighOutline, addOutline, shareOutline,
  airplaneOutline, bedOutline, shieldCheckmarkOutline,
} from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import { turkeyInfo } from '../../data/mock'
import type { Link } from '../../types'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const tripLinks = computed(() => store.getTripLinks(tripId.value))
const activeMembers = computed(() => store.getActiveMembers(tripId.value))
const leftMembers = computed(() => store.getLeftMembers(tripId.value))
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
const showPdfAlert = ref(false)
const linkUrl = ref('')
const linkTitle = ref('')
const linkCategory = ref('Другое')

const showDeleteLinkAlert = ref(false)
const deletingLinkId = ref('')
const deletingLinkTitle = ref('')
const deleteLinkButtons = computed(() => [{ text: 'Отмена', role: 'cancel' }, { text: 'Удалить', role: 'destructive', handler: () => { store.deleteLink(deletingLinkId.value) } }])

const AVATAR_COLORS = ['#4F46E5', '#0D9488', '#D97706', '#DC2626', '#7C3AED', '#059669', '#DB2777', '#2563EB']
function avatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getWalletName(userId: string) { const w = store.getWalletForUser(tripId.value, userId); return w?.name ?? null }
function confirmDeleteLink(link: Link) { deletingLinkId.value = link.id; deletingLinkTitle.value = link.title || link.url; showDeleteLinkAlert.value = true }
function pluralDays(n: number) { if (n % 10 === 1 && n % 100 !== 11) return 'день'; if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'дня'; return 'дней' }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function saveLink() {
  if (!linkUrl.value) return
  store.addLink(tripId.value, linkUrl.value, linkTitle.value, linkCategory.value, auth.user?.id ?? '')
  showAddLink.value = false; linkUrl.value = ''; linkTitle.value = ''
}
</script>

<style scoped>
.countdown-number { font-size: 48px; font-weight: 700; color: var(--color-accent); line-height: 1.1; margin: 8px 0; }
.accordion-content { padding: 8px 16px 16px; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border); font-size: 15px; gap: 12px; }
.info-label { color: var(--color-text-2); min-width: 100px; flex-shrink: 0; }
.doc-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--color-border); font-size: 15px; }
.doc-item span { flex: 1; }
.link-ion-item { --padding-start: 0; --inner-padding-end: 0; }
.link-title-a { color: var(--color-accent); text-decoration: none; font-size: 15px; }
.link-meta-text { font-size: 12px; color: var(--color-text-3); margin-top: 2px; }
.link-category { background: var(--color-accent-bg); color: var(--color-accent); padding: 1px 6px; border-radius: 4px; font-size: 11px; }
.phrase-row { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-border); gap: 8px; }
.phrase-ru { flex: 1; font-size: 15px; color: var(--color-text-1); }
.phrase-local { flex: 1; font-size: 15px; font-weight: 700; color: var(--color-accent); }
.member-avatar { --border-radius: 50%; width: 32px; height: 32px; }
.avatar-letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; border-radius: 50%; }
.left-member-item { opacity: 0.5; }
</style>
