<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="login-container">
        <ion-icon :icon="airplaneOutline" class="login-logo" />
        <h1 class="login-title">TripMate</h1>
        <p class="login-subtitle">Путешествуй с друзьями</p>

        <div class="login-form">
          <ion-item lines="none" class="login-input">
            <ion-input v-model="username" label="Логин" label-placement="floating" placeholder="Введите логин" @keyup.enter="handleLogin" />
          </ion-item>

          <ion-item lines="none" class="login-input">
            <ion-input v-model="password" label="Пароль" label-placement="floating" type="password" placeholder="Введите пароль" @keyup.enter="handleLogin" />
          </ion-item>

          <ion-button expand="block" class="login-btn" @click="handleLogin" :disabled="!username || !password">
            Войти
          </ion-button>

          <p v-if="error" class="login-error">{{ error }}</p>

          <div class="login-divider"><span>или</span></div>

          <ion-button expand="block" fill="outline" class="social-btn" disabled>
            <ion-icon :icon="logoApple" slot="start" /> Войти через Apple
          </ion-button>
          <ion-button expand="block" fill="outline" class="social-btn" disabled>
            <ion-icon :icon="logoGoogle" slot="start" /> Войти через Google
          </ion-button>
          <ion-button expand="block" fill="outline" class="social-btn" disabled>
            <ion-icon :icon="paperPlaneOutline" slot="start" /> Войти через Telegram
          </ion-button>

          <p class="login-hint">
            Тестовый вход: логин <strong>Test</strong>, пароль <strong>123</strong>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonIcon } from '@ionic/vue'
import { airplaneOutline, logoApple, logoGoogle, paperPlaneOutline } from 'ionicons/icons'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  error.value = ''
  if (auth.login(username.value, password.value)) {
    router.push('/home')
  } else {
    error.value = 'Неверный логин или пароль'
  }
}
</script>

<style scoped>
.login-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100%; max-width: 400px; margin: 0 auto; padding: 32px 16px;
}
.login-logo { font-size: 48px; color: var(--color-accent); margin-bottom: 8px; }
.login-title { font-size: 24px; font-weight: 700; color: var(--color-accent); margin: 0; }
.login-subtitle { font-size: 15px; color: var(--color-text-2); margin: 4px 0 32px; }
.login-form { width: 100%; }
.login-input { --background: var(--color-surface); border-radius: 12px; margin-bottom: 12px; --border-radius: 12px; border: 1px solid var(--color-border); }
.login-btn { --border-radius: 12px; margin-top: 8px; height: 48px; font-size: 15px; font-weight: 700; }
.login-error { color: var(--color-danger); text-align: center; font-size: 15px; margin: 8px 0; }
.login-divider { display: flex; align-items: center; margin: 24px 0; color: var(--color-text-3); font-size: 12px; }
.login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
.login-divider span { padding: 0 16px; }
.social-btn { --border-radius: 12px; margin-bottom: 8px; height: 44px; --color: var(--color-text-1); --border-color: var(--color-border); }
.login-hint { text-align: center; font-size: 12px; color: var(--color-text-3); margin-top: 24px; }
</style>
