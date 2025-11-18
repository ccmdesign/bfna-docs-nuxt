<template>
  <div
    v-if="visible"
    class="cookie-consent"
    role="dialog"
    aria-live="polite"
    aria-label="Cookie preferences"
  >
    <div class="cookie-consent__panel">
      <div class="cookie-consent__intro">
        <p class="cookie-consent__lead">
          This site uses cookies to keep features working smoothly and provide tailored experiences.
          Help us balance what’s required for basic navigation and what can be stored for insights and personalization.
        </p>
        <!-- <p class="cookie-consent__detail">
          Toggle the optional categories below while necessary cookies remain active for core functionality.
        </p> -->
      </div>
      <!--
      <div class="cookie-consent__grid">
        <label
          v-for="category in categories"
          :key="category.key"
          class="cookie-consent__category"
        >
          <input type="checkbox" v-model="pending[category.key]" :aria-label="category.title" />
          <div>
            <span class="cookie-consent__category-title">{{ category.title }}</span>
            <span class="cookie-consent__category-description">{{ category.description }}</span>
          </div>
        </label>
      </div>
      -->
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__secondary" @click="handleReject">
          Necessary cookies
        </button>
        <div class="cookie-consent__cta">
          <button type="button" class="cookie-consent__secondary" @click="handleSavePreferences">
            Save preferences
          </button>
          <button type="button" class="cookie-consent__primary" @click="handleAcceptAll">
            Accept all
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="hasSavedConsent" class="cookie-consent__manage">
    <button
      type="button"
      class="cookie-consent__manage-button"
      @click="openPreferences"
      aria-label="Manage cookies"
    >
      <span aria-hidden="true" class="material-symbols-outlined">cookie</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useCookie, useCookieConsent } from '#imports';

type ConsentCategoryKey = 'functional' | 'statistic' | 'marketing';

interface ConsentCategory {
  key: ConsentCategoryKey;
  title: string;
  description: string;
}

const categories: ConsentCategory[] = [
  {
    key: 'functional',
    title: 'Functional cookies',
    description: 'Smooth layouts, language preferences, and in-page helpers stay responsive.'
  },
  {
    key: 'statistic',
    title: 'Analytics & Microsoft Clarity',
    description: 'Power session insights, heatmaps, and behavior flows so we can improve the experience.'
  },
  {
    key: 'marketing',
    title: 'Marketing cookies',
    description: 'Let us tailor related stories and partner content to your interests.'
  }
];

const { state } = useCookieConsent();

const consentCookie = useCookie('nc_cookie_consent', {
  sameSite: 'lax',
  path: '/',
  maxAge: 31536000,
  encode: (value) => {
    if (!value) return undefined;
    try {
      return encodeURIComponent(JSON.stringify(value));
    } catch {
      return undefined;
    }
  },
  decode: (value) => {
    if (!value) return null;
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
});

const pending = reactive<Record<ConsentCategoryKey, boolean>>(
  categories.reduce((acc, category) => {
    acc[category.key] = Boolean(state.value[category.key]);
    return acc;
  }, {} as Record<ConsentCategoryKey, boolean>)
);

const visible = ref(false);
const normalizedConsent = (value: Partial<Record<ConsentCategoryKey, boolean>>) => ({
  functional: Boolean(value.functional),
  statistic: Boolean(value.statistic),
  marketing: Boolean(value.marketing)
});

const hasSavedConsent = computed(() => Boolean(consentCookie.value?.acknowledged));

let clarityTimeoutId: ReturnType<typeof window.setTimeout> | null = null;
const sendClarityConsent = (payload: Record<ConsentCategoryKey, boolean>) => {
  if (!import.meta.client) return;
  const signal = {
    ad_Storage: payload.marketing ? 'granted' : 'denied',
    analytics_Storage: payload.statistic ? 'granted' : 'denied'
  };
  if (clarityTimeoutId) {
    clearTimeout(clarityTimeoutId);
    clarityTimeoutId = null;
  }
  let attempts = 0;
  const attempt = () => {
    if (typeof window.clarity === 'function') {
      window.clarity('consent', signal);
      clarityTimeoutId = null;
      return;
    }
    if (attempts < 10) {
      attempts += 1;
      clarityTimeoutId = window.setTimeout(attempt, 250);
    }
  };
  attempt();
};

const applyConsentState = (payload: Record<ConsentCategoryKey, boolean>) => {
  Object.assign(state.value, {
    functional: payload.functional,
    statistic: payload.statistic,
    marketing: payload.marketing
  });
  Object.assign(pending, payload);
  sendClarityConsent(payload);
};

const persistConsent = (payload: Record<ConsentCategoryKey, boolean>) => {
  consentCookie.value = {
    ...payload,
    timestamp: new Date().toISOString(),
    acknowledged: true
  };
};

const setConsent = (payload: Partial<Record<ConsentCategoryKey, boolean>>) => {
  const normalized = normalizedConsent(payload);
  applyConsentState(normalized);
  persistConsent(normalized);
  visible.value = false;
};

const handleAcceptAll = () =>
  setConsent({
    functional: true,
    statistic: true,
    marketing: true
  });

const handleReject = () =>
  setConsent({
    functional: false,
    statistic: false,
    marketing: false
  });

const handleSavePreferences = () => setConsent(normalizedConsent(pending));

const openPreferences = () => {
  Object.assign(pending, normalizedConsent(state.value));
  visible.value = true;
};

onMounted(() => {
  const saved = consentCookie.value;
  const normalized = normalizedConsent(saved ?? {});
  Object.assign(pending, normalized);
  if (saved?.acknowledged) {
    applyConsentState(normalized);
    visible.value = false;
  } else {
    visible.value = true;
  }
});

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  inset: auto 0 0;
  width: 100%;
  padding: var(--space-s) var(--space-xs);
  display: flex;
  justify-content: center;
  z-index: 1000;
}

.cookie-consent__panel {
  width: min(1200px, calc(100% - var(--space-s-m)));
  border-radius: var(--border-radius-l);
  background-color: var(--base-color);
  color: var(--white-color);
  padding: var(--space-m);
  box-shadow: var(--box-shadow-l);
  border: 1px solid hsla(var(--white-hsl), 0.15);
  display: flex;
  flex-direction: column;
  gap: var(--space-m);
}

.cookie-consent__intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.cookie-consent__lead {
  font-size: var(--size-0);
  font-weight: 600;
  margin: 0;
}

.cookie-consent__detail {
  font-size: var(--size--1);
  margin: 0;
  color: hsla(var(--white-hsl), 0.85);
}

.cookie-consent__grid {
  display: grid;
  /* grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); */
  gap: var(--space-s);
}

.cookie-consent__category {
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
  padding: var(--space-s);
  align-items: flex-start;
  background-color: hsla(var(--white-hsl), 0.08);
  border-radius: var(--border-radius-m);
  border: 1px solid hsla(var(--white-hsl), 0.15);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.cookie-consent__category input {
  margin-top: 0.3rem;
  width: 18px;
  min-width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.cookie-consent__category-title {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.cookie-consent__category-description {
  display: block;
  font-size: var(--size--1);
  color: hsla(var(--white-hsl), 0.8);
}

.cookie-consent__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: end;
  gap: var(--space-s);
}

.cookie-consent__secondary,
.cookie-consent__primary,
.cookie-consent__manage-button {
  font: inherit;
  border-radius: var(--border-radius-m);
  border: 1px solid transparent;
  cursor: pointer;
  padding: var(--space-xs) var(--space-s);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cookie-consent__secondary {
  background-color: transparent;
  border-color: hsla(var(--white-hsl), 0.4);
  color: var(--white-color);
}

.cookie-consent__secondary:hover,
.cookie-consent__secondary:focus-visible {
  opacity: 0.9;
}

.cookie-consent__primary {
  background-color: var(--white-color);
  color: var(--base-color);
  font-weight: 600;
}

.cookie-consent__primary:hover,
.cookie-consent__primary:focus-visible {
  transform: translateY(-1px);
}

.cookie-consent__manage {
  position: fixed;
  bottom: var(--space-s);
  right: var(--space-s);
  z-index: 1000;
}

.cookie-consent__manage-button {
  border-color: hsla(var(--white-hsl), 0.4);
  background-color: var(--base-color);
  color: var(--white-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  min-width: 48px;
  padding: 0;
  border-radius: 50%;
}

.cookie-consent__manage-button .material-symbols-outlined {
  font-size: 1.25rem;
  line-height: 1;
}

.cookie-consent__manage-button:hover,
.cookie-consent__manage-button:focus-visible {
  opacity: 0.85;
}


.cookie-consent__cta {
  display: flex;
  gap: var(--space-s);
}

@media (max-width: 640px) {
  .cookie-consent__panel {
    padding: var(--space-s);
  }

  .cookie-consent__cta {
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    width: 100%;
  }

  .cookie-consent__primary,
  .cookie-consent__secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
