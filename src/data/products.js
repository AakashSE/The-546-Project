export const products = [
  {
    id: 1,
    name: "Crew Tee",
    category: "T-Shirts",
    price: "₹9,999",
    slogan: "The Foundation Layer",
    description: "Breathable organic cotton mesh designed for thermal regulation in fluctuating atmospheric conditions. The absolute baseline for any planetary wardrobe.",

    // --- TECH SPECS ---
    weight: 0.18, // 0.18 KG
    specs: {
      fabric: "Bio-Mesh Cotton",
      gsm: "160 GSM",
      composition: "100% Organic Pima",
      origin: "Hydro-Lab Alpha",
      fit: "Base Layer / Fitted"
    },

    defaultImage: "/assets/Crew Tee/Mud/Front.png",
    options: [
      {
        colorName: "Mud",
        hex: "#8B3E2F",
        images: {
          front: "/assets/Crew Tee/Mud/Front.png",
          back: "/assets/Crew Tee/Mud/Back.png",
          side: "/assets/Crew Tee/Mud/Side Profile.png",
          flat: "/assets/Crew Tee/Mud/Flat Lay.png",
          detail: "/assets/Crew Tee/Mud/Detail.png",
        },
      },
      {
        colorName: "White",
        hex: "#FFFFFF",
        images: {
          front: "/assets/Crew Tee/White/Front.png",
          back: "/assets/Crew Tee/White/Back.png",
          side: "/assets/Crew Tee/White/Side Profile.png",
          flat: "/assets/Crew Tee/White/Flat Lay.png",
          detail: "/assets/Crew Tee/White/Detail.png",
        },
      },
    ],
  },
  {
    id: 2,
    name: "Polo Tee",
    category: "Polos",
    price: "₹14,999",
    slogan: "Command Authority",
    description: "A sharp collar profile engineered to maintain form in zero-G environments. The definitive standard for off-world diplomacy and station leadership.",

    // --- TECH SPECS ---
    weight: 0.25, // 0.25 KG
    specs: {
      fabric: "Aerogel Pique",
      gsm: "220 GSM",
      composition: "Cotton / Polymer Blend",
      origin: "Orbital Loom",
      fit: "Standard Command"
    },

    defaultImage: "/assets/Polo Tee/Blue/Front.png",
    options: [
      {
        colorName: "Blue",
        hex: "#0000FF",
        images: {
          front: "/assets/Polo Tee/Blue/Front.png",
          back: "/assets/Polo Tee/Blue/Back.png",
          side: "/assets/Polo Tee/Blue/Side Profile.png",
          flat: "/assets/Polo Tee/Blue/Flat Lay.png",
          detail: "/assets/Polo Tee/Blue/Detail.png",
        },
      },
      {
        colorName: "Black",
        hex: "#000000",
        images: {
          front: "/assets/Polo Tee/Black/Front.png",
          back: "/assets/Polo Tee/Black/Back.png",
          side: "/assets/Polo Tee/Black/Side Profile.png",
          flat: "/assets/Polo Tee/Black/Flat Lay.png",
          detail: "/assets/Polo Tee/Black/Detail.png",
        },
      },
      {
        colorName: "Sky Blue",
        hex: "#87CEEB",
        images: {
          front: "/assets/Polo Tee/Sky Blue/Front.png",
          back: "/assets/Polo Tee/Sky Blue/Back.png",
          side: "/assets/Polo Tee/Sky Blue/Side Profile.png",
          flat: "/assets/Polo Tee/Sky Blue/Flat Lay.png",
          detail: "/assets/Polo Tee/Sky Blue/Detail.png",
        },
      },
      {
        colorName: "White",
        hex: "#FFFFFF",
        images: {
          front: "/assets/Polo Tee/White/Front.png",
          back: "/assets/Polo Tee/White/Back.png",
          side: "/assets/Polo Tee/White/Side Profile.png",
          flat: "/assets/Polo Tee/White/Flat Lay.png",
          detail: "/assets/Polo Tee/White/Detail.png",
        },
      },
      {
        colorName: "Yellow",
        hex: "#FFD700",
        images: {
          front: "/assets/Polo Tee/Yellow/Front.png",
          back: "/assets/Polo Tee/Yellow/Back.png",
          side: "/assets/Polo Tee/Yellow/Side Profile.png",
          flat: "/assets/Polo Tee/Yellow/Flat Lay.png",
          detail: "/assets/Polo Tee/Yellow/Detail.png",
        },
      },
    ],
  },
  {
    id: 3,
    name: "Formal Pant",
    category: "Trousers",
    price: "₹19,999",
    slogan: "Architectural Silhouette",
    description: "Precision-cut trousers that offer unrestricted movement. Reinforced weave for durability against Martian dust abrasion while maintaining elegance.",

    // --- TECH SPECS ---
    weight: 0.65, // 0.65 KG
    specs: {
      fabric: "Carbon-Weave Wool",
      gsm: "240 GSM",
      composition: "90% Merino / 10% Graphene",
      origin: "Sector 7 Foundry",
      fit: "Tapered / Zero-G"
    },

    defaultImage: "/assets/Formal Pant/Charcoal Gray/Front.png",
    options: [
      {
        colorName: "Charcoal",
        hex: "#36454F",
        images: {
          front: "/assets/Formal Pant/Charcoal Gray/Front.png",
          back: "/assets/Formal Pant/Charcoal Gray/Back.png",
          side: "/assets/Formal Pant/Charcoal Gray/Side Profile.png",
          flat: "/assets/Formal Pant/Charcoal Gray/Flat Lay.png",
          detail: "/assets/Formal Pant/Charcoal Gray/Detail.png",
        },
      },
      {
        colorName: "Black",
        hex: "#000000",
        images: {
          front: "/assets/Formal Pant/Black Pant/Front.png",
          back: "/assets/Formal Pant/Black Pant/Back.png",
          side: "/assets/Formal Pant/Black Pant/Side Profile.png",
          flat: "/assets/Formal Pant/Black Pant/Flat Lay.png",
          detail: "/assets/Formal Pant/Black Pant/Detail.png",
        },
      },
      {
        colorName: "White",
        hex: "#FFFFFF",
        images: {
          front: "/assets/Formal Pant/White Pant/Front.png",
          back: "/assets/Formal Pant/White Pant/Back.png",
          side: "/assets/Formal Pant/White Pant/Side Profile.png",
          flat: "/assets/Formal Pant/White Pant/Flat Lay.png",
          detail: "/assets/Formal Pant/White Pant/Detail.png",
        },
      },
    ],
  },
  {
    id: 4,
    name: "Oxford Shirt",
    category: "Shirts",
    price: "₹18,500",
    slogan: "Colony Formal",
    description: "Wrinkle-resistant fiber technology ensures a pristine look from the command center to the research bay. The standard for orbital elegance.",

    // --- TECH SPECS ---
    weight: 0.35, // 0.35 KG
    specs: {
      fabric: "Liquid Cotton",
      gsm: "180 GSM",
      composition: "Oxygenated Fiber Blend",
      origin: "Jezero Hydro-Labs",
      fit: "Tailored / Breathable"
    },

    defaultImage: "/assets/Shirt/Green/Front.png",
    options: [
      {
        colorName: "Green",
        hex: "#008000",
        images: {
          front: "/assets/Shirt/Green/Front.png",
          back: "/assets/Shirt/Green/Back.png",
          side: "/assets/Shirt/Green/Side Profile.png",
          flat: "/assets/Shirt/Green/Flat Lay.png",
          detail: "/assets/Shirt/Green/Detail.png",
        },
      },
      {
        colorName: "Black",
        hex: "#000000",
        images: {
          front: "/assets/Shirt/Black/Front.png",
          back: "/assets/Shirt/Black/Back.png",
          side: "/assets/Shirt/Black/Side Profile.png",
          flat: "/assets/Shirt/Black/Flat Lay.png",
          detail: "/assets/Shirt/Black/Detail.png",
        },
      },
      {
        colorName: "Blue",
        hex: "#0000FF",
        images: {
          front: "/assets/Shirt/Blue/Front.png",
          back: "/assets/Shirt/Blue/Back.png",
          side: "/assets/Shirt/Blue/Side Profile.png",
          flat: "/assets/Shirt/Blue/Flat Lay.png",
          detail: "/assets/Shirt/Blue/Detail.png",
        },
      },
      {
        colorName: "Red",
        hex: "#FF0000",
        images: {
          front: "/assets/Shirt/Red/Front.png",
          back: "/assets/Shirt/Red/Back.png",
          side: "/assets/Shirt/Red/Side Profile.png",
          flat: "/assets/Shirt/Red/Flat Lay.png",
          detail: "/assets/Shirt/Red/Detail.png",
        },
      },
    ],
  },
  {
    id: 5,
    name: "Track Pant",
    category: "Activewear",
    price: "₹12,500",
    slogan: "Kinetic Readiness",
    description: "Hydrophobic fabric blend designed for high-intensity rover expeditions and daily colony maintenance. Reactive fabric for the active explorer.",

    // --- TECH SPECS ---
    weight: 0.55, // 0.55 KG
    specs: {
      fabric: "Reactive Flex",
      gsm: "260 GSM",
      composition: "Spandex / Ballistic Nylon",
      origin: "Tharsis Plateau",
      fit: "Athletic / Utility"
    },

    defaultImage: "/assets/Track Pant/Navy Blue/Front.png",
    options: [
      {
        colorName: "Navy",
        hex: "#000080",
        images: {
          front: "/assets/Track Pant/Navy Blue/Front.png",
          back: "/assets/Track Pant/Navy Blue/Back.png",
          side: "/assets/Track Pant/Navy Blue/Side Profile.png",
          flat: "/assets/Track Pant/Navy Blue/Flat Lay.png",
          detail: "/assets/Track Pant/Navy Blue/Detail.png",
        },
      },
      {
        colorName: "Black",
        hex: "#000000",
        images: {
          front: "/assets/Track Pant/Black/Front.png",
          back: "/assets/Track Pant/Black/Back.png",
          side: "/assets/Track Pant/Black/Side Profile.png",
          flat: "/assets/Track Pant/Black/Flat Lay.png",
          detail: "/assets/Track Pant/Black/Detail.png",
        },
      },
    ],
  },
  {
    id: 6,
    name: "Summer Shorts",
    category: "Shorts",
    price: "₹8,999",
    slogan: "Habitat Leisure",
    description: "Maximum ventilation for climate-controlled habitats. The essential leisure wear for the pressurized domes, combining comfort with utility.",

    // --- TECH SPECS ---
    weight: 0.28, // 0.28 KG
    specs: {
      fabric: "Ventilated Linen",
      gsm: "140 GSM",
      composition: "Natural Flax / Rayon",
      origin: "Bio-Dome Beta",
      fit: "Relaxed / Air-Flow"
    },

    defaultImage: "/assets/Shorts/Brown/Front.png",
    options: [
      {
        colorName: "Brown",
        hex: "#8B4513",
        images: {
          front: "/assets/Shorts/Brown/Front.png",
          back: "/assets/Shorts/Brown/Back.png",
          side: "/assets/Shorts/Brown/Side Profile.png",
          flat: "/assets/Shorts/Brown/Flat Lay.png",
          detail: "/assets/Shorts/Brown/Detail.png",
        },
      },
      {
        colorName: "Navy",
        hex: "#000080",
        images: {
          front: "/assets/Shorts/Navy Blue/Front.png",
          back: "/assets/Shorts/Navy Blue/Back.png",
          side: "/assets/Shorts/Navy Blue/Side Profile.png",
          flat: "/assets/Shorts/Navy Blue/Flat Lay.png",
          detail: "/assets/Shorts/Navy Blue/Detail.png",
        },
      },
    ],
  },
];