import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.rental.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.gameComponents.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creando usuarios iniciales...");
  const user1 = await prisma.user.create({
    data: {
      firstName: "Lucas",
      lastName: "Benítez",
      phone: "+54 9 11 4455-6677",
      email: "lucas.benitez@example.com",
      address: "Av. Corrientes 1234, CABA",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Camila",
      lastName: "Romero",
      phone: "+54 9 11 5566-7788",
      email: "camila.romero@example.com",
      address: "Calle Alvarado 456, Ramos Mejía",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      firstName: "Mateo",
      lastName: "Fernández",
      phone: "+54 9 11 6677-8899",
      email: "mateo.f@example.com",
      address: "Güemes 789, San Isidro",
    },
  });

  console.log("Creando catálogo de juegos con componentes...");

  const catan = await prisma.game.create({
    data: {
      name: "Catan",
      description:
        "Los jugadores intentan colonizar una isla virgen rica en recursos. Negocia materias primas, construye caminos, pueblos y ciudades.",
      category: "Estrategia",
      price: 3500,
      stock: 3,
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
      minPlayers: 3,
      maxPlayers: 4,
      minAge: 10,
      playtime: 75,
      components: {
        create: {
          cards: 120,
          tokens: 96,
          dice: 2,
          tiles: 19,
          others: 16,
          othersDescription: "Poblados, ciudades y carreteras plásticas",
        },
      },
    },
  });

  const carcassonne = await prisma.game.create({
    data: {
      name: "Carcassonne",
      description:
        "Juego de colocación de losetas donde se construye el paisaje medieval de la ciudad fortificada, con caminos, monasterios y castillos.",
      category: "Estrategia",
      price: 2800,
      stock: 4,
      image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80",
      minPlayers: 2,
      maxPlayers: 5,
      minAge: 7,
      playtime: 40,
      components: {
        create: {
          cards: 0,
          tokens: 40,
          dice: 0,
          tiles: 72,
          others: 8,
          othersDescription: "Seguidores de madera (meeples) de colores",
        },
      },
    },
  });

  const dixit = await prisma.game.create({
    data: {
      name: "Dixit",
      description:
        "Juego creativo y poético de deducción e imágenes evocadoras. Da pistas ingeniosas y descubre qué carta pertenece al narrador.",
      category: "Party",
      price: 2500,
      stock: 2,
      image: "https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?auto=format&fit=crop&w=800&q=80",
      minPlayers: 3,
      maxPlayers: 8,
      minAge: 8,
      playtime: 30,
      components: {
        create: {
          cards: 84,
          tokens: 36,
          dice: 0,
          tiles: 1,
          others: 8,
          othersDescription: "Conejos marcadores de madera y tablero de puntuación",
        },
      },
    },
  });

  const pandemic = await prisma.game.create({
    data: {
      name: "Pandemic",
      description:
        "Juego cooperativo en el que un equipo de especialistas debe coordinarse para erradicar cuatro plagas mortales antes de que colapsen el mundo.",
      category: "Cooperativo",
      price: 3200,
      stock: 2,
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      minPlayers: 2,
      maxPlayers: 4,
      minAge: 10,
      playtime: 45,
      components: {
        create: {
          cards: 118,
          tokens: 96,
          dice: 0,
          tiles: 0,
          others: 13,
          othersDescription: "Centros de investigación y marcadores de infección",
        },
      },
    },
  });

  const codenames = await prisma.game.create({
    data: {
      name: "Código Secreto (Codenames)",
      description:
        "Dos espías rivales conocen la identidad secreta de cada agente y deben dar pistas de una sola palabra para que su equipo los identifique.",
      category: "Party",
      price: 2000,
      stock: 5,
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80",
      minPlayers: 4,
      maxPlayers: 8,
      minAge: 10,
      playtime: 15,
      components: {
        create: {
          cards: 200,
          tokens: 25,
          dice: 0,
          tiles: 1,
          others: 2,
          othersDescription: "Reloj de arena y peana para carta clave",
        },
      },
    },
  });

  const wingspan = await prisma.game.create({
    data: {
      name: "Wingspan",
      description:
        "Construcción de motores de aves donde eres un entusiasta de la ornitología atrayendo las especies más fascinantes a tu reserva natural.",
      category: "Estrategia",
      price: 4500,
      stock: 2,
      image: "https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=800&q=80",
      minPlayers: 1,
      maxPlayers: 5,
      minAge: 10,
      playtime: 70,
      components: {
        create: {
          cards: 170,
          tokens: 103,
          dice: 5,
          tiles: 26,
          others: 75,
          othersDescription: "Huevos en miniatura de plástico y comedero torre de dados",
        },
      },
    },
  });

  console.log("Creando alquileres y reservas de prueba...");

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Alquiler activo
  await prisma.rental.create({
    data: {
      gameId: catan.id,
      userId: user1.id,
      clientName: user1.firstName,
      clientLastName: user1.lastName,
      clientPhone: user1.phone,
      clientEmail: user1.email,
      clientAddress: user1.address,
      startDate: now,
      expectedEndDate: threeDaysFromNow,
      status: "ACTIVE",
    },
  });

  // Alquiler devuelto
  await prisma.rental.create({
    data: {
      gameId: dixit.id,
      userId: user2.id,
      clientName: user2.firstName,
      clientLastName: user2.lastName,
      clientPhone: user2.phone,
      clientEmail: user2.email,
      clientAddress: user2.address,
      startDate: oneWeekAgo,
      expectedEndDate: twoDaysAgo,
      returnDate: twoDaysAgo,
      status: "RETURNED",
    },
  });

  // Reserva pendiente
  await prisma.reservation.create({
    data: {
      gameId: wingspan.id,
      userId: user3.id,
      clientName: user3.firstName,
      clientLastName: user3.lastName,
      clientPhone: user3.phone,
      clientEmail: user3.email,
      clientAddress: user3.address,
      expectedEndDate: threeDaysFromNow,
      status: "PENDING",
    },
  });

  console.log("¡Base de datos sembrada con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
