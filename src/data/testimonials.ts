export interface Testimonial {
  quote: string;
  name: string;
  headline: string;
  perspective: 'Client' | 'Manager' | 'Teammate' | 'Mentor' | 'Peer';
  theme: string;
  relationship: string;
  date: string;
  profileUrl: string;
  initials: string;
  featured?: boolean;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: 'I have been connected with Rishabh through KaryaMitr for hirings. He is a robust professional & easily understand the requirements which smoothens the process flow.',
    name: 'Bhagyashri Shinde',
    headline: 'Deputy Manager HR @ Jio | Masters in HR Development & Management',
    perspective: 'Client',
    theme: 'Requirements & client trust',
    relationship: "Bhagyashri was Rishabh's client",
    date: 'September 16, 2023',
    profileUrl: 'https://www.linkedin.com/in/bhagyashri-shinde-5350a6114/',
    initials: 'BS',
    featured: true,
  },
  {
    quote: 'Rishabh was a founding team member at KaryaMitr and contributed to client acquisition, subscription sales, team building & collections. He worked hard to developing marketing campaigns and on ground activations. During the last 12 months, he also took charge of managing the client operations team. Rishabh is selfless, devoted and loyal with a genuine heart. He is a young talent who I am sure will take on larger and more exciting opportunities as he builds his career.',
    name: 'Sanchayan Paul',
    headline: 'Chief Human Resources Officer - Network18',
    perspective: 'Manager',
    theme: 'Founding ownership & operations',
    relationship: 'Sanchayan managed Rishabh directly',
    date: 'November 26, 2020',
    profileUrl: 'https://www.linkedin.com/in/sanchayanpaul/',
    initials: 'SP',
    featured: true,
  },
  {
    quote: 'Its been a short while that i have been associated with Rishabh through Karya Mitr, but certainly must say that the association has been fruitful and also professional. Rishabh is very proficient in his dealings and also in understanding business needs of his clients. At such a young age he easily can connect with anyone and deliver results that are expected. Keep up the good work Rishabh. All the Best!!!',
    name: 'Sheetal A. Iswalkar',
    headline: 'Senior HR professional',
    perspective: 'Client',
    theme: 'Business understanding & delivery',
    relationship: "Sheetal was Rishabh's client",
    date: 'August 26, 2019',
    profileUrl: 'https://www.linkedin.com/in/sheetal-a-iswalkar-a3365024/',
    initials: 'SI',
  },
  {
    quote: 'He is the "best of the best"...smart, problem-solver and dynamic professional with whom its very easy to work with …....I know very few people with this level of drive and zest....',
    name: 'Deepika Singh',
    headline: 'Strategic Talent Acquisition & Operations | Building High-Performing Teams',
    perspective: 'Teammate',
    theme: 'Problem-solving & drive',
    relationship: 'Deepika worked with Rishabh on the same team',
    date: 'August 24, 2019',
    profileUrl: 'https://www.linkedin.com/in/deepika-singh-810686183/',
    initials: 'DS',
    featured: true,
  },
  {
    quote: 'Rishabh is an excellent engineer with strong, programming and debugging skills. His willingness to learn and understand complex technologies sets him apart. He will be an asset to any team.',
    name: 'JP Shrivastav',
    headline: 'Server & Data Center Hardware Professional',
    perspective: 'Mentor',
    theme: 'Engineering depth & learning',
    relationship: "JP was Rishabh's mentor",
    date: 'June 5, 2019',
    profileUrl: 'https://www.linkedin.com/in/jaiprakashshrivastav/',
    initials: 'JP',
    featured: true,
  },
  {
    quote: 'Rishabh is good team player . he is very punctual & flexible about his work.',
    name: 'Amit Patil',
    headline: 'Manager - Talent Acquisition COE (Leadership hiring, Employer branding, HRIS, Campus)',
    perspective: 'Teammate',
    theme: 'Teamwork & reliability',
    relationship: 'Amit worked with Rishabh on different teams',
    date: 'April 19, 2019',
    profileUrl: 'https://www.linkedin.com/in/amit-patil-37178553/',
    initials: 'AP',
  },
  {
    quote: 'Rishabh have a good knowledge of java as well as python',
    name: 'Deepesh Pandey',
    headline: 'Senior Software Engineer | Ex-Paytm Ecommerce | Backend, APIs, AWS, ONDC, Fintech & SaaS',
    perspective: 'Peer',
    theme: 'Java & Python foundations',
    relationship: 'Deepesh and Rishabh studied together',
    date: 'August 19, 2018',
    profileUrl: 'https://www.linkedin.com/in/deepesh-pandey-0927586a/',
    initials: 'DP',
  },
  {
    quote: 'Good knowledge about core java, relational database, python, machine learning',
    name: 'Ankush Tiwari',
    headline: 'Engineering @ Booking.com | ex-Morgan Stanley, Mastercard',
    perspective: 'Peer',
    theme: 'ML & data foundations',
    relationship: 'Ankush and Rishabh studied together',
    date: 'August 19, 2018',
    profileUrl: 'https://www.linkedin.com/in/ankush-tiwari-446356166/',
    initials: 'AT',
  },
] as const;
