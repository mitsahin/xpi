import { PrismaClient, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // Destructive reset — demo/dev only
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
      email: "demo@x-pi.app",
      passwordHash,
      displayName: "Demo Learner",
      timezone: "America/New_York",
      dailyXpGoal: 50,
      streak: { create: {} },
    },
  });

  const course = await prisma.course.create({
    data: {
      slug: "spanish-basics",
      title: "Spanish Basics",
      description: "Start speaking Spanish with x-pi",
      language: "es",
    },
  });

  const lessons = [
    {
      slug: "greetings",
      title: "Greetings",
      description: "Hello, goodbye, and polite basics",
      unitOrder: 1,
      lessonOrder: 1,
      questions: [
        {
          type: "MCQ" as QuestionType,
          prompt: 'How do you say "Hello" in Spanish?',
          options: ["Hola", "Adiós", "Gracias", "Por favor"],
          answer: "Hola",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Complete: "___ días" (Good morning)',
          answer: ["Buenos", "buenos"],
          orderIndex: 1,
          hint: "Starts with B",
        },
        {
          type: "MCQ" as QuestionType,
          prompt: 'What does "Gracias" mean?',
          options: ["Please", "Thank you", "Sorry", "Yes"],
          answer: "Thank you",
          orderIndex: 2,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Fill in: "Ad___" (Goodbye)',
          answer: ["iós", "ios", "Adiós", "adios"],
          orderIndex: 3,
        },
        {
          type: "MCQ" as QuestionType,
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
          type: "MCQ" as QuestionType,
          prompt: 'What is "uno"?',
          options: ["1", "2", "3", "4"],
          answer: "1",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Spanish for 2: "d___"',
          answer: ["os", "dos", "Dos"],
          orderIndex: 1,
        },
        {
          type: "MCQ" as QuestionType,
          prompt: 'What is "tres"?',
          options: ["2", "3", "4", "5"],
          answer: "3",
          orderIndex: 2,
        },
        {
          type: "MCQ" as QuestionType,
          prompt: 'How do you say 4?',
          options: ["cinco", "cuatro", "seis", "siete"],
          answer: "cuatro",
          orderIndex: 3,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Fill in: "ci___" (5)',
          answer: ["nco", "cinco", "Cinco"],
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
          type: "MCQ" as QuestionType,
          prompt: 'What is "agua"?',
          options: ["Water", "Bread", "Milk", "Coffee"],
          answer: "Water",
          orderIndex: 0,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Spanish for bread: "p___"',
          answer: ["an", "pan", "Pan"],
          orderIndex: 1,
        },
        {
          type: "MCQ" as QuestionType,
          prompt: 'What does "manzana" mean?',
          options: ["Banana", "Apple", "Orange", "Grape"],
          answer: "Apple",
          orderIndex: 2,
        },
        {
          type: "MCQ" as QuestionType,
          prompt: 'How do you say "milk"?',
          options: ["leche", "café", "té", "jugo"],
          answer: "leche",
          orderIndex: 3,
        },
        {
          type: "FILL_BLANK" as QuestionType,
          prompt: 'Complete: "caf___" (coffee)',
          answer: ["é", "e", "café", "cafe"],
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
          optionsJson: "options" in q ? q.options : undefined,
          answerJson: q.answer,
          hint: "hint" in q ? q.hint : undefined,
          orderIndex: q.orderIndex,
        },
      });
    }
  }

  console.log("Seeded demo user demo@x-pi.app / demo1234");
  console.log("Course spanish-basics with", lessons.length, "lessons");
  console.log("User id:", demo.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
