export const heroSectionData = {
  tagline: "Ayah Foundation",
  titleLine1: "Life begins",
  titleLine2: "where inequality ends",
  description: "We work alongside communities to expand access to education, healthcare, and sustainable opportunities that create lasting impact.",
  donateButton: "Donate Now",
  watchStoryButton: "Watch Our Story",
  wallImages: [
    "wallimg1", "wallimg2", "wallimg5", "wallimg6", "wallimg7", "wallimg8", "wallimg9"
  ]
};

export const statsData = [
  { id: 1, number: "5,000+", label: "Lives Touched", icon: "Users", enabled: true },
  { id: 2, number: "150+", label: "Families Supported", icon: "Heart", enabled: true },
  { id: 3, number: "20+", label: "Community Projects", icon: "Handshake", enabled: true },
  { id: 4, number: "50+", label: "Volunteers Active", icon: "Globe", enabled: true }
];

export const aboutSectionData = {
  title: "About Ayah Foundation",
  description: "Founded in the heart of Cameroon, Ayah Foundation is a beacon of hope dedicated to transforming lives through sustainable development, education, and community empowerment.",
  story: {
    text: "What began as a small grassroots initiative in 2018 has blossomed into a comprehensive organization serving thousands across Cameroon...",
    image: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808",
    stats: [
      { label: "Years of Impact", value: "8+" },
      { label: "Partner Organizations", value: "150+" },
      { label: "Awards Received", value: "25+" }
    ]
  }
};

export const programsData = [
  {
    id: 1,
    title: "Education Programs",
    description: "Providing scholarships, school supplies, and learning centers for children in remote areas.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    stats: "2,000+ students supported",
    enabled: true,
    order: 1
  },
  // Add more programs...
];

export const newsData = {
  featured: [
    {
      id: 1,
      title: "Mobile Health Outreach Reaches 5 New Communities",
      date: "Jan 2026",
      image: "https://www.afro.who.int/sites/default/files/2022-09/health-team.jpg",
      enabled: true
    }
  ],
  regular: [
    {
      id: 1,
      title: "Clean Water Project Phase II Begins",
      date: "Dec 2025",
      image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
      enabled: true
    }
  ]
};

export const campaignsData = {
  video: {
    title: "Watch How We're Changing Lives",
    description: "Take a journey through our communities and witness the transformative power of collective action.",
    thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    enabled: true
  },
  featured: [
    {
      id: 1,
      title: "They are Waiting For Warm Help.",
      raised: 25270,
      goal: 30000,
      category: "Education",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
      enabled: true
    }
  ]
};

export const teamData = [
  {
    id: 1,
    name: "Dr. Emmanuel Ayah",
    role: "Founder & Executive Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    social: { facebook: "#", twitter: "#", linkedin: "#" },
    enabled: true
  }
];

export const donationsData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    amount: 100,
    currency: "USD",
    campaign: "Education Programs",
    date: "2024-01-15",
    status: "completed"
  }
];