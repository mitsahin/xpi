export type LessonQuestion = {
  id: string;
  prompt: string;
  audioLabel: string;
  options: { id: string; text: string; correct: boolean }[];
};

export type PathNode = {
  id: string;
  title: string;
  unit: number;
  offsetX: number;
  stars?: number;
};

export const PATH_NODES: PathNode[] = [
  { id: "1", title: "Merhaba", unit: 1, offsetX: 0 },
  { id: "2", title: "Teşekkürler", unit: 1, offsetX: 48 },
  { id: "3", title: "Sayılar", unit: 1, offsetX: -32 },
  { id: "4", title: "Renkler", unit: 2, offsetX: 40 },
  { id: "5", title: "Aile", unit: 2, offsetX: -48 },
  { id: "6", title: "Yemek", unit: 2, offsetX: 24 },
  { id: "7", title: "Yönler", unit: 3, offsetX: -40 },
  { id: "8", title: "Hava", unit: 3, offsetX: 56 },
  { id: "9", title: "Alışveriş", unit: 3, offsetX: -16 },
  { id: "10", title: "Seyahat", unit: 4, offsetX: 32 },
];

export const LESSONS: Record<string, LessonQuestion[]> = {
  "1": [
    {
      id: "1-q1",
      prompt: '"Hello" kelimesinin Türkçe karşılığı nedir?',
      audioLabel: "Merhaba",
      options: [
        { id: "a", text: "Merhaba", correct: true },
        { id: "b", text: "Hoşça kal", correct: false },
        { id: "c", text: "Lütfen", correct: false },
      ],
    },
    {
      id: "1-q2",
      prompt: "Sabah selamlaşması için hangisi uygundur?",
      audioLabel: "Günaydın",
      options: [
        { id: "a", text: "İyi geceler", correct: false },
        { id: "b", text: "Günaydın", correct: true },
        { id: "c", text: "Görüşürüz", correct: false },
      ],
    },
  ],
  "2": [
    {
      id: "2-q1",
      prompt: '"Thank you" ifadesi ne demektir?',
      audioLabel: "Teşekkür ederim",
      options: [
        { id: "a", text: "Teşekkür ederim", correct: true },
        { id: "b", text: "Affedersiniz", correct: false },
        { id: "c", text: "Rica ederim", correct: false },
      ],
    },
  ],
  "3": [
    {
      id: "3-q1",
      prompt: '"Five" sayısının Türkçesi?',
      audioLabel: "Beş",
      options: [
        { id: "a", text: "Dört", correct: false },
        { id: "b", text: "Beş", correct: true },
        { id: "c", text: "Altı", correct: false },
      ],
    },
  ],
  "4": [
    {
      id: "4-q1",
      prompt: '"Blue" rengi hangisidir?',
      audioLabel: "Mavi",
      options: [
        { id: "a", text: "Mavi", correct: true },
        { id: "b", text: "Kırmızı", correct: false },
        { id: "c", text: "Sarı", correct: false },
      ],
    },
  ],
  "5": [
    {
      id: "5-q1",
      prompt: '"Mother" kelimesi?',
      audioLabel: "Anne",
      options: [
        { id: "a", text: "Baba", correct: false },
        { id: "b", text: "Anne", correct: true },
        { id: "c", text: "Kardeş", correct: false },
      ],
    },
  ],
  "6": [
    {
      id: "6-q1",
      prompt: '"Water" ne demek?',
      audioLabel: "Su",
      options: [
        { id: "a", text: "Su", correct: true },
        { id: "b", text: "Ekmek", correct: false },
        { id: "c", text: "Çay", correct: false },
      ],
    },
  ],
  "7": [
    {
      id: "7-q1",
      prompt: '"Left" yönü?',
      audioLabel: "Sol",
      options: [
        { id: "a", text: "Sağ", correct: false },
        { id: "b", text: "Sol", correct: true },
        { id: "c", text: "İleri", correct: false },
      ],
    },
  ],
  "8": [
    {
      id: "8-q1",
      prompt: '"Rain" hava durumu?',
      audioLabel: "Yağmur",
      options: [
        { id: "a", text: "Güneşli", correct: false },
        { id: "b", text: "Yağmur", correct: true },
        { id: "c", text: "Karlı", correct: false },
      ],
    },
  ],
  "9": [
    {
      id: "9-q1",
      prompt: '"How much?" alışverişte ne sorar?',
      audioLabel: "Ne kadar?",
      options: [
        { id: "a", text: "Ne kadar?", correct: true },
        { id: "b", text: "Nerede?", correct: false },
        { id: "c", text: "Kim?", correct: false },
      ],
    },
  ],
  "10": [
    {
      id: "10-q1",
      prompt: '"Airport" kelimesi?',
      audioLabel: "Havalimanı",
      options: [
        { id: "a", text: "İstasyon", correct: false },
        { id: "b", text: "Havalimanı", correct: true },
        { id: "c", text: "Otel", correct: false },
      ],
    },
  ],
};

export function getDefaultQuestions(lessonId: string): LessonQuestion[] {
  return (
    LESSONS[lessonId] ?? [
      {
        id: `${lessonId}-default`,
        prompt: "Bu frekansta doğru cevabı seç!",
        audioLabel: "Walky Talky",
        options: [
          { id: "a", text: "Doğru cevap", correct: true },
          { id: "b", text: "Yanlış", correct: false },
          { id: "c", text: "Başka", correct: false },
        ],
      },
    ]
  );
}
