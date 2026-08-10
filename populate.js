const fs = require('fs');

const categories = [
  "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)",
  "Οι ντελικάτες της Μαμάς",
  "Της Γιαγιάς που γεμίζουν κοιλίτσες και καρδιές",
  "Αέρας Νάπολης της Θείας",
  "Από Χαραλαμπρούδη",
  "Μικρές στο μάτι , Μεγάλες στο τραπέζι"
];

const foodImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484723091791-c0e7e147c09e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd814d0e601?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528625245642-12595fb0739c?w=800&auto=format&fit=crop"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const templates = {
  title: [
    "Μακαρονάδα με {adjective} σάλτσα",
    "Κοτόπουλο {adjective}",
    "Πίτα {adjective} παραδοσιακή",
    "Μοσχαράκι {adjective} κατσαρόλας",
    "Σουφλέ {adjective} φούρνου",
    "Σαλάτα {adjective} δροσερή",
    "Ριζότο {adjective}",
    "Μπιφτέκια {adjective} ζουμερά",
    "Τάρτα {adjective} αλμυρή"
  ],
  adjective: ["πεντανόστιμη", "λεμονάτη", "χωριάτικη", "μελωμένη", "φανταστική", "έκπληξη", "αρωματική"],
  description: [
    "Μια συνταγή που θα λατρέψει όλη η οικογένεια! Με απλά υλικά και υπέροχη γεύση.",
    "Το απόλυτο comfort food, ό,τι πρέπει για τις Κυριακές ή τα κρύα απογεύματα.",
    "Λεπτές γεύσεις, όμορφο στήσιμο και πολλή αγάπη σε κάθε μπουκιά.",
    "Μια κλασική συνταγή που φέρνει στο νου αναμνήσεις και γεμίζει το σπίτι αρώματα."
  ],
  ingredients: [
    ["1 κιλό κρέας", "2 κρεμμύδια", "Λάδι και αλάτι", "Μπαχαρικά της αρεσκείας σας"],
    ["500γρ ζυμαρικά", "Σάλτσα ντομάτας", "Μπόλικο τυρί", "Φρέσκος βασιλικός"],
    ["Πατάτες", "Λάδι", "Ρίγανη", "Λεμόνι"],
    ["Φρέσκα λαχανικά", "Ελαιόλαδο", "Ξύδι βαλσάμικο", "Αλάτι"],
    ["Αλεύρι", "Αυγά", "Γάλα", "Βούτυρο", "Τυρί φέτα"]
  ],
  steps: [
    [
      "Ετοιμάζουμε όλα τα υλικά μας στον πάγκο.",
      "Βάζουμε το λάδι να κάψει και τσιγαρίζουμε.",
      "Προσθέτουμε τα υπόλοιπα υλικά, χαμηλώνουμε τη φωτιά και αφήνουμε να σιγοβράσει.",
      "Σερβίρουμε με μπόλικη αγάπη!"
    ],
    [
      "Προθερμαίνουμε τον φούρνο στους 180 βαθμούς.",
      "Ανακατεύουμε τα υλικά σε ένα μεγάλο μπολ.",
      "Απλώνουμε στο ταψί και ψήνουμε μέχρι να ροδίσει.",
      "Αφήνουμε να κρυώσει λίγο πριν κόψουμε κομμάτια."
    ],
    [
      "Βράζουμε το νερό με μπόλικο αλάτι.",
      "Εντωμεταξύ φτιάχνουμε τη σάλτσα στο τηγάνι.",
      "Ενώνουμε τα υλικά και ανακατεύουμε καλά.",
      "Γαρνίρουμε με τυρί και φρέσκα μυρωδικά."
    ]
  ],
  memory: [
    { title: "Κυριακάτικο τραπέζι", story: "Κάθε Κυριακή, αυτή η μυρωδιά μας ξυπνούσε από το πρωί!" },
    { title: "Η έκπληξη", story: "Δεν περιμέναμε να βγει τόσο ωραίο την πρώτη φορά, αλλά έγινε η σπεσιαλιτέ μας." },
    { title: "Γιορτινές μέρες", story: "Πάντα παρόν σε κάθε γιορτή, ήταν το πιάτο που άδειαζε πρώτο." }
  ]
};

const newRecipes = [];
let idCounter = 1;

categories.forEach(category => {
  for (let i = 0; i < 5; i++) {
    const adj = getRandomItem(templates.adjective);
    const title = getRandomItem(templates.title).replace('{adjective}', adj);
    
    const imageIndex = Math.floor(Math.random() * 15) + 1;
    const imageUrl = `/images/recipes/placeholder-${imageIndex}.jpg`;

    newRecipes.push({
      id: `generated-recipe-${idCounter}`,
      title: title,
      description: getRandomItem(templates.description),
      ingredients: getRandomItem(templates.ingredients),
      steps: getRandomItem(templates.steps),
      memory: {
        title: getRandomItem(templates.memory).title,
        story: getRandomItem(templates.memory).story,
        date: "2023-11"
      },
      category: category,
      imageUrl: imageUrl,
      prepTime: "20 λεπτά",
      cookTime: "45 λεπτά",
      servings: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    idCounter++;
  }
});

const data = {
  recipes: newRecipes
};

fs.writeFileSync('/Users/alkisroudis/Desktop/roudomageirikes/data/recipes.json', JSON.stringify(data, null, 2));
console.log("Recipes generated successfully");
