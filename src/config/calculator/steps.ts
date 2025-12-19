/**
 * Calculator Steps Configuration
 *
 * This is a boilerplate example. Customize these steps for your specific use case.
 */

export interface Step {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'radio' | 'checkbox' | 'form';
  required: boolean;
}

export const STEPS: Step[] = [
  {
    id: 'step1',
    slug: 'step-1',
    title: 'Milyen szolgáltatásra van szüksége?',
    description: 'Válasszon a lehetőségek közül',
    type: 'radio',
    required: true,
  },
  {
    id: 'step2',
    slug: 'step-2',
    title: 'Milyen kiegészítő szolgáltatások érdeklik?',
    description: 'Válasszon egyet vagy többet',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'step3',
    slug: 'step-3',
    title: 'Mikor tervezi a megvalósítást?',
    description: 'Válasszon egy időpontot',
    type: 'radio',
    required: true,
  },
  {
    id: 'contact',
    slug: 'contact',
    title: 'Még csak egy lépés az ajánlatig!',
    description: 'Adja meg elérhetőségeit, hogy elküldhessük az ajánlatot',
    type: 'form',
    required: true,
  },
];

// Helper functions
export function getStepBySlug(slug: string): Step | undefined {
  return STEPS.find(step => step.slug === slug);
}

export function getStepById(id: string): Step | undefined {
  return STEPS.find(step => step.id === id);
}

export function getStepIndex(slug: string): number {
  return STEPS.findIndex(step => step.slug === slug);
}

export function getNextStep(currentSlug: string): Step | null {
  const currentIndex = getStepIndex(currentSlug);
  if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
    return null;
  }
  return STEPS[currentIndex + 1];
}

export function getPrevStep(currentSlug: string): Step | null {
  const currentIndex = getStepIndex(currentSlug);
  if (currentIndex <= 0) {
    return null;
  }
  return STEPS[currentIndex - 1];
}

export function getTotalSteps(): number {
  return STEPS.length;
}

export function getProgressPercentage(currentSlug: string): number {
  const index = getStepIndex(currentSlug);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STEPS.length) * 100);
}
