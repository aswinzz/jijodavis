/* =====================================================================
   SITE CONFIG — edit this file to change what the website says.
   You should never need to touch the HTML/CSS/JS to update content.

   Text tips
   ---------
   • Two-tone headings: wrap the words that should be BRIGHT in *stars*.
     Everything else is shown in the quieter steel-grey.
       "Built *in the gym*, proven *on real people*."
   • Leave a list empty ([]) to hide that section automatically.
   • Lines marked  TODO  are placeholders — replace with real details.

   Images
   ------
   • Photos live in /personal, /transformations and /certifications.
   • After adding photos, run:  npm run images
     (renames them to numbers and updates the gallery automatically).
   ===================================================================== */

window.SITE_CONFIG = {
  /* ---------- Basics ---------- */
  site: {
    name: "Jijo Davis",
    domain: "jijodavis.com",
    role: "Personal Trainer & Physique Coach",
  },

  /* ---------- How people reach Jijo ---------- */
  contact: {
    whatsapp: "971500000000",              // TODO digits only, with country code, no + or spaces
    phone: "+971 50 000 0000",             // TODO
    email: "hello@jijodavis.com",          // TODO
    instagram: "jijodavis",                // TODO handle without @
    location: "Ajman · Sharjah · Dubai",   // TODO areas served in person
    whatsappGreeting: "Hi Jijo, I found you on jijodavis.com.",
  },

  /* ---------- Section order. Remove a name to hide that section. ---------- */
  sections: ["hero", "manifesto", "about", "services", "transformations", "process", "certifications", "faq", "contact"],

  /* ---------- Top navigation ---------- */
  nav: [
    { label: "Results", target: "transformations" },
    { label: "Coaching", target: "services" },
    { label: "How it works", target: "process" },
    { label: "Credentials", target: "certifications" },
    { label: "FAQ", target: "faq" },
  ],

  /* ---------- Hero (first screen) ---------- */
  hero: {
    photo: "personal/3.jpg",
    firstName: "Jijo",
    lastName: "Davis",
    headline: "Coaching *stronger bodies* for people *who mean it.*",
    intro: "Certified personal trainer helping people lose fat, build muscle and step on stage — in person across the UAE and online anywhere.",
    primaryCta: "Book a free consultation",
    secondaryCta: "See client results",
    badges: ["REPs UAE registered", "EREPS Level 4", "FSSA certified"],
  },

  /* ---------- Scrolling strip under the hero ---------- */
  marquee: ["Fat loss", "Muscle gain", "Contest prep", "Strength", "Recomposition", "Online coaching", "Posing"],

  /* ---------- Big scroll-lit statement ---------- */
  manifesto:
    "No crash diets. No copy-paste programs. Just a plan built around your body, your schedule and the food you actually eat — and a coach who checks in every week until the mirror agrees.",

  /* ---------- About ---------- */
  about: {
    photo: "personal/1.jpg",
    heading: "The work *behind the work.*",
    paragraphs: [
      "I'm Jijo — a certified personal trainer and physique coach. I've spent years under the bar myself, and I coach the way I train: with structure, patience and honest feedback.",
      "Whether it's your first month in a gym or your first bodybuilding show, I build the training, the nutrition and the habits around your life — then we adjust every week based on what your body actually does.",
    ],
    quote: "Same body weight. Better physique. That's what a real plan does.",
    facts: [
      { value: "36+", label: "client transformations" },   // TODO update as you grow
      { value: "8", label: "certifications" },
      { value: "1:1", label: "every client, every week" },
    ],
  },

  /* ---------- Coaching services ---------- */
  services: {
    heading: "Ways *to train with me.*",
    items: [
      {
        title: "1:1 personal training",
        format: "In person",
        text: "Private sessions focused on technique, progressive overload and getting the most out of every set. Ideal if you want hands-on coaching.",
      },
      {
        title: "Online coaching",
        format: "Anywhere",
        text: "A custom training and nutrition plan in your phone, weekly check-ins, form reviews on video and direct WhatsApp access.",
      },
      {
        title: "Physique & contest prep",
        format: "In person or online",
        text: "Cutting phases, peak week, posing practice and stage-day planning for bodybuilding and physique competitors.",
      },
      {
        title: "Nutrition guidance",
        format: "Add-on or standalone",
        text: "Calorie and macro targets built around foods you already enjoy, so fat loss or muscle gain fits your real life.",
      },
    ],
  },

  /* ---------- Client transformations (images load automatically) ---------- */
  transformations: {
    heading: "Real clients. *Real results.*",
    intro: "Every photo here is a client who put in the work. Tap any photo to see it full size.",
    initialCount: 12,           // how many to show before "Show more"
    loadStep: 12,               // how many more each click reveals
    newestFirst: true,          // highest-numbered photo shows first
    captions: {
      // Optional caption per photo number, e.g.
      // 16: "4 weeks of cutting — same weight, better physique",
    },
  },

  /* ---------- How it works (a real sequence, so it's numbered) ---------- */
  process: {
    heading: "How *it works.*",
    steps: [
      { title: "Free consultation", text: "A 20-minute call about your goal, your schedule, your history and anything that's held you back before." },
      { title: "Assessment", text: "Photos, measurements, movement screen and current eating habits — so we start from facts, not guesses." },
      { title: "Your plan", text: "Training and nutrition written for you, with clear targets for the next four weeks." },
      { title: "Weekly check-ins", text: "We review progress every week and adjust. You always know what to do next and why." },
    ],
  },

  /* ---------- Certifications ---------- */
  certifications: {
    heading: "Qualified *and registered.*",
    intro: "Internationally recognised qualifications. Tap a certificate to view it.",
    // `image` is the photo number inside /certifications.
    // Photos without an entry here still appear, with a generic title.
    items: [
      { image: 1, title: "Certified Personal Trainer", issuer: "FSSA Council · EuropeActive standards", year: "2025" },
      { image: 2, title: "Personal Trainer — EQF Level 4", issuer: "European Register of Exercise Professionals", year: "2025" },
      { image: 3, title: "Registered Personal Trainer (Category A)", issuer: "REPs UAE", year: "2026" },
      { image: 4, title: "Physique Transformation Specialist", issuer: "FSSA · CPD programme", year: "2026" },
      { image: 5, title: "Functional Strength Training", issuer: "FSSA · CPD programme", year: "2025" },
      { image: 6, title: "General Fitness Trainer", issuer: "Skill India · NCVET", year: "2025" },
      { image: 7, title: "Basic First Aid, CPR & AED", issuer: "SAHSS · AHA 2020 guidelines", year: "2025" },
      { image: 8, title: "REPs UAE membership card", issuer: "Register of Exercise Professionals UAE", year: "2026" },
    ],
  },

  /* ---------- FAQ ---------- */
  faq: {
    heading: "Questions, *answered.*",
    items: [
      { q: "Do you train in person or online?", a: "Both. In-person sessions are available in the areas listed below, and online coaching works anywhere in the world." },
      { q: "I'm a complete beginner. Is that okay?", a: "Absolutely. Most clients start with little or no gym experience. We start where you are and build from there." },
      { q: "How soon will I see results?", a: "Most people notice changes in strength and energy within 2–3 weeks and visible changes in 6–8 weeks, if they follow the plan consistently." },
      { q: "Do I have to give up foods I like?", a: "No. Your nutrition plan is built around food you already enjoy. Consistency beats perfection." },
      { q: "What does the free consultation include?", a: "A short call to understand your goal and situation. You'll leave with honest advice — whether or not we end up working together." },
    ],
  },

  /* ---------- Contact / enquiry ---------- */
  contactSection: {
    photo: "personal/2.jpg",   // shown blurred behind the form
    heading: "Start with *a conversation.*",
    text: "Tell me a little about your goal. The form opens WhatsApp with your message ready to send — I usually reply the same day.",
    goals: ["Lose fat", "Build muscle", "Contest prep", "Get stronger", "Something else"],
    formats: ["In person", "Online"],
    submitLabel: "Send on WhatsApp",
  },

  footer: {
    note: "Train with intent.",
  },
};
