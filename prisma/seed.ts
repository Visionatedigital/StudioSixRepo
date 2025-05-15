import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Community Categories and Channels
  // Check if categories already exist
  const existingCategories = await prisma.communityCategory.findMany();
  
  if (existingCategories.length === 0) {
    console.log('No community categories found. Creating categories and channels...');

    // Create categories and channels
    const categories = [
      {
        name: 'Announcements',
        description: 'Official announcements and updates about StudioSix',
        order: 1,
        channels: [
          { name: 'Product Updates', description: 'Updates about product features and enhancements', order: 1 },
          { name: 'Release Notes', description: 'Detailed information about new releases', order: 2 },
          { name: 'Event Alerts', description: 'Information about upcoming events and webinars', order: 3 }
        ]
      },
      {
        name: 'Show Your Work',
        description: 'Share your projects and get feedback from the community',
        order: 2,
        channels: [
          { name: 'Renders', description: 'Share your rendered designs and images', order: 1 },
          { name: 'Real Projects', description: 'Share real-world projects you\'ve completed', order: 2 },
          { name: 'Style Tags', description: 'Tag and categorize design styles', order: 3 }
        ]
      },
      {
        name: 'Tips & Workflows',
        description: 'Share and discover useful tips and workflow strategies',
        order: 3,
        channels: [
          { name: 'Prompt Library', description: 'Library of useful AI prompts', order: 1 },
          { name: 'Workflow Ideas', description: 'Share efficient workflow strategies', order: 2 },
          { name: 'StudioSix Hacks', description: 'Tips and tricks for using StudioSix', order: 3 }
        ]
      },
      {
        name: 'Ask the Community',
        description: 'Ask questions and get help from the community',
        order: 4,
        channels: [
          { name: 'General Questions', description: 'General questions about architecture and design', order: 1 },
          { name: 'Software Setup', description: 'Questions about software setup and configuration', order: 2 },
          { name: 'Hardware Support', description: 'Questions about hardware requirements and support', order: 3 }
        ]
      },
      {
        name: 'Bug Reports',
        description: 'Report and track bugs in the platform',
        order: 5,
        channels: [
          { name: 'Report a Bug', description: 'Report bugs and issues you\'ve found', order: 1 },
          { name: 'Known Issues', description: 'List of known issues and their status', order: 2 },
          { name: 'Troubleshooting Tips', description: 'Tips for troubleshooting common issues', order: 3 }
        ]
      },
      {
        name: 'Feature Suggestions',
        description: 'Suggest new features and vote on suggestions',
        order: 6,
        channels: [
          { name: 'Suggest a Feature', description: 'Suggest new features for StudioSix', order: 1 },
          { name: 'In Progress', description: 'Features currently in development', order: 2 },
          { name: 'Under Review', description: 'Feature suggestions under review', order: 3 }
        ]
      }
    ];

    for (const category of categories) {
      const createdCategory = await prisma.communityCategory.create({
        data: {
          name: category.name,
          description: category.description,
          order: category.order,
        },
      });

      console.log(`Created category: ${createdCategory.name}`);

      // Create channels for this category
      for (const channel of category.channels) {
        const createdChannel = await prisma.communityChannel.create({
          data: {
            name: channel.name,
            description: channel.description,
            categoryId: createdCategory.id,
            order: channel.order,
          },
        });
        console.log(`  - Created channel: ${createdChannel.name}`);
      }
    }

    console.log('Community categories and channels created!');
  } else {
    console.log('Community categories already exist, skipping seeding.');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 