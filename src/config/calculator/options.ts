/**
 * Calculator Options Configuration
 *
 * This is a boilerplate example. Customize these options for your specific use case.
 */

export interface Option {
  id: string;
  value: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  price?: number; // For pricing calculations
  popular?: boolean; // To highlight popular options
}

export const STEP_OPTIONS: Record<string, Option[]> = {
  // Step 1: Service Type
  step1: [
    {
      id: 'service-basic',
      value: 'basic',
      title: 'Alapcsomag',
      description: 'Kezdőknek ideális megoldás',
      image: 'https://via.placeholder.com/200/3b82f6/ffffff?text=Alap',
      price: 50000,
    },
    {
      id: 'service-standard',
      value: 'standard',
      title: 'Standard csomag',
      description: 'A legtöbben ezt választják',
      image: 'https://via.placeholder.com/200/10b981/ffffff?text=Standard',
      price: 100000,
      popular: true,
    },
    {
      id: 'service-premium',
      value: 'premium',
      title: 'Prémium csomag',
      description: 'Professzionális megoldás',
      image: 'https://via.placeholder.com/200/8b5cf6/ffffff?text=Premium',
      price: 200000,
    },
    {
      id: 'service-custom',
      value: 'custom',
      title: 'Egyedi csomag',
      description: 'Teljes testreszabás',
      image: 'https://via.placeholder.com/200/f59e0b/ffffff?text=Egyedi',
      price: 0, // Custom pricing
    },
  ],

  // Step 2: Additional Services (checkboxes)
  step2: [
    {
      id: 'addon-support',
      value: 'support',
      title: 'Kiterjesztett támogatás',
      description: '24/7 ügyfélszolgálat',
      image: 'https://via.placeholder.com/80/06b6d4/ffffff?text=%F0%9F%8E%A7',
      price: 20000,
    },
    {
      id: 'addon-training',
      value: 'training',
      title: 'Képzés',
      description: 'Személyre szabott oktatás',
      image: 'https://via.placeholder.com/80/8b5cf6/ffffff?text=%F0%9F%93%9A',
      price: 30000,
    },
    {
      id: 'addon-consulting',
      value: 'consulting',
      title: 'Tanácsadás',
      description: 'Szakértői segítség',
      image: 'https://via.placeholder.com/80/f59e0b/ffffff?text=%F0%9F%92%A1',
      price: 50000,
      popular: true,
    },
    {
      id: 'addon-maintenance',
      value: 'maintenance',
      title: 'Karbantartás',
      description: 'Havi rendszeres karbantartás',
      image: 'https://via.placeholder.com/80/10b981/ffffff?text=%F0%9F%94%A7',
      price: 15000,
    },
  ],

  // Step 3: Timeline
  step3: [
    {
      id: 'timeline-urgent',
      value: 'urgent',
      title: 'Sürgős (1-2 hét)',
      description: 'Extra díj ellenében',
      image: 'https://via.placeholder.com/200/ef4444/ffffff?text=Surgos',
      price: 50000, // Surcharge
    },
    {
      id: 'timeline-normal',
      value: 'normal',
      title: 'Normál (3-4 hét)',
      description: 'Ajánlott időkeret',
      image: 'https://via.placeholder.com/200/10b981/ffffff?text=Normal',
      price: 0,
      popular: true,
    },
    {
      id: 'timeline-flexible',
      value: 'flexible',
      title: 'Rugalmas (1-2 hónap)',
      description: 'Kedvezményes árral',
      image: 'https://via.placeholder.com/200/3b82f6/ffffff?text=Rugalmas',
      price: -20000, // Discount
    },
    {
      id: 'timeline-later',
      value: 'later',
      title: 'Későbbi időpontban',
      description: 'Még nem biztos',
      image: 'https://via.placeholder.com/200/6b7280/ffffff?text=Kesobb',
      price: 0,
    },
  ],
};

// Helper function to get options for a step
export function getOptionsForStep(stepId: string): Option[] {
  return STEP_OPTIONS[stepId] || [];
}

// Helper function to calculate total price
export function calculateTotalPrice(answers: Record<string, any>): number {
  let total = 0;

  Object.entries(answers).forEach(([stepId, answer]) => {
    const options = getOptionsForStep(stepId);

    if (Array.isArray(answer)) {
      // Multiple selection (checkboxes)
      answer.forEach((value: string) => {
        const option = options.find(opt => opt.value === value);
        if (option?.price) {
          total += option.price;
        }
      });
    } else {
      // Single selection (radio)
      const option = options.find(opt => opt.value === answer);
      if (option?.price) {
        total += option.price;
      }
    }
  });

  return total;
}
