import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function importData() {
  const filePath = path.join(process.cwd(), "exported_data.json");
  if (!fs.existsSync(filePath)) {
    console.error("No se encontró el archivo exported_data.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  console.log(`Importando datos exportados el: ${data.exportDate}`);

  // 1. Usuarios
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
      },
    });
  }
  console.log(`✓ ${data.users.length} usuarios sincronizados.`);

  // 2. Juegos y Componentes
  for (const game of data.games) {
    const { components, ...gameData } = game;
    await prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: gameData.id,
        name: gameData.name,
        description: gameData.description,
        category: gameData.category,
        price: gameData.price,
        stock: gameData.stock,
        image: gameData.image,
        minPlayers: gameData.minPlayers,
        maxPlayers: gameData.maxPlayers,
        minAge: gameData.minAge,
        playtime: gameData.playtime,
      },
      update: {
        name: gameData.name,
        description: gameData.description,
        category: gameData.category,
        price: gameData.price,
        stock: gameData.stock,
        image: gameData.image,
        minPlayers: gameData.minPlayers,
        maxPlayers: gameData.maxPlayers,
        minAge: gameData.minAge,
        playtime: gameData.playtime,
      },
    });

    if (components) {
      await prisma.gameComponents.upsert({
        where: { gameId: game.id },
        create: {
          gameId: game.id,
          cards: components.cards,
          tokens: components.tokens,
          dice: components.dice,
          tiles: components.tiles,
          others: components.others,
          othersDescription: components.othersDescription,
        },
        update: {
          cards: components.cards,
          tokens: components.tokens,
          dice: components.dice,
          tiles: components.tiles,
          others: components.others,
          othersDescription: components.othersDescription,
        },
      });
    }
  }
  console.log(`✓ ${data.games.length} juegos y componentes sincronizados.`);

  // 3. Alquileres
  for (const rental of data.rentals) {
    await prisma.rental.upsert({
      where: { id: rental.id },
      create: {
        id: rental.id,
        gameId: rental.gameId,
        userId: rental.userId,
        clientName: rental.clientName,
        clientLastName: rental.clientLastName,
        clientPhone: rental.clientPhone,
        clientEmail: rental.clientEmail,
        clientAddress: rental.clientAddress,
        startDate: new Date(rental.startDate),
        expectedEndDate: new Date(rental.expectedEndDate),
        returnDate: rental.returnDate ? new Date(rental.returnDate) : null,
        status: rental.status,
      },
      update: {
        status: rental.status,
        returnDate: rental.returnDate ? new Date(rental.returnDate) : null,
      },
    });
  }
  console.log(`✓ ${data.rentals.length} alquileres sincronizados.`);

  // 4. Reservas
  for (const res of data.reservations) {
    await prisma.reservation.upsert({
      where: { id: res.id },
      create: {
        id: res.id,
        gameId: res.gameId,
        userId: res.userId,
        clientName: res.clientName,
        clientLastName: res.clientLastName,
        clientPhone: res.clientPhone,
        clientEmail: res.clientEmail,
        clientAddress: res.clientAddress,
        expectedEndDate: new Date(res.expectedEndDate),
        status: res.status,
      },
      update: {
        status: res.status,
      },
    });
  }
  console.log(`✓ ${data.reservations.length} reservas sincronizadas.`);

  console.log("¡Importación completada con éxito!");
}

importData()
  .catch((e) => {
    console.error("Error al importar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
