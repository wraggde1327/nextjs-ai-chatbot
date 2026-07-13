<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Дела</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddModal = true">
            <ion-icon :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <template v-for="section in sections" :key="section">
        <div class="section-header">
          {{ section }}
          <span class="section-count">({{ sectionProgress(section) }})</span>
        </div>
        <ion-list>
          <ion-item v-for="task in getTasksBySection(section)" :key="task.id" @click="toggleTask(task.id)">
            <ion-checkbox slot="start" :checked="task.isCompleted" @ion-change="toggleTask(task.id)" />
            <ion-label :class="{ completed: task.isCompleted }">
              <h3>{{ task.title }}</h3>
              <p v-if="task.assigneeId || task.deadline">
                <span v-if="task.assigneeId">👤 {{ store.getUserName(task.assigneeId) }}</span>
                <span v-if="task.deadline"> · 📅 {{ formatDate(task.deadline) }}</span>
              </p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>
    </ion-content>

    <ion-modal :is-open="showAddModal" @did-dismiss="showAddModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Новая задача</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddModal = false">Закрыть</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="newTitle" label="Задача" label-placement="floating" placeholder="Что нужно сделать" />
        </ion-item>
        <ion-item>
          <ion-select v-model="newSection" label="Секция" label-placement="floating">
            <ion-select-option v-for="s in sections" :key="s" :value="s">{{ s }}</ion-select-option>
            <ion-select-option value="__new__">+ Новая секция</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-if="newSection === '__new__'">
          <ion-input v-model="newSectionName" label="Название секции" label-placement="floating" />
        </ion-item>
        <ion-item>
          <ion-select v-model="newAssignee" label="Ответственный" label-placement="floating">
            <ion-select-option value="">Все</ion-select-option>
            <ion-select-option v-for="m in trip?.members" :key="m.userId" :value="m.userId">
              {{ store.getUserName(m.userId) }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="addTask" :disabled="!newTitle">
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
  IonCheckbox, IonButtons, IonButton, IonIcon, IonModal, IonInput, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))

const sections = computed(() => store.getTaskSections(tripId.value))
const allTasks = computed(() => store.getTripTasks(tripId.value))

const showAddModal = ref(false)
const newTitle = ref('')
const newSection = ref('')
const newSectionName = ref('')
const newAssignee = ref('')

function getTasksBySection(section: string) {
  return allTasks.value.filter(t => t.section === section)
}

function sectionProgress(section: string) {
  const tasks = getTasksBySection(section)
  const done = tasks.filter(t => t.isCompleted).length
  return `${done}/${tasks.length}`
}

function toggleTask(taskId: string) {
  store.toggleTask(taskId, auth.user?.id ?? '')
}

function addTask() {
  if (!newTitle.value) return
  const section = newSection.value === '__new__' ? newSectionName.value : newSection.value
  if (!section) return
  store.addTask(tripId.value, newTitle.value, section, newAssignee.value || undefined, auth.user?.id ?? '')
  newTitle.value = ''
  newSection.value = ''
  showAddModal.value = false
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
.section-count {
  font-weight: 400;
  color: #9CA3AF;
}
.completed {
  text-decoration: line-through;
  opacity: 0.5;
}
</style>
