import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function setPassword() {
  const email = "ivanssempijja00@gmail.com";
  const password = "StudioSix2024!"; // This is a temporary password you should change

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        hashedPassword // Only update the hashedPassword field
      },
    });

    console.log("Password set successfully for user:", updatedUser.email);
  } catch (error) {
    console.error("Error setting password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword(); 