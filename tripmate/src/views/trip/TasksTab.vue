<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Дела</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddTask">
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
          <ion-item-sliding v-for="task in getTasksBySection(section)" :key="task.id">
            <ion-item @click="toggleTask(task.id)">
              <ion-checkbox slot="start" :checked="task.isCompleted" @ion-change="toggleTask(task.id)" />
              <ion-label :class="{ completed: task.isCompleted }">
                <h3>{{ task.title }}</h3>
                <p v-if="task.assigneeId || task.deadline">
                  <span v-if="task.assigneeId">{{ store.getUserName(task.assigneeId) }}</span>
                  <span v-if="task.deadline"> · {{ formatDate(task.deadline) }}</span>
                </p>
              </ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="primary" @click="openEditTask(task)">Изменить</ion-item-option>
              <ion-item-option color="danger" @click="confirmDeleteTask(task)">Удалить</ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </template>

      <div v-if="!sections.length" class="empty-state">
        <p>Нет задач</p>
        <ion-button @click="openAddTask">Добавить задачу</ion-button>
      </div>
    </ion-content>

    <ion-modal :is-open="showModal" @did-dismiss="showModal = false">
      <ion-header><ion-toolbar>
        <ion-buttons slot="start"><ion-button @click="showModal = false">Отмена</ion-button></ion-buttons>
        <ion-title>{{ editingTaskId ? 'Редактировать' : 'Новая задача' }}</ion-title>
        <ion-buttons slot="end"><ion-button @click="saveTask" :disabled="!formTitle" strong>Сохранить</ion-button></ion-buttons>
      </ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-item><ion-input v-model="formTitle" label="Задача" label-placement="floating" placeholder="Что нужно сделать" /></ion-item>
        <ion-item>
          <ion-select v-model="formSection" label="Секция" label-placement="floating">
            <ion-select-option v-for="s in allSectionOptions" :key="s" :value="s">{{ s }}</ion-select-option>
            <ion-select-option value="__new__">+ Новая секция</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-if="formSection === '__new__'">
          <ion-input v-model="newSectionName" label="Название секции" label-placement="floating" />
        </ion-item>
        <ion-item>
          <ion-select v-model="formAssignee" label="Ответственный" label-placement="floating">
            <ion-select-option value="">Все</ion-select-option>
            <ion-select-option v-for="m in trip?.members" :key="m.userId" :value="m.userId">{{ store.getUserName(m.userId) }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-content>
    </ion-modal>

    <ion-alert :is-open="showDeleteAlert" header="Удалить задачу?" :message="'«' + deletingTitle + '» будет удалена.'" :buttons="deleteAlertButtons" @did-dismiss="showDeleteAlert = false" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonCheckbox, IonButtons, IonButton, IonIcon, IonModal, IonInput, IonSelect, IonSelectOption,
  IonItemSliding, IonItemOptions, IonItemOption, IonAlert,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useTripsStore } from '../../stores/trips'
import { useAuthStore } from '../../stores/auth'
import type { Task } from '../../types'

const route = useRoute()
const store = useTripsStore()
const auth = useAuthStore()

const tripId = computed(() => route.params.tripId as string)
const trip = computed(() => store.trips.find(t => t.id === tripId.value))
const sections = computed(() => store.getTaskSections(tripId.value))
const allTasks = computed(() => store.getTripTasks(tripId.value))
const allSectionOptions = computed(() => { const s = store.getTaskSections(tripId.value); return s.length ? s : ['До поездки', 'Что взять', 'В поездке'] })

const showModal = ref(false)
const editingTaskId = ref<string | null>(null)
const formTitle = ref('')
const formSection = ref('')
const formAssignee = ref('')
const newSectionName = ref('')

const showDeleteAlert = ref(false)
const deletingId = ref('')
const deletingTitle = ref('')
const deleteAlertButtons = computed(() => [{ text: 'Отмена', role: 'cancel' }, { text: 'Удалить', role: 'destructive', handler: () => { store.deleteTask(deletingId.value) } }])

function getTasksBySection(section: string) { return allTasks.value.filter(t => t.section === section) }
function sectionProgress(section: string) { const tasks = getTasksBySection(section); return `${tasks.filter(t => t.isCompleted).length}/${tasks.length}` }
function toggleTask(taskId: string) { store.toggleTask(taskId, auth.user?.id ?? '') }

function openAddTask() { editingTaskId.value = null; formTitle.value = ''; formSection.value = allSectionOptions.value[0] || 'До поездки'; formAssignee.value = ''; newSectionName.value = ''; showModal.value = true }
function openEditTask(task: Task) { editingTaskId.value = task.id; formTitle.value = task.title; formSection.value = task.section; formAssignee.value = task.assigneeId ?? ''; newSectionName.value = ''; showModal.value = true }

function saveTask() {
  if (!formTitle.value) return
  const section = formSection.value === '__new__' ? newSectionName.value : formSection.value
  if (!section) return
  if (editingTaskId.value) store.updateTask(editingTaskId.value, { title: formTitle.value, section, assigneeId: formAssignee.value || undefined })
  else store.addTask(tripId.value, formTitle.value, section, formAssignee.value || undefined, auth.user?.id ?? '')
  showModal.value = false
}

function confirmDeleteTask(task: Task) { deletingId.value = task.id; deletingTitle.value = task.title; showDeleteAlert.value = true }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d.getDate()} ${months[d.getMonth()]}`
}
</script>

<style scoped>
.section-count { font-weight: 400; color: var(--color-text-3); }
.completed { text-decoration: line-through; opacity: 0.5; }
.empty-state { text-align: center; padding: 40px 20px; color: var(--color-text-2); }
</style>
