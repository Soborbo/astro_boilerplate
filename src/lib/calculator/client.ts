/**
 * ⚠️ MINDEN CLIENT LOGIC EBBEN A FÁJLBAN
 * Ne írj inline <script> blokkokat a komponensekbe!
 */

import { getSuggestion } from './email-typo';
import { lookupCitySync } from './postcode';

// ============================================
// STATE MANAGEMENT
// ============================================

const STORAGE_KEY = 'calculator_state';
const UTM_KEY = 'calculator_utm';

export interface CalculatorState {
  sessionId: string;
  currentStep: string;
  answers: Record<string, unknown>;
  startedAt: number;
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function loadState(): CalculatorState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  return {
    sessionId: generateSessionId(),
    currentStep: '',
    answers: {},
    startedAt: Date.now(),
  };
}

export function saveState(updates: Partial<CalculatorState>): void {
  const current = loadState();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function saveAnswer(stepId: string, value: unknown): void {
  const state = loadState();
  state.answers[stepId] = value;
  saveState(state);
}

export function getAnswer<T = unknown>(stepId: string): T | undefined {
  return loadState().answers[stepId] as T | undefined;
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// UTM CAPTURE
// ============================================

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

export function captureUTM(): void {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  let hasUTM = false;

  UTM_PARAMS.forEach(param => {
    const value = params.get(param);
    if (value) {
      utm[param.replace('utm_', '')] = value;
      hasUTM = true;
    }
  });

  if (hasUTM) {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

export function getUTM(): Record<string, string> | null {
  try {
    const stored = localStorage.getItem(UTM_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// ============================================
// CALCULATOR CONTROLLER
// ============================================

interface ControllerOptions {
  stepId: string;
  nextStepSlug?: string;
  prevStepSlug?: string;
  autoAdvanceDelay?: number;
}

export function initCalculator(options: ControllerOptions): void {
  const { stepId, nextStepSlug, autoAdvanceDelay = 300 } = options;

  // Restore existing answers
  restoreAnswers(stepId);

  // Radio cards - auto advance with microinteraction
  document.querySelectorAll<HTMLInputElement>('[data-auto-advance="true"]')
    .forEach(input => {
      const card = input.closest('[data-radio-card]');

      input.addEventListener('change', () => {
        saveAnswer(stepId, input.value);

        // Microinteraction: pulse effect on selection
        if (card) {
          card.classList.add('scale-105', 'shadow-lg');
          setTimeout(() => {
            card.classList.remove('scale-105', 'shadow-lg');
          }, 200);
        }

        if (nextStepSlug) {
          setTimeout(() => {
            window.location.href = `/calculator/${nextStepSlug}`;
          }, autoAdvanceDelay);
        }
      });
    });

  // Checkbox next buttons
  const nextBtns = document.querySelectorAll<HTMLButtonElement>('[data-action="next"]');
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => handleCheckboxNext(stepId, nextStepSlug));
  });

  // Progress bar - click to go back
  document.querySelectorAll<HTMLAnchorElement>('[data-step-link]')
    .forEach(link => {
      const targetStep = parseInt(link.dataset.stepIndex || '0', 10);
      const currentStep = parseInt(link.dataset.currentIndex || '0', 10);

      if (targetStep >= currentStep) {
        link.addEventListener('click', (e) => e.preventDefault());
        link.style.cursor = 'not-allowed';
        link.style.opacity = '0.5';
      }
    });
}

function restoreAnswers(stepId: string): void {
  const answer = getAnswer(stepId);
  if (!answer) return;

  if (Array.isArray(answer)) {
    // Checkboxes
    answer.forEach(val => {
      const input = document.querySelector<HTMLInputElement>(`input[value="${val}"]`);
      if (input) {
        input.checked = true;
        // Visual feedback
        const card = input.closest('[data-checkbox-card]');
        if (card) {
          card.classList.add('ring-2', 'ring-primary');
        }
      }
    });
  } else {
    // Radio
    const input = document.querySelector<HTMLInputElement>(`input[value="${answer}"]`);
    if (input) {
      input.checked = true;
      // Visual feedback
      const card = input.closest('[data-radio-card]');
      if (card) {
        card.classList.add('ring-2', 'ring-primary');
      }
    }
  }
}

function handleCheckboxNext(stepId: string, nextStepSlug?: string): void {
  const checked = Array.from(
    document.querySelectorAll<HTMLInputElement>(`input[name="${stepId}[]"]:checked`)
  ).map(input => input.value);

  saveAnswer(stepId, checked);

  if (nextStepSlug) {
    window.location.href = `/calculator/${nextStepSlug}`;
  }
}

// ============================================
// EMAIL TYPO CHECK (with requestIdleCallback)
// ============================================

export function initEmailTypoCheck(): void {
  const emailInput = document.getElementById('email') as HTMLInputElement | null;
  const suggestionDiv = document.getElementById('email-suggestion');
  const fixBtn = document.getElementById('email-fix-btn');

  if (!emailInput || !suggestionDiv || !fixBtn) return;

  let suggestedEmail = '';

  emailInput.addEventListener('blur', () => {
    const check = () => {
      const suggestion = getSuggestion(emailInput.value);

      if (suggestion) {
        suggestedEmail = suggestion;
        fixBtn.textContent = suggestion;
        suggestionDiv.classList.remove('hidden');
        // Microinteraction: gentle slide in
        suggestionDiv.classList.add('animate-fade-in');
      } else {
        suggestionDiv.classList.add('hidden');
      }
    };

    // Non-blocking check
    if ('requestIdleCallback' in window) {
      requestIdleCallback(check, { timeout: 500 });
    } else {
      setTimeout(check, 0);
    }
  });

  fixBtn.addEventListener('click', () => {
    emailInput.value = suggestedEmail;
    suggestionDiv.classList.add('hidden');
    emailInput.focus();

    // Microinteraction: green flash
    emailInput.classList.add('bg-green-50');
    setTimeout(() => emailInput.classList.remove('bg-green-50'), 1000);
  });
}

// ============================================
// POSTCODE LOOKUP (with debounce)
// ============================================

export function initPostcodeLookup(locale: 'hu-HU' | 'en-GB'): void {
  const postcodeInput = document.getElementById('postcode') as HTMLInputElement | null;
  const cityInput = document.getElementById('city') as HTMLInputElement | null;
  const loadingEl = document.getElementById('postcode-loading');

  if (!postcodeInput || !cityInput) return;

  const triggerLength = locale === 'hu-HU' ? 4 : 5;
  let debounceTimer: number;

  postcodeInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const value = postcodeInput.value.trim();

    if (value.length >= triggerLength) {
      debounceTimer = window.setTimeout(async () => {
        // Try sync first (HU only)
        if (locale === 'hu-HU') {
          const city = lookupCitySync(value);
          if (city) {
            fillCity(cityInput, city);
            return;
          }
        }

        // Async API lookup
        loadingEl?.classList.remove('hidden');

        try {
          const response = await fetch(`/api/calculator/postcode?code=${encodeURIComponent(value)}`);
          const data = await response.json();

          if (data.city) {
            fillCity(cityInput, data.city);
          }
        } catch (e) {
          console.error('Postcode lookup failed:', e);
        } finally {
          loadingEl?.classList.add('hidden');
        }
      }, 300);
    }
  });
}

function fillCity(input: HTMLInputElement, city: string): void {
  if (!input.value) {
    input.value = city;
    // Microinteraction: green flash
    input.classList.add('bg-green-50', 'transition-colors', 'duration-500');
    setTimeout(() => {
      input.classList.remove('bg-green-50');
    }, 1000);
  }
}

// ============================================
// FORM SUBMISSION
// ============================================

export async function submitForm(formEl: HTMLFormElement): Promise<{
  success: boolean;
  quoteId?: string;
  errors?: Record<string, string[]>;
}> {
  const state = loadState();
  const formData = new FormData(formEl);

  const payload = {
    sessionId: state.sessionId,
    answers: state.answers,
    contact: {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      postcode: formData.get('postcode'),
      city: formData.get('city'),
      company: formData.get('company'), // honeypot
      formStartTime: formData.get('formStartTime'),
    },
    utm: getUTM(),
    meta: {
      landingPage: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
  };

  const response = await fetch('/api/calculator/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (result.success) {
    clearState();
  }

  return result;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-toast-in ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('animate-toast-in');
    toast.classList.add('animate-toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
