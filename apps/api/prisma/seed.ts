import path from "path";
import dotenv from "dotenv";
import { PrismaClient, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

type SeedQuestion = {
  type: QuestionType;
  prompt: string;
  options?: string[] | Record<string, unknown>;
  answer: string | string[] | Record<string, string>;
  orderIndex: number;
  hint?: string;
};

async function main() {
  const allowReset =
    process.env.ALLOW_SEED_RESET === "true" ||
    process.env.NODE_ENV === "development" ||
    !process.env.NODE_ENV;

  if (!allowReset) {
    throw new Error(
      "Refusing to seed-reset: set ALLOW_SEED_RESET=true (blocked outside development)."
    );
  }

  await prisma.xpEvent.deleteMany();
  await prisma.srsCard.deleteMany();
  await prisma.lessonSession.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demo = await prisma.user.create({
    data: {
      email: "demo@walky-talky.app",
      passwordHash,
      displayName: "Demo Learner",
      timezone: "America/New_York",
      dailyXpGoal: 50,
      streak: { create: { freezesAvailable: 1, freezesUsed: 0 } },
    },
  });

  const course = await prisma.course.create({
    data: {
      slug: "spanish-basics",
      title: "Spanish Basics",
      description: "Start speaking Spanish with Walky Talky",
      language: "es",
    },
  });

  const lessons: Array<{
    slug: string;
    title: string;
    description: string;
    unitOrder: number;
    lessonOrder: number;
    questions: SeedQuestion[];
  }> = [
    {
      slug: "greetings",
      title: "Greetings",
      description: "Hello, goodbye, and polite basics",
      unitOrder: 1,
      lessonOrder: 1,
      questions: [
        {
          type: "MCQ",
          prompt: 'How do you say "Hello" in Spanish?',
          options: ["Hola", "Adiós", "Gracias", "Por favor"],
          answer: "Hola",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Complete: "___ días" (Good morning)',
          answer: ["Buenos", "buenos"],
          orderIndex: 1,
          hint: "Starts with B",
        },
        {
          type: "MCQ",
          prompt: 'What does "Gracias" mean?',
          options: ["Please", "Thank you", "Sorry", "Yes"],
          answer: "Thank you",
          orderIndex: 2,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Fill in: "Ad___" (Goodbye)',
          answer: ["iós", "ios", "Adiós", "adios"],
          orderIndex: 3,
        },
        {
          type: "MCQ",
          prompt: 'How do you say "Please"?',
          options: ["Por favor", "De nada", "Lo siento", "Bien"],
          answer: "Por favor",
          orderIndex: 4,
        },
      ],
    },
    {
      slug: "numbers-1",
      title: "Numbers 1–5",
      description: "Count from one to five",
      unitOrder: 1,
      lessonOrder: 2,
      questions: [
        {
          type: "MCQ",
          prompt: 'What is "uno"?',
          options: ["1", "2", "3", "4"],
          answer: "1",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Spanish for 2: "d___"',
          answer: ["os", "dos", "Dos"],
          orderIndex: 1,
        },
        {
          type: "MCQ",
          prompt: 'What is "tres"?',
          options: ["2", "3", "4", "5"],
          answer: "3",
          orderIndex: 2,
        },
        {
          type: "MCQ",
          prompt: "How do you say 4?",
          options: ["cinco", "cuatro", "seis", "siete"],
          answer: "cuatro",
          orderIndex: 3,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Fill in: "ci___" (5)',
          answer: ["nco", "cinco", "Cinco"],
          orderIndex: 4,
        },
      ],
    },
    {
      slug: "phrases-lab",
      title: "Phrases Lab",
      description: "Translate, listen, and match (Phase 2)",
      unitOrder: 1,
      lessonOrder: 3,
      questions: [
        {
          type: "TRANSLATE",
          prompt: 'Translate to Spanish: "Good night"',
          answer: ["Buenas noches", "buenas noches"],
          orderIndex: 0,
          hint: "Two words",
        },
        {
          type: "LISTEN",
          prompt: "Type what you hear",
          options: { speakText: "Hola", locale: "es-ES" },
          answer: ["Hola", "hola"],
          orderIndex: 1,
        },
        {
          type: "MATCH",
          prompt: "Match Spanish ↔ English",
          options: {
            left: ["Hola", "Adiós", "Gracias"],
            right: ["Hello", "Goodbye", "Thank you"],
          },
          answer: {
            Hola: "Hello",
            Adiós: "Goodbye",
            Gracias: "Thank you",
          },
          orderIndex: 2,
        },
        {
          type: "TRANSLATE",
          prompt: 'Translate to English: "De nada"',
          answer: ["You're welcome", "You are welcome", "No problem"],
          orderIndex: 3,
        },
        {
          type: "LISTEN",
          prompt: "Listen and type the word",
          options: { speakText: "Gracias", locale: "es-ES" },
          answer: ["Gracias", "gracias"],
          orderIndex: 4,
        },
      ],
    },
    {
      slug: "food-basics",
      title: "Food Basics",
      description: "Common food words",
      unitOrder: 2,
      lessonOrder: 1,
      questions: [
        {
          type: "MCQ",
          prompt: 'What is "agua"?',
          options: ["Water", "Bread", "Milk", "Coffee"],
          answer: "Water",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Spanish for bread: "p___"',
          answer: ["an", "pan", "Pan"],
          orderIndex: 1,
        },
        {
          type: "MCQ",
          prompt: 'What does "manzana" mean?',
          options: ["Banana", "Apple", "Orange", "Grape"],
          answer: "Apple",
          orderIndex: 2,
        },
        {
          type: "MCQ",
          prompt: 'How do you say "milk"?',
          options: ["leche", "café", "té", "jugo"],
          answer: "leche",
          orderIndex: 3,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Complete: "caf___" (coffee)',
          answer: ["é", "e", "café", "cafe"],
          orderIndex: 4,
        },
        {
          type: "TRANSLATE",
          prompt: 'Translate to Spanish: "I want water"',
          answer: ["Quiero agua", "quiero agua"],
          orderIndex: 5,
          hint: "Quiero…",
        },
      ],
    },
    {
      slug: "colors",
      title: "Colors",
      description: "Basic color words",
      unitOrder: 2,
      lessonOrder: 2,
      questions: [
        {
          type: "MCQ",
          prompt: 'What does "rojo" mean?',
          options: ["Blue", "Red", "Green", "Yellow"],
          answer: "Red",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK",
          prompt: 'Spanish for blue: "az___"',
          answer: ["ul", "azul", "Azul"],
          orderIndex: 1,
        },
        {
          type: "MATCH",
          prompt: "Match color ↔ English",
          options: {
            left: ["verde", "amarillo", "negro"],
            right: ["green", "yellow", "black"],
          },
          answer: {
            verde: "green",
            amarillo: "yellow",
            negro: "black",
          },
          orderIndex: 2,
        },
        {
          type: "TRANSLATE",
          prompt: 'Translate to English: "blanco"',
          answer: ["white", "White"],
          orderIndex: 3,
        },
        {
          type: "LISTEN",
          prompt: "Listen and type the color",
          options: { speakText: "rojo", locale: "es-ES" },
          answer: ["rojo", "Rojo"],
          orderIndex: 4,
        },
      ],
    },
  ];

  for (const L of lessons) {
    const lesson = await prisma.lesson.create({
      data: {
        courseId: course.id,
        slug: L.slug,
        title: L.title,
        description: L.description,
        unitOrder: L.unitOrder,
        lessonOrder: L.lessonOrder,
        xpReward: 20,
      },
    });
    for (const q of L.questions) {
      await prisma.question.create({
        data: {
          lessonId: lesson.id,
          type: q.type,
          prompt: q.prompt,
          optionsJson: q.options ?? undefined,
          answerJson: q.answer,
          hint: q.hint,
          orderIndex: q.orderIndex,
        },
      });
    }
  }

  console.log("Seeded demo user demo@walky-talky.app / demo1234");
  console.log("Course spanish-basics with", lessons.length, "lessons");
  console.log("User id:", demo.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
