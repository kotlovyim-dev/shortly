import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

async function main() {
    const passwordHash = await bcrypt.hash("DevPassword123!", 10);

    const user = await prisma.user.upsert({
        where: {
            email: "dev@shortly.local",
        },
        update: {
            name: "Development User",
            passwordHash,
        },
        create: {
            email: "dev@shortly.local",
            name: "Development User",
            passwordHash,
        },
    });

    console.log(`Seeded development user: ${user.email}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
