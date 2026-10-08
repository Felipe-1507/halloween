// Edit this file for prices, real Hotmart URLs, domain, policies, and tracking.
// Empty prices/checkout links keep purchases disabled. Do not add private keys.
window.HALLOWEEN_CONFIG = {
  brand: "Halloween Monster Mask Kit",
  siteUrl: "",
  supportEmail: "",
  businessName: "",
  headline: "100+ Printable\nHalloween\nMonster Masks\nKids Will Love!",
  subheadline:
    "Print, cut, and create unforgettable Halloween fun with adorable monster masks, playful accessories, and ready-to-use party activities.",
  maskCount: 110,
  currency: "USD",
  locale: "en-US",
  core: {
    available: true,
    approved: true,
    deliveryVerified: false,
    printFormat: "A4",
    files: ["Halloween_110_Monster_Masks_English_A4.pdf"],
  },
  offers: {
    basic: {
      name: "Basic Pack",
      enabled: false,
      price: null,
      originalPrice: null,
      checkoutUrl: "",
      contentsApproved: false,
    },
    complete: {
      name: "Complete Halloween Pack",
      enabled: true,
      price: null,
      originalPrice: null,
      checkoutUrl: "",
      contentsApproved: false,
    },
  },
  bonuses: [
    {
      id: "headbands",
      title: "10 Printable Halloween Headbands",
      shortTitle: "Crown their little monsters.",
      description:
        "Witch hats, pumpkin crowns, friendly ghosts, and more. A playful finishing touch for dress-up day.",
      available: true,
      approved: true,
      status: "verified",
      preview: "headbands",
      file: "Halloween_10_Headbands_A4.pdf",
    },
    {
      id: "coloring",
      title: "30 Monster Coloring Masks",
      shortTitle: "A splash of their imagination.",
      description:
        "Black-and-white masks for little artists to make their own.",
      available: false,
      approved: false,
      status: "planned",
      preview: null,
      file: null,
    },
    {
      id: "photo-props",
      title: "30 Halloween Photo Booth Props",
      shortTitle: "Say boo. Make memories.",
      description:
        "Cheeky English signs and colorful characters that turn a corner of your home into a Halloween photo booth.",
      available: true,
      approved: true,
      status: "verified",
      preview: "photo-props",
      file: "Halloween_30_Photo_Props_English_A4.pdf",
    },
    {
      id: "guides",
      title: "3 Illustrated Craft Guides",
      shortTitle: "Less guesswork. More giggles.",
      description:
        "Easy visual steps for masks, headbands, and photo props, with helpful reminders for grown-ups.",
      available: true,
      approved: true,
      status: "verified",
      preview: "guides",
      file: "guides",
    },
  ],
  license: {
    approved: false,
    repeatPrinting: "",
    classroomUse: "",
  },
  policies: {
    approved: false,
    privacy: [],
    terms: [],
    refund: [],
  },
  tracking: {
    metaPixelId: "",
    ga4Id: "",
    requireConsent: true,
  },
  customDomain: "",
  motion: {
    enabled: true,
    carouselAutoplay: true,
    carouselSpeed: 28,
  },
};
