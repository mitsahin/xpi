export type SkillNode = {
  id: string;
  title: string;
  subtitle: string;
  offset: "left" | "center" | "right";
};

export type McqExercise = {
  id: string;
  skillId: string;
  prompt: string;
  promptTr: string;
  audioLabel: string;
  options: string[];
  correctIndex: number;
};

export const SKILLS: SkillNode[] = [
  {
    id: "greetings",
    title: "Selamlaşma",
    subtitle: "Merhaba frekansı",
    offset: "center",
  },
  {
    id: "cafe",
    title: "Kafede",
    subtitle: "Sipariş ver",
    offset: "right",
  },
  {
    id: "directions",
    title: "Yol Tarifi",
    subtitle: "Nereye gidiyorsun?",
    offset: "left",
  },
  {
    id: "travel",
    title: "Seyahat",
    subtitle: "Bilet & bagaj",
    offset: "right",
  },
  {
    id: "feelings",
    title: "Duygular",
    subtitle: "Nasıl hissediyorsun?",
    offset: "left",
  },
  {
    id: "radio",
    title: "Telsiz Sohbeti",
    subtitle: "Sesli pratik",
    offset: "center",
  },
];

export const EXERCISES: McqExercise[] = [
  {
    id: "g1",
    skillId: "greetings",
    prompt: "Hello!",
    promptTr: "“Hello!” ne demek?",
    audioLabel: "Hello!",
    options: ["Merhaba", "Güle güle", "Teşekkürler", "Affedersin"],
    correctIndex: 0,
  },
  {
    id: "g2",
    skillId: "greetings",
    prompt: "Good morning",
    promptTr: "“Good morning” çevirisi?",
    audioLabel: "Good morning",
    options: ["İyi geceler", "Günaydın", "İyi akşamlar", "Hoşça kal"],
    correctIndex: 1,
  },
  {
    id: "g3",
    skillId: "greetings",
    prompt: "See you later",
    promptTr: "“See you later” ne anlama gelir?",
    audioLabel: "See you later",
    options: ["Afiyet olsun", "Sonra görüşürüz", "Buyurun", "Rica ederim"],
    correctIndex: 1,
  },
  {
    id: "c1",
    skillId: "cafe",
    prompt: "A coffee, please",
    promptTr: "“A coffee, please” nasıl söylenir?",
    audioLabel: "A coffee, please",
    options: [
      "Bir kahve, lütfen",
      "Hesap lütfen",
      "Su ister misin?",
      "Menüyü getir",
    ],
    correctIndex: 0,
  },
  {
    id: "c2",
    skillId: "cafe",
    prompt: "The bill, please",
    promptTr: "Hesabı isterken?",
    audioLabel: "The bill, please",
    options: ["Menü lütfen", "Hesap lütfen", "Şeker ekle", "Buzlu olsun"],
    correctIndex: 1,
  },
  {
    id: "c3",
    skillId: "cafe",
    prompt: "With milk",
    promptTr: "“With milk” çevirisi?",
    audioLabel: "With milk",
    options: ["Şekersiz", "Sütlü", "Sıcak", "Soğuk"],
    correctIndex: 1,
  },
  {
    id: "d1",
    skillId: "directions",
    prompt: "Where is the station?",
    promptTr: "“Where is the station?”",
    audioLabel: "Where is the station?",
    options: [
      "İstasyon nerede?",
      "Saat kaç?",
      "Ne kadar sürer?",
      "Bilet alabilir miyim?",
    ],
    correctIndex: 0,
  },
  {
    id: "d2",
    skillId: "directions",
    prompt: "Turn left",
    promptTr: "“Turn left”",
    audioLabel: "Turn left",
    options: ["Sağa dön", "Düz git", "Sola dön", "Dur"],
    correctIndex: 2,
  },
  {
    id: "d3",
    skillId: "directions",
    prompt: "It's nearby",
    promptTr: "“It's nearby”",
    audioLabel: "It's nearby",
    options: ["Çok uzak", "Yakınlarda", "Kapalı", "Açık"],
    correctIndex: 1,
  },
  {
    id: "t1",
    skillId: "travel",
    prompt: "One ticket to Paris",
    promptTr: "“One ticket to Paris”",
    audioLabel: "One ticket to Paris",
    options: [
      "Paris'e bir bilet",
      "İki bilet lütfen",
      "Bagajım kayıp",
      "Kapı numarası?",
    ],
    correctIndex: 0,
  },
  {
    id: "t2",
    skillId: "travel",
    prompt: "Boarding gate",
    promptTr: "“Boarding gate”",
    audioLabel: "Boarding gate",
    options: ["Pasaport kontrol", "Biniş kapısı", "Gümrük", "Transfer"],
    correctIndex: 1,
  },
  {
    id: "t3",
    skillId: "travel",
    prompt: "My luggage is missing",
    promptTr: "“My luggage is missing”",
    audioLabel: "My luggage is missing",
    options: [
      "Biletim iptal",
      "Uçağım gecikti",
      "Bagajım kayıp",
      "Rezervasyonum var",
    ],
    correctIndex: 2,
  },
  {
    id: "f1",
    skillId: "feelings",
    prompt: "I'm happy",
    promptTr: "“I'm happy”",
    audioLabel: "I'm happy",
    options: ["Mutluyum", "Üzgünüm", "Yorgunum", "Kızgınım"],
    correctIndex: 0,
  },
  {
    id: "f2",
    skillId: "feelings",
    prompt: "I'm tired",
    promptTr: "“I'm tired”",
    audioLabel: "I'm tired",
    options: ["Açım", "Yorgunum", "Hasta değilim", "Heyecanlıyım"],
    correctIndex: 1,
  },
  {
    id: "f3",
    skillId: "feelings",
    prompt: "That sounds great",
    promptTr: "“That sounds great”",
    audioLabel: "That sounds great",
    options: ["Kötü fikir", "Kulağa harika geliyor", "Bilmiyorum", "Belki sonra"],
    correctIndex: 1,
  },
  {
    id: "r1",
    skillId: "radio",
    prompt: "Over and out",
    promptTr: "“Over and out” telsiz jargonu?",
    audioLabel: "Over and out",
    options: [
      "Anlaşıldı, kapattım",
      "Tekrar et",
      "Bekle",
      "Frekans değiştir",
    ],
    correctIndex: 0,
  },
  {
    id: "r2",
    skillId: "radio",
    prompt: "Can you hear me?",
    promptTr: "“Can you hear me?”",
    audioLabel: "Can you hear me?",
    options: ["Beni duyuyor musun?", "Kim var?", "Sessiz ol", "Tamam"],
    correctIndex: 0,
  },
  {
    id: "r3",
    skillId: "radio",
    prompt: "Roger that",
    promptTr: "“Roger that”",
    audioLabel: "Roger that",
    options: ["Hayır", "Anlaşıldı", "Tekrar sor", "İptal"],
    correctIndex: 1,
  },
];

export function exercisesForSkill(skillId: string) {
  return EXERCISES.filter((e) => e.skillId === skillId);
}
