import { employees, newJoiners } from '@/components/newsletter/newsletter-data';

export type GreetType = 'birthday' | 'anniversary' | 'welcome';

export type GreetPerson = {
  id: string;
  name: string;
  role: string;
  department: string;
  photo: string;
  metaLabel: string;
  metaValue: string;
};

export function isGreetType(value: string): value is GreetType {
  return value === 'birthday' || value === 'anniversary' || value === 'welcome';
}

export function getGreetConfig(type: GreetType) {
  if (type === 'birthday') {
    return {
      title: 'Send Birthday Wish',
      eyebrow: 'Celebrate',
      accent: 'sky' as const,
      cta: 'Send Wish',
      placeholders: [
        'Wishing you a wonderful birthday filled with joy and success!',
        'Happy Birthday! Grateful to have you on the team — enjoy your special day.',
        'Have an amazing birthday! Looking forward to another great year together.',
      ],
    };
  }
  if (type === 'anniversary') {
    return {
      title: 'Send Anniversary Wish',
      eyebrow: 'Appreciate',
      accent: 'amber' as const,
      cta: 'Send Wish',
      placeholders: [
        'Congratulations on your work anniversary! Thank you for your contributions.',
        'Happy work anniversary! Your dedication continues to inspire the team.',
        'Proud to celebrate another year of your impact — congratulations!',
      ],
    };
  }
  return {
    title: 'Welcome New Joiner',
    eyebrow: 'Welcome',
    accent: 'emerald' as const,
    cta: 'Send Welcome',
    placeholders: [
      'Welcome to the team! Excited to have you with us — wishing you a great start.',
      'A warm welcome aboard! Looking forward to collaborating and learning together.',
      'Welcome! If you need anything as you settle in, feel free to reach out.',
    ],
  };
}

export function resolveGreetPerson(type: GreetType, id: string): GreetPerson | null {
  if (type === 'welcome') {
    const person = newJoiners.find((item) => item.id === id);
    if (!person) return null;
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      photo: person.photo,
      metaLabel: 'Joined',
      metaValue: person.joinedOn,
    };
  }

  const person = employees.find((item) => item.id === id);
  if (!person) return null;

  if (type === 'birthday') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      photo: person.photo,
      metaLabel: 'Birthday',
      metaValue: person.birthday,
    };
  }

  return {
    id: person.id,
    name: person.name,
    role: person.role,
    department: person.department,
    photo: person.photo,
    metaLabel: 'Anniversary',
    metaValue: `${person.anniversary} · ${person.anniversaryYears} year${person.anniversaryYears === 1 ? '' : 's'}`,
  };
}
