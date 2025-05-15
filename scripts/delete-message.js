// Script to delete specific messages from the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSpecificMessage() {
  try {
    console.log('Searching for message...');
    
    // Find user by name
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'shammah kahangi',
          mode: 'insensitive'
        }
      }
    });
    
    if (!user) {
      console.log('User "Shammah Kahangi" not found.');
      return;
    }
    
    console.log(`Found user: ${user.name} (ID: ${user.id})`);
    
    // Find message by content and user ID
    const message = await prisma.communityMessage.findFirst({
      where: {
        content: 'cdbjbdcbdscdssd',
        userId: user.id
      }
    });
    
    if (!message) {
      console.log('Message with content "cdbjbdcbdscdssd" not found for this user.');
      return;
    }
    
    console.log(`Found message: ID ${message.id}, Content: ${message.content}`);
    
    // Delete the message
    await prisma.communityMessage.delete({
      where: {
        id: message.id
      }
    });
    
    console.log(`Successfully deleted message with ID: ${message.id}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificMessage()
  .then(() => console.log('Script completed.'))
  .catch(e => console.error(e)); 