import prisma from '@/lib/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  try {
    console.log('Seeding database...');
    
    // Seed community categories
    const categories = [
      {
        name: 'Announcements',
        description: 'Official announcements and updates about StudioSix',
        order: 1,
        channels: [
          { name: 'Product Updates', description: 'Updates about product features and enhancements', order: 1 },
          { name: 'Release Notes', description: 'Detailed information about new releases', order: 2 },
          { name: 'Event Alerts', description: 'Information about upcoming events and webinars', order: 3 },
        ],
      },
      {
        name: 'Show Your Work',
        description: 'Share your projects and get feedback from the community',
        order: 2,
        channels: [
          { name: 'Renders', description: 'Share your rendered designs and images', order: 1 },
          { name: 'Real Projects', description: 'Share real-world projects you\'ve completed', order: 2 },
          { name: 'Style Tags', description: 'Share designs with specific style directions', order: 3 },
        ],
      },
      {
        name: 'Tips & Workflows',
        description: 'Share and discover useful tips and workflow strategies',
        order: 3,
        channels: [
          { name: 'Prompt Library', description: 'Share effective prompts for various use cases', order: 1 },
          { name: 'Workflow Ideas', description: 'Discuss efficient workflows for different projects', order: 2 },
          { name: 'StudioSix Hacks', description: 'Share clever ways to use the platform', order: 3 },
        ],
      },
      {
        name: 'Ask the Community',
        description: 'Ask questions and get help from the community',
        order: 4,
        channels: [
          { name: 'General Questions', description: 'Ask general questions about StudioSix', order: 1 },
          { name: 'Software Setup', description: 'Get help with software configuration and setup', order: 2 },
          { name: 'Hardware Support', description: 'Discuss hardware requirements and issues', order: 3 },
        ],
      },
      {
        name: 'Bug Reports',
        description: 'Report and track bugs in the platform',
        order: 5,
        channels: [
          { name: 'Report a Bug', description: 'Submit new bug reports', order: 1 },
          { name: 'Known Issues', description: 'Discuss known issues and workarounds', order: 2 },
          { name: 'Troubleshooting Tips', description: 'Share tips for resolving common issues', order: 3 },
        ],
      },
      {
        name: 'Feature Suggestions',
        description: 'Suggest and discuss new features for StudioSix',
        order: 6,
        channels: [
          { name: 'Suggest a Feature', description: 'Submit new feature suggestions', order: 1 },
          { name: 'In Progress', description: 'Features currently in development', order: 2 },
          { name: 'Under Review', description: 'Feature suggestions under consideration', order: 3 },
        ],
      },
    ];

    // Create categories and channels in the database
    for (const categoryData of categories) {
      const { channels, ...categoryInfo } = categoryData;
      
      // Check if category already exists
      const existingCategory = await prisma.communityCategory.findFirst({
        where: { name: categoryInfo.name },
      });
      
      if (existingCategory) {
        console.log(`Category "${categoryInfo.name}" already exists, skipping...`);
        continue;
      }
      
      // Create the category
      const category = await prisma.communityCategory.create({
        data: categoryInfo,
      });
      
      console.log(`Created category: ${category.name}`);
      
      // Create channels for this category
      for (const channelData of channels) {
        // Check if channel already exists
        const existingChannel = await prisma.communityChannel.findFirst({
          where: { 
            name: channelData.name,
            categoryId: category.id,
          },
        });
        
        if (existingChannel) {
          console.log(`Channel "${channelData.name}" already exists, skipping...`);
          continue;
        }
        
        // Create the channel
        const channel = await prisma.communityChannel.create({
          data: {
            ...channelData,
            categoryId: category.id,
          },
        });
        
        console.log(`Created channel: ${channel.name}`);
      }
    }
    
    // Add initial messages to channels
    await seedSampleMessages();
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to seed sample messages, polls, and threads
async function seedSampleMessages() {
  try {
    // Find existing users or create demo users if none exist
    let users = await prisma.user.findMany({ take: 5 });
    
    // If there aren't enough users, we'll use default values
    const demoUsers = [
      {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        image: '/profile-icons/panda.png',
        level: 4,
        verified: true
      },
      {
        id: 'user-2',
        name: 'Mark Johnson',
        email: 'mark.johnson@example.com',
        image: '/profile-icons/lion.png',
        level: 3,
        verified: false
      },
      {
        id: 'user-3',
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@example.com',
        image: '/profile-icons/owl.png',
        level: 5,
        verified: true
      },
      {
        id: 'user-4',
        name: 'Emily Parker',
        email: 'emily.parker@example.com',
        image: '/profile-icons/bear.png',
        level: 2,
        verified: false
      },
      {
        id: 'user-5',
        name: 'David Thompson',
        email: 'david.thompson@example.com',
        image: '/profile-icons/fox.png',
        level: 3,
        verified: false
      }
    ];
    
    // Find or create channels for announcements
    const productUpdatesChannel = await prisma.communityChannel.findFirst({
      where: { name: 'Product Updates' }
    });
    
    const renderChannel = await prisma.communityChannel.findFirst({
      where: { name: 'Renders' }
    });
    
    const promptLibraryChannel = await prisma.communityChannel.findFirst({
      where: { name: 'Prompt Library' }
    });
    
    const generalQuestionsChannel = await prisma.communityChannel.findFirst({
      where: { name: 'General Questions' }
    });
    
    // Skip if no channels found or if messages already exist
    if (!productUpdatesChannel) {
      console.log('Skipping message seeding: Product Updates channel not found');
      return;
    }
    
    // Check if we already have messages
    const existingMessages = await prisma.communityMessage.count();
    if (existingMessages > 0) {
      console.log(`${existingMessages} messages already exist, skipping message seeding`);
      return;
    }
    
    // Add sample messages to Product Updates channel
    if (productUpdatesChannel) {
      // Create a material editor update post
      await prisma.communityMessage.create({
        data: {
          content: 'Just released a new version of the material editor. Check it out in the latest update!',
          channelId: productUpdatesChannel.id,
          userId: users[0]?.id || demoUsers[0].id,
          likes: 24,
          attachments: [
            {
              type: 'image',
              url: '/gallery/image1.jpg',
            }
          ]
        }
      });
      
      // Create a new lighting system announcement
      await prisma.communityMessage.create({
        data: {
          content: 'We are excited to announce our new volumetric lighting system! It creates much more realistic atmosphere in your renders.',
          channelId: productUpdatesChannel.id,
          userId: users[2]?.id || demoUsers[2].id,
          likes: 18,
        }
      });
      
      // Create a thread about upcoming features
      const thread = await prisma.thread.create({
        data: {
          title: 'Upcoming Features Roadmap',
          isPrivate: false
        }
      });
      
      // Create message for the thread
      await prisma.communityMessage.create({
        data: {
          content: 'We have some exciting features planned for the coming months. Click to see our roadmap!',
          channelId: productUpdatesChannel.id,
          userId: users[0]?.id || demoUsers[0].id,
          isThread: true,
          threadId: thread.id,
          likes: 32
        }
      });
      
      // Add messages to the thread
      await prisma.threadMessage.create({
        data: {
          content: 'Here\'s our roadmap for the next quarter:\n\n1. Advanced material system (June)\n2. Collaborative editing (July)\n3. Mobile app version (August)\n4. AI-powered design suggestions (September)',
          threadId: thread.id,
          userId: users[0]?.id || demoUsers[0].id,
          likes: 15
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'Can\'t wait for the collaborative editing feature! This will be a game-changer for our team.',
          threadId: thread.id,
          userId: users[3]?.id || demoUsers[3].id,
          likes: 8
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'Will the mobile app have all the features of the desktop version?',
          threadId: thread.id,
          userId: users[1]?.id || demoUsers[1].id,
          likes: 3
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'The mobile app will initially focus on viewing and commenting functionality, with limited editing capabilities. Full editing will come in a later update.',
          threadId: thread.id,
          userId: users[0]?.id || demoUsers[0].id,
          likes: 5
        }
      });
    }
    
    // Add sample messages to Renders channel
    if (renderChannel) {
      // Create a message with a render
      await prisma.communityMessage.create({
        data: {
          content: 'Just finished this modern house design using the new materials. What do you think?',
          channelId: renderChannel.id,
          userId: users[4]?.id || demoUsers[4].id,
          likes: 42,
          attachments: [
            {
              type: 'image',
              url: '/gallery/image2.jpg',
            }
          ]
        }
      });
      
      // Create a poll asking for feedback
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const poll = await prisma.poll.create({
        data: {
          question: 'Which rendering style do you prefer?',
          options: ['Photorealistic', 'Stylized', 'Abstract', 'Technical'],
          duration: '1 week',
          allowMultiple: false,
          expiresAt
        }
      });
      
      await prisma.communityMessage.create({
        data: {
          content: 'I\'m working on a new portfolio and would like to know what rendering style people prefer these days.',
          channelId: renderChannel.id,
          userId: users[1]?.id || demoUsers[1].id,
          isPoll: true,
          pollId: poll.id,
          likes: 15
        }
      });
      
      // Add some votes to the poll
      await prisma.pollVote.create({
        data: {
          pollId: poll.id,
          userId: users[0]?.id || demoUsers[0].id,
          options: ['Photorealistic']
        }
      });
      
      await prisma.pollVote.create({
        data: {
          pollId: poll.id,
          userId: users[2]?.id || demoUsers[2].id,
          options: ['Stylized']
        }
      });
      
      await prisma.pollVote.create({
        data: {
          pollId: poll.id,
          userId: users[3]?.id || demoUsers[3].id,
          options: ['Photorealistic']
        }
      });
    }
    
    // Add sample messages to Prompt Library channel
    if (promptLibraryChannel) {
      await prisma.communityMessage.create({
        data: {
          content: 'Here\'s a prompt that works really well for creating modern interior scenes:\n\n"ultra detailed modern interior design, luxury apartment in Manhattan, minimalist style, large windows, natural light, high-end furniture, designer pieces, marble kitchen island, wooden floors, high ceilings, plants, 8k, detailed textures, architectural visualization"',
          channelId: promptLibraryChannel.id,
          userId: users[3]?.id || demoUsers[3].id,
          likes: 56
        }
      });
      
      await prisma.communityMessage.create({
        data: {
          content: 'This prompt creates amazing exterior night scenes:\n\n"modern villa exterior at night, swimming pool with glowing blue water, architectural lighting, landscape design, palm trees, luxury property, ultra detailed, ambient light, architectural visualization, 8k rendering, landscaping lights, warm interior lights visible through large windows"',
          channelId: promptLibraryChannel.id,
          userId: users[2]?.id || demoUsers[2].id,
          likes: 38,
          attachments: [
            {
              type: 'image',
              url: '/gallery/image3.jpg',
            }
          ]
        }
      });
    }
    
    // Add sample messages to General Questions channel
    if (generalQuestionsChannel) {
      // Create a thread about hardware requirements
      const hardwareThread = await prisma.thread.create({
        data: {
          title: 'Recommended Hardware for Large Projects',
          isPrivate: false
        }
      });
      
      await prisma.communityMessage.create({
        data: {
          content: 'What are the recommended hardware specs for working on large architectural projects with StudioSix?',
          channelId: generalQuestionsChannel.id,
          userId: users[1]?.id || demoUsers[1].id,
          isThread: true,
          threadId: hardwareThread.id,
          likes: 8
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'For large projects, I recommend:\n- CPU: At least 8-core processor (AMD Ryzen 7 or Intel i7/i9)\n- RAM: Minimum 32GB, 64GB recommended\n- GPU: NVIDIA RTX 3070 or better with at least 8GB VRAM\n- Storage: NVMe SSD with at least 1TB\n\nThis configuration handles complex scenes smoothly.',
          threadId: hardwareThread.id,
          userId: users[0]?.id || demoUsers[0].id,
          likes: 12
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'I\'m running on an i9 with 128GB RAM and an RTX 4090, and it handles everything I throw at it. Worth the investment if you work on complex projects daily.',
          threadId: hardwareThread.id,
          userId: users[2]?.id || demoUsers[2].id,
          likes: 6
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'Thanks for the recommendations! Would a MacBook Pro M2 Max with 64GB RAM be sufficient?',
          threadId: hardwareThread.id,
          userId: users[1]?.id || demoUsers[1].id,
          likes: 2
        }
      });
      
      await prisma.threadMessage.create({
        data: {
          content: 'Yes, the M2 Max is excellent. I\'ve been using it for medium-to-large projects with no issues. Just make sure you get the model with 64GB RAM and at least 1TB storage.',
          threadId: hardwareThread.id,
          userId: users[4]?.id || demoUsers[4].id,
          likes: 7
        }
      });
      
      // Regular question about software setup
      await prisma.communityMessage.create({
        data: {
          content: 'Is anyone experiencing lag when working with the new lighting system? Mine seems to stutter on complex scenes.',
          channelId: generalQuestionsChannel.id,
          userId: users[4]?.id || demoUsers[4].id,
          likes: 3
        }
      });
      
      await prisma.communityMessage.create({
        data: {
          content: 'Try turning down the real-time reflection quality in Settings > Rendering > Quality. That helped with performance on my system without noticeable visual differences during editing.',
          channelId: generalQuestionsChannel.id,
          userId: users[0]?.id || demoUsers[0].id,
          likes: 5
        }
      });
    }
    
    console.log('Sample messages seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample messages:', error);
    throw error;
  }
}

main(); 