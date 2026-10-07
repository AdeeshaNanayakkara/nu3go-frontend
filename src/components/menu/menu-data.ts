export interface MealDetail {
  name: string;
  description: string;
  image: string;
  macros: {
    protein: string;
    carbs: string;
    calories: string;
  };
}

export type PackageTierKey = "POWER" | "CLASSIC" | "ISKOOL" | "FOURTIG";

export interface DailyMenuItem {
  dayKey: "MON" | "TUE" | "WED" | "THU" | "FRI";
  dayTitle: string;
  daySubtitle: string;
  tag: string;
  meal?: MealDetail;
  powerMeal: MealDetail;
  classicMeal: MealDetail;
  iskoolMeal: MealDetail;
  fourtigMeal: MealDetail;
}

export interface WeeklyMenuData {
  id: number;
  menuNumber: string;
  title: string;
  schedule: string;
  description: string;
  days: DailyMenuItem[];
}

export interface PackageConfig {
  key: PackageTierKey;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  gradient: string;
  accentColor: string;
  shadowColor: string;
  badgeClass: string;
  activeTabClass: string;
  activeBorderClass: string;
  iconType: "flame" | "leaf" | "sparkles" | "zap";
  dishImage: string;
  targetProtein: string;
  targetCalories: string;
  subscribePlanParam: string;
}

export const PACKAGE_CONFIGS: Record<PackageTierKey, PackageConfig> = {
  POWER: {
    key: "POWER",
    label: "POWER",
    badge: "HIGH PROTEIN MEALS",
    tagline: "HIGH PROTEIN MACROS",
    description: "Max protein & clean macros to fuel intense performance and active fitness lifestyles.",
    gradient: "from-[#FF0844] via-[#FF456E] to-[#FFAAA6]",
    accentColor: "#FF0844",
    shadowColor: "shadow-rose-500/25",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    activeTabClass: "bg-gradient-to-r from-[#FF0844] via-[#FF456E] to-[#FFAAA6] text-white shadow-lg shadow-rose-500/30",
    activeBorderClass: "border-rose-500",
    iconType: "flame",
    dishImage: "/images/power1.png",
    targetProtein: "40g+ Protein",
    targetCalories: "450-520 kcal",
    subscribePlanParam: "power",
  },
  CLASSIC: {
    key: "CLASSIC",
    label: "CLASSIC",
    badge: "WHOLESOME BALANCED",
    tagline: "CLEAN FARM NUTRITION",
    description: "Fresh farm vegetables, wholesome grains, and chef-crafted daily balanced wellness.",
    gradient: "from-[#70E0A5] via-[#10B981] to-[#00F59B]",
    accentColor: "#10B981",
    shadowColor: "shadow-emerald-500/25",
    badgeClass: "bg-emerald-50 text-[#15803D] border-emerald-200",
    activeTabClass: "bg-gradient-to-r from-[#70E0A5] via-[#10B981] to-[#00F59B] text-slate-950 shadow-lg shadow-emerald-500/30",
    activeBorderClass: "border-emerald-500",
    iconType: "leaf",
    dishImage: "/images/classic1.png",
    targetProtein: "20g–26g Protein",
    targetCalories: "350-410 kcal",
    subscribePlanParam: "classic",
  },
  ISKOOL: {
    key: "ISKOOL",
    label: "ISKOOL",
    badge: "KIDS SCHOOL BREAKFAST",
    tagline: "GROWING KIDS FUEL",
    description: "Chicken, egg & meat-led protein to power growing kids with all-day focus and nutrition.",
    gradient: "from-[#1E3AFB] via-[#4A69FF] to-[#9DB5FF]",
    accentColor: "#1E3AFB",
    shadowColor: "shadow-blue-500/25",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    activeTabClass: "bg-gradient-to-r from-[#1E3AFB] via-[#4A69FF] to-[#9DB5FF] text-white shadow-lg shadow-blue-500/30",
    activeBorderClass: "border-blue-500",
    iconType: "sparkles",
    dishImage: "/images/hero-dish2.png",
    targetProtein: "25g–32g Protein",
    targetCalories: "380-440 kcal",
    subscribePlanParam: "iskool",
  },
  FOURTIG: {
    key: "FOURTIG",
    label: "fourtiG",
    badge: "40G PROTEIN BREAKFAST",
    tagline: "BUILT FOR HUSTLERS",
    description: "Built for hustlers. 40g+ protein, 15 rotational chef meals delivered fresh every morning.",
    gradient: "from-[#FFC285] via-[#FF7A00] to-[#FF5100]",
    accentColor: "#FF7A00",
    shadowColor: "shadow-orange-500/25",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    activeTabClass: "bg-gradient-to-r from-[#FFC285] via-[#FF7A00] to-[#FF5100] text-slate-950 shadow-lg shadow-orange-500/30",
    activeBorderClass: "border-orange-500",
    iconType: "zap",
    dishImage: "/images/hero-dish3.png",
    targetProtein: "40g–48g Protein",
    targetCalories: "490-540 kcal",
    subscribePlanParam: "fourtig",
  },
};

export const WEEKLY_MENUS: WeeklyMenuData[] = [
  {
    id: 1,
    menuNumber: "MENU 1",
    title: "Chef's Signature Rotation 1",
    schedule: "MONDAY - FRIDAY",
    description: "High-protein lean meats, energizing whole grains, and antioxidant-rich fruit oats.",
    days: [
      {
        dayKey: "MON",
        dayTitle: "MONday",
        daySubtitle: "Monday",
        tag: "high protein",
        powerMeal: {
          name: "Chicken Pasta",
          description: "Grilled tender chicken breast with al dente pasta, fresh basil & herb glaze",
          image: "/images/menu/chicken-pasta.jpg",
          macros: { protein: "42g", carbs: "48g", calories: "480 kcal" },
        },
        classicMeal: {
          name: "Egg Pasta",
          description: "Whole egg pasta bowl tossed with spinach, cherry tomatoes & olive oil",
          image: "/images/menu-pasta.png",
          macros: { protein: "24g", carbs: "52g", calories: "410 kcal" },
        },
        iskoolMeal: {
          name: "Kid-Approved Chicken Pasta",
          description: "Tender shredded chicken & mild cheesy whole wheat pasta with sweet corn",
          image: "/images/menu/chicken-pasta.jpg",
          macros: { protein: "28g", carbs: "46g", calories: "420 kcal" },
        },
        fourtigMeal: {
          name: "45g Penne Power Chicken Bowl",
          description: "Double grilled chicken breast tossed with whole wheat penne & extra parmesan",
          image: "/images/power1.png",
          macros: { protein: "45g", carbs: "44g", calories: "510 kcal" },
        },
      },
      {
        dayKey: "TUE",
        dayTitle: "TUEsday",
        daySubtitle: "Tuesday",
        tag: "high protein",
        powerMeal: {
          name: "Fruit and Nuts Oats",
          description: "Rolled organic oats topped with almonds, walnuts, chia seeds & berries",
          image: "/images/menu/oats-nuts.jpg",
          macros: { protein: "28g", carbs: "55g", calories: "430 kcal" },
        },
        classicMeal: {
          name: "Banana Oats",
          description: "Warm creamy oats bowl with ripe sliced banana and pure honey drizzle",
          image: "/images/hero-salad.png",
          macros: { protein: "16g", carbs: "58g", calories: "360 kcal" },
        },
        iskoolMeal: {
          name: "Honey Nutty Banana Oats Pot",
          description: "Creamy oatmeal cup with sliced banana, crunchy almonds and raw bee honey",
          image: "/images/menu/oats-nuts.jpg",
          macros: { protein: "22g", carbs: "52g", calories: "390 kcal" },
        },
        fourtigMeal: {
          name: "42g Super Protein Nut Oats",
          description: "Macro-fortified oats loaded with chia, walnuts, peanut butter & dried cranberries",
          image: "/images/hero-dish3.png",
          macros: { protein: "42g", carbs: "54g", calories: "500 kcal" },
        },
      },
      {
        dayKey: "WED",
        dayTitle: "WEDnesday",
        daySubtitle: "Wednesday",
        tag: "high protein",
        powerMeal: {
          name: "Egg Sandwich",
          description: "Multi-grain artisan sourdough sandwich with double boiled eggs & greens",
          image: "/images/hero-dish2.png",
          macros: { protein: "32g", carbs: "38g", calories: "420 kcal" },
        },
        classicMeal: {
          name: "Veggie Sandwich",
          description: "Fresh garden vegetable sandwich with cucumber, vine tomatoes & avocado",
          image: "/images/hero-dish.png",
          macros: { protein: "14g", carbs: "42g", calories: "320 kcal" },
        },
        iskoolMeal: {
          name: "Cheesy Egg & Chicken Sourdough Toastie",
          description: "Golden toasted sandwich with mild melted cheese, boiled eggs and shredded chicken",
          image: "/images/hero-dish2.png",
          macros: { protein: "26g", carbs: "36g", calories: "410 kcal" },
        },
        fourtigMeal: {
          name: "44g Quad-Egg & Chicken Beast Club",
          description: "Triple-layer sourdough protein stack with 4 farm eggs & grilled chicken breast",
          image: "/images/power1.png",
          macros: { protein: "44g", carbs: "34g", calories: "490 kcal" },
        },
      },
      {
        dayKey: "THU",
        dayTitle: "THUrsday",
        daySubtitle: "Thursday",
        tag: "high protein",
        powerMeal: {
          name: "Chapathi Chicken Wrap",
          description: "Warm whole wheat chapathi filled with spiced chicken breast & greens",
          image: "/images/power1.png",
          macros: { protein: "38g", carbs: "40g", calories: "450 kcal" },
        },
        classicMeal: {
          name: "Chapathi Egg Wrap",
          description: "Warm chapathi wrap rolled with fluffy omelette, peppers & onions",
          image: "/images/classic1.png",
          macros: { protein: "22g", carbs: "42g", calories: "370 kcal" },
        },
        iskoolMeal: {
          name: "Kid Roll Chicken & Sweet Corn Chapathi",
          description: "Easy-to-hold whole wheat chapathi roll with sweet corn and tender mild chicken",
          image: "/images/classic1.png",
          macros: { protein: "25g", carbs: "38g", calories: "395 kcal" },
        },
        fourtigMeal: {
          name: "43g Heavyweight Double Chicken Wrap",
          description: "Two jumbo whole wheat chapathis packed with marinated chicken & egg whites",
          image: "/images/hero-dish3.png",
          macros: { protein: "43g", carbs: "39g", calories: "520 kcal" },
        },
      },
      {
        dayKey: "FRI",
        dayTitle: "FRIDAY",
        daySubtitle: "Friday",
        tag: "high protein",
        powerMeal: {
          name: "Oats Shake & Chickpeas",
          description: "Thick macro protein oats shake paired with seasoned roasted chickpeas",
          image: "/images/meal-1.png",
          macros: { protein: "35g", carbs: "46g", calories: "460 kcal" },
        },
        classicMeal: {
          name: "Smoothie & Chickpeas",
          description: "Fresh green vitality fruit smoothie with a side of boiled spiced chickpeas",
          image: "/images/meal-2.png",
          macros: { protein: "20g", carbs: "48g", calories: "350 kcal" },
        },
        iskoolMeal: {
          name: "Cocoa Protein Smoothie & Kadala Snack",
          description: "Chocolatey natural oat milk smoothie paired with lightly salted roasted chickpeas",
          image: "/images/hero-dish2.png",
          macros: { protein: "24g", carbs: "45g", calories: "380 kcal" },
        },
        fourtigMeal: {
          name: "46g Macro Pro Shake & Tempered Chickpeas",
          description: "Thick whey & oats protein shake paired with Sri Lankan coconut tempered kadala",
          image: "/images/menu-protein-bowl.jpg",
          macros: { protein: "46g", carbs: "44g", calories: "530 kcal" },
        },
      },
    ],
  },
  {
    id: 2,
    menuNumber: "MENU 2",
    title: "Energizing Protein & Superfoods",
    schedule: "MONDAY - FRIDAY",
    description: "Tropical superfood smoothies, high-protein wraps, and Sri Lankan seasoned chickpeas.",
    days: [
      {
        dayKey: "MON",
        dayTitle: "MONday",
        daySubtitle: "Monday",
        tag: "high protein",
        powerMeal: {
          name: "Banana & Papaya Smoothie + Sweet Potato",
          description: "Tropical vitamin-rich smoothie paired with roasted sweet potato cubes",
          image: "/images/meal-1.png",
          macros: { protein: "30g", carbs: "56g", calories: "440 kcal" },
        },
        classicMeal: {
          name: "Banana Smoothie with Sweet Potato",
          description: "Silky banana smoothie served with steamed nutritious sweet potatoes",
          image: "/images/hero-dish3.png",
          macros: { protein: "18g", carbs: "54g", calories: "360 kcal" },
        },
        iskoolMeal: {
          name: "Banana Mango Shake & Steamed Golden Yams",
          description: "Natural golden fruit smoothie paired with sweet steamed potato bites",
          image: "/images/meal-1.png",
          macros: { protein: "24g", carbs: "50g", calories: "390 kcal" },
        },
        fourtigMeal: {
          name: "44g Hustler Whey Smoothie & Roasted Yams",
          description: "Mega protein tropical smoothie with baked sweet potato cubes & seed crunch",
          image: "/images/hero-dish3.png",
          macros: { protein: "44g", carbs: "52g", calories: "510 kcal" },
        },
      },
      {
        dayKey: "TUE",
        dayTitle: "TUEsday",
        daySubtitle: "Tuesday",
        tag: "high protein",
        powerMeal: {
          name: "Chicken Wrap",
          description: "Toasted flour tortilla packed with grilled shredded chicken & crisp lettuce",
          image: "/images/power1.png",
          macros: { protein: "40g", carbs: "36g", calories: "460 kcal" },
        },
        classicMeal: {
          name: "Egg Wrap",
          description: "Soft tortilla wrap layered with scrambled farm eggs and fresh vegetables",
          image: "/images/classic1.png",
          macros: { protein: "24g", carbs: "38g", calories: "380 kcal" },
        },
        iskoolMeal: {
          name: "Shredded Chicken Fiesta Wrap",
          description: "Mild seasoned shredded chicken wrap with cucumber strips and yogurt dressing",
          image: "/images/classic1.png",
          macros: { protein: "27g", carbs: "35g", calories: "400 kcal" },
        },
        fourtigMeal: {
          name: "45g Ultra Chicken & Avocado Mega Tortilla",
          description: "Flame-grilled double chicken breast wrapped with avocado and chipotle yogurt",
          image: "/images/power1.png",
          macros: { protein: "45g", carbs: "34g", calories: "530 kcal" },
        },
      },
      {
        dayKey: "WED",
        dayTitle: "Wednesday",
        daySubtitle: "Wednesday",
        tag: "high protein",
        powerMeal: {
          name: "Chicken Omelette + Veggies",
          description: "3-egg high protein omelette folded over diced grilled chicken & bell peppers",
          image: "/images/hero-dish2.png",
          macros: { protein: "44g", carbs: "12g", calories: "430 kcal" },
        },
        classicMeal: {
          name: "Omelette + Veggies",
          description: "Fluffy country-style herb omelette loaded with sautéed garden greens",
          image: "/images/hero-dish.png",
          macros: { protein: "22g", carbs: "14g", calories: "310 kcal" },
        },
        iskoolMeal: {
          name: "Cheese & Minced Chicken Omelette Roll",
          description: "Kid-friendly folded omelette roll with minced chicken and cheddar cheese",
          image: "/images/hero-dish2.png",
          macros: { protein: "26g", carbs: "10g", calories: "370 kcal" },
        },
        fourtigMeal: {
          name: "48g Char-Grilled Chicken & 5-Egg Omelette",
          description: "Athlete's supreme omelette with 5 egg whites, diced steak chicken & bell peppers",
          image: "/images/hero-dish3.png",
          macros: { protein: "48g", carbs: "8g", calories: "460 kcal" },
        },
      },
      {
        dayKey: "THU",
        dayTitle: "THUrsday",
        daySubtitle: "Thursday",
        tag: "high protein",
        powerMeal: {
          name: "Chicken Chapathi Wrap",
          description: "Wholesome chapathi flatbread wrapped with marinated chicken & mint relish",
          image: "/images/power1.png",
          macros: { protein: "38g", carbs: "40g", calories: "450 kcal" },
        },
        classicMeal: {
          name: "Chapathi Egg Wrap",
          description: "Whole wheat chapathi wrap with seasoned eggs and crunchy veggies",
          image: "/images/classic1.png",
          macros: { protein: "22g", carbs: "42g", calories: "370 kcal" },
        },
        iskoolMeal: {
          name: "Chapathi Roll with Egg & Mild Chicken Sausage",
          description: "Soft whole wheat chapathi wrapped around wholesome chicken sausage and eggs",
          image: "/images/classic1.png",
          macros: { protein: "25g", carbs: "38g", calories: "390 kcal" },
        },
        fourtigMeal: {
          name: "44g Double Protein Chapathi with Mint Yogurt",
          description: "Herb-marinated chicken breast slices rolled into 2 whole wheat chapathis",
          image: "/images/power1.png",
          macros: { protein: "44g", carbs: "38g", calories: "510 kcal" },
        },
      },
      {
        dayKey: "FRI",
        dayTitle: "FRIDAY",
        daySubtitle: "Friday",
        tag: "high protein",
        powerMeal: {
          name: "Kadala Mix",
          description: "Sri Lankan spiced tempered chickpeas with fresh coconut slices & chili flakes",
          image: "/images/menu-protein-bowl.jpg",
          macros: { protein: "32g", carbs: "50g", calories: "440 kcal" },
        },
        classicMeal: {
          name: "Kadala Mix",
          description: "Wholesome boiled and tempered chickpeas with mustard seeds & curry leaves",
          image: "/images/menu-fresh-bowl.jpg",
          macros: { protein: "22g", carbs: "50g", calories: "360 kcal" },
        },
        iskoolMeal: {
          name: "Coconut & Boiled Chickpea Energy Cup",
          description: "Mild tempered chickpeas with crispy shredded fresh coconut flakes",
          image: "/images/hero-dish2.png",
          macros: { protein: "23g", carbs: "48g", calories: "370 kcal" },
        },
        fourtigMeal: {
          name: "42g Tempered Kadala Power Bowl with Boiled Eggs",
          description: "Chickpeas sautéed in cold-pressed coconut oil served with two boiled eggs",
          image: "/images/menu-protein-bowl.jpg",
          macros: { protein: "42g", carbs: "46g", calories: "500 kcal" },
        },
      },
    ],
  },
  {
    id: 3,
    menuNumber: "MENU 3",
    title: "Power Breakfast & Artisan Wraps",
    schedule: "MONDAY - FRIDAY",
    description: "Peanut & honey oat pancakes, golden fruit oats, and fresh traditional rotti wraps.",
    days: [
      {
        dayKey: "MON",
        dayTitle: "MONday",
        daySubtitle: "Monday",
        tag: "high protein",
        powerMeal: {
          name: "Egg Sandwich",
          description: "Double egg protein stack on toasted multi-grain bread with micro herbs",
          image: "/images/hero-dish2.png",
          macros: { protein: "32g", carbs: "38g", calories: "420 kcal" },
        },
        classicMeal: {
          name: "Veggie Sandwich",
          description: "Crisp cucumber, avocado, vine tomato and garden hummus on artisan bread",
          image: "/images/hero-dish.png",
          macros: { protein: "14g", carbs: "42g", calories: "320 kcal" },
        },
        iskoolMeal: {
          name: "Egg Mayo & Tender Chicken Club Bites",
          description: "Crustless triangle sandwich bites layered with boiled egg mayo and chicken",
          image: "/images/hero-dish2.png",
          macros: { protein: "26g", carbs: "35g", calories: "395 kcal" },
        },
        fourtigMeal: {
          name: "43g Quad-Egg & Herb Turkey Bacon Protein Stack",
          description: "Heavy protein sandwich stacked with four farm eggs, herb chicken & greens",
          image: "/images/power1.png",
          macros: { protein: "43g", carbs: "36g", calories: "495 kcal" },
        },
      },
      {
        dayKey: "TUE",
        dayTitle: "TUEsday",
        daySubtitle: "Tuesday",
        tag: "high protein",
        powerMeal: {
          name: "Fresh Juice + Peanut & Honey Pancake",
          description: "Cold-pressed citrus juice with fluffy oat pancakes, peanut butter & honey",
          image: "/images/menu-dessert.png",
          macros: { protein: "26g", carbs: "62g", calories: "470 kcal" },
        },
        classicMeal: {
          name: "Fresh Juice + Pancake",
          description: "Refreshing cold pressed juice with light whole grain pancakes & honey",
          image: "/images/menu-dessert.png",
          macros: { protein: "15g", carbs: "60g", calories: "380 kcal" },
        },
        iskoolMeal: {
          name: "Banana Oat Pancake with Honey & Vitamin Juice",
          description: "Fluffy oat pancakes infused with ripe bananas, raw bee honey and orange juice",
          image: "/images/menu-dessert.png",
          macros: { protein: "22g", carbs: "58g", calories: "410 kcal" },
        },
        fourtigMeal: {
          name: "42g High-Protein Whey Pancakes with Peanut Butter",
          description: "Stack of 3 whey-infused oat pancakes with crunchy peanut butter and cold pressed juice",
          image: "/images/hero-dish3.png",
          macros: { protein: "42g", carbs: "58g", calories: "540 kcal" },
        },
      },
      {
        dayKey: "WED",
        dayTitle: "WEDnesday",
        daySubtitle: "Wednesday",
        tag: "high protein",
        powerMeal: {
          name: "Fruit and Nut Oats",
          description: "Nutritious rolled oats loaded with crunchy almonds, chia and dried fruits",
          image: "/images/menu/oats-nuts.jpg",
          macros: { protein: "28g", carbs: "55g", calories: "430 kcal" },
        },
        classicMeal: {
          name: "Pineapple Oats",
          description: "Tropical oatmeal bowl topped with juicy sweet pineapple and toasted seeds",
          image: "/images/hero-salad.png",
          macros: { protein: "16g", carbs: "56g", calories: "350 kcal" },
        },
        iskoolMeal: {
          name: "Apple Cinnamon Honey Oats with Crushed Almonds",
          description: "Warm rolled oats infused with Ceylon cinnamon, diced sweet apple and honey",
          image: "/images/menu/oats-nuts.jpg",
          macros: { protein: "23g", carbs: "52g", calories: "385 kcal" },
        },
        fourtigMeal: {
          name: "44g Mega Protein Overnight Oats Jar",
          description: "Overnight protein oats packed with chia seeds, whey isolate, walnuts and berries",
          image: "/images/hero-dish3.png",
          macros: { protein: "44g", carbs: "50g", calories: "510 kcal" },
        },
      },
      {
        dayKey: "THU",
        dayTitle: "THUrsday",
        daySubtitle: "Thursday",
        tag: "high protein",
        powerMeal: {
          name: "Chicken Omelette + Veggies",
          description: "Rich protein omelette stuffed with seasoned chicken and fresh vegetables",
          image: "/images/hero-dish2.png",
          macros: { protein: "44g", carbs: "12g", calories: "430 kcal" },
        },
        classicMeal: {
          name: "Omelette + Veggies",
          description: "Light vegetable omelette prepared with free-range eggs and crisp bell peppers",
          image: "/images/hero-dish.png",
          macros: { protein: "22g", carbs: "14g", calories: "310 kcal" },
        },
        iskoolMeal: {
          name: "Cheesy Baked Egg & Chicken Muffin Cup",
          description: "Baked protein egg muffin loaded with cheddar cheese, chicken cubes and spinach",
          image: "/images/hero-dish2.png",
          macros: { protein: "25g", carbs: "12g", calories: "375 kcal" },
        },
        fourtigMeal: {
          name: "46g Athlete's Scramble with Diced Steak & Egg Whites",
          description: "Pan-seared chicken steak bits scrambled with 5 egg whites and baby spinach",
          image: "/images/power1.png",
          macros: { protein: "46g", carbs: "10g", calories: "480 kcal" },
        },
      },
      {
        dayKey: "FRI",
        dayTitle: "FRIDAY",
        daySubtitle: "Friday",
        tag: "high protein",
        powerMeal: {
          name: "Rotti Chicken Wrap",
          description: "Traditional Sri Lankan godamba rotti wrapped around spiced lean chicken",
          image: "/images/power1.png",
          macros: { protein: "39g", carbs: "42g", calories: "480 kcal" },
        },
        classicMeal: {
          name: "Rotti Egg Wrap",
          description: "Fresh rotti flatbread rolled with onion-tempered spiced scrambled egg",
          image: "/images/classic1.png",
          macros: { protein: "23g", carbs: "44g", calories: "390 kcal" },
        },
        iskoolMeal: {
          name: "Soft Pol Rotti with Scrambled Egg & Honey",
          description: "Traditional soft coconut rotti flatbread with fluffy egg and natural sweet bee honey",
          image: "/images/classic1.png",
          macros: { protein: "24g", carbs: "42g", calories: "390 kcal" },
        },
        fourtigMeal: {
          name: "45g Jumbo Godamba Rotti with Slow-Cooked Chicken",
          description: "Extra large artisan rotti stuffed with tender spiced chicken breast & caramelized onions",
          image: "/images/hero-dish3.png",
          macros: { protein: "45g", carbs: "40g", calories: "540 kcal" },
        },
      },
    ],
  },
];

export const DAYS_OF_WEEK_KEYS: Array<{
  key: "MON" | "TUE" | "WED" | "THU" | "FRI";
  title: string;
  subtitle: string;
  dayIndex: number;
}> = [
  { key: "MON", title: "MONday", subtitle: "Monday", dayIndex: 1 },
  { key: "TUE", title: "TUEsday", subtitle: "Tuesday", dayIndex: 2 },
  { key: "WED", title: "WEDnesday", subtitle: "Wednesday", dayIndex: 3 },
  { key: "THU", title: "THUrsday", subtitle: "Thursday", dayIndex: 4 },
  { key: "FRI", title: "FRIDAY", subtitle: "Friday", dayIndex: 5 },
];

function getTierMeal(day: DailyMenuItem, tier: PackageTierKey): MealDetail {
  switch (tier) {
    case "POWER":
      return day.powerMeal;
    case "CLASSIC":
      return day.classicMeal;
    case "ISKOOL":
      return day.iskoolMeal;
    case "FOURTIG":
      return day.fourtigMeal;
    default:
      return day.powerMeal;
  }
}

/**
 * Transforms dynamic menus returned by GET /public/packages/{id} (or fallback)
 * into structured WeeklyMenuData for the 4-package UI.
 */
export function parseApiPackageMenus(
  apiMenus: any[] | null | undefined,
  packageTier: PackageTierKey
): WeeklyMenuData[] {
  if (!apiMenus || !Array.isArray(apiMenus) || apiMenus.length === 0) {
    return WEEKLY_MENUS;
  }

  const fallbackMenus = WEEKLY_MENUS;

  try {
    const parsedMenus: WeeklyMenuData[] = apiMenus.map((menuObj, menuIdx) => {
      const fallbackMenu = fallbackMenus[menuIdx % fallbackMenus.length];
      const menuNumber = menuObj.name || menuObj.menu_name || `MENU ${menuIdx + 1}`;
      const title = menuObj.title || menuObj.name || fallbackMenu.title;
      const description = menuObj.description || fallbackMenu.description;
      const schedule = menuObj.schedule || "MONDAY - FRIDAY";

      // Extract raw meals list or slot list
      const rawMeals = menuObj.meals || menuObj.days || menuObj.items || [];

      const days: DailyMenuItem[] = DAYS_OF_WEEK_KEYS.map((dayMeta, dayIdx) => {
        const fallbackDay = fallbackMenu.days[dayIdx] || fallbackMenu.days[0];
        const fallbackTierMeal = getTierMeal(fallbackDay, packageTier);

        // Find match in rawMeals for this day
        let matchedRawMeal: any = null;

        if (Array.isArray(rawMeals) && rawMeals.length > 0) {
          matchedRawMeal = rawMeals.find((m: any) => {
            if (!m) return false;
            const d = (m.day || m.day_of_week || m.day_name || "").toString().toUpperCase();
            if (d.startsWith(dayMeta.key)) return true;
            if (d.includes(dayMeta.subtitle.toUpperCase())) return true;
            if (typeof m.day_number === "number" && m.day_number === dayMeta.dayIndex) return true;
            if (typeof m.sequence === "number" && m.sequence === dayIdx + 1) return true;
            return false;
          });

          // If not found by day name, try by array index
          if (!matchedRawMeal && rawMeals[dayIdx]) {
            matchedRawMeal = rawMeals[dayIdx];
          }
        }

        const mealData = matchedRawMeal?.meal || matchedRawMeal || {};
        const mealName =
          mealData.name ||
          mealData.meal_name ||
          mealData.title ||
          fallbackTierMeal.name;
        const mealDesc =
          mealData.description ||
          mealData.meal_description ||
          mealData.desc ||
          fallbackTierMeal.description;
        const mealImg =
          mealData.image_url ||
          mealData.image ||
          mealData.img ||
          fallbackTierMeal.image ||
          PACKAGE_CONFIGS[packageTier].dishImage;
        const macros = mealData.macros || {
          protein:
            mealData.protein ||
            (packageTier === "POWER" || packageTier === "FOURTIG" ? "42g" : "24g"),
          carbs: mealData.carbs || "45g",
          calories:
            mealData.calories ||
            (packageTier === "POWER" || packageTier === "FOURTIG" ? "480 kcal" : "380 kcal"),
        };

        const dynamicMeal: MealDetail = {
          name: mealName,
          description: mealDesc,
          image: mealImg,
          macros,
        };

        return {
          dayKey: dayMeta.key,
          dayTitle: dayMeta.title,
          daySubtitle: dayMeta.subtitle,
          tag: "high protein",
          meal: dynamicMeal,
          powerMeal: packageTier === "POWER" ? dynamicMeal : fallbackDay.powerMeal,
          classicMeal: packageTier === "CLASSIC" ? dynamicMeal : fallbackDay.classicMeal,
          iskoolMeal: packageTier === "ISKOOL" ? dynamicMeal : fallbackDay.iskoolMeal,
          fourtigMeal: packageTier === "FOURTIG" ? dynamicMeal : fallbackDay.fourtigMeal,
        };
      });

      return {
        id: menuObj.id || menuIdx + 1,
        menuNumber,
        title,
        schedule,
        description,
        days,
      };
    });

    return parsedMenus.length > 0 ? parsedMenus : WEEKLY_MENUS;
  } catch (err) {
    console.warn("Error parsing dynamic API menus:", err);
    return WEEKLY_MENUS;
  }
}
