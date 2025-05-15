import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dynamicConfig } from '../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bannerImage: string | null;
  credits: number;
  createdAt: Date;
  verified: boolean;
};

// Array of available profile icons
const profileIcons = [
  '/profile-icons/Profile-icon-01.svg',
  '/profile-icons/Profile-icon-02.svg',
  '/profile-icons/Profile-icon-03.svg',
  '/profile-icons/Profile-icon-04.svg',
  '/profile-icons/Profile-icon-05.svg',
  '/profile-icons/Profile-icon-06.svg',
  '/profile-icons/Profile-icon-07.svg',
  '/profile-icons/Profile-icon-08.svg',
  '/profile-icons/Profile-icon-09.svg',
  '/profile-icons/Profile-icon-10.svg'
];

// Function to get a consistent profile icon for a user based on their ID
const getProfileIconForUser = (userId: string) => {
  // Use the sum of character codes in userId to create a deterministic index
  const charCodeSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charCodeSum % profileIcons.length;
  return profileIcons[index];
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get users that the current user is not following
    const recommendedProfiles = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bannerImage: true,
        credits: true,
        createdAt: true,
        verified: true
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get follower and following counts for each user
    const profilesWithCounts = await Promise.all(
      recommendedProfiles.map(async (profile: UserProfile) => {
        const [followersCount, followingCount] = await Promise.all([
          prisma.follow.count({
            where: {
              followingId: profile.id
            }
          }),
          prisma.follow.count({
            where: {
              followerId: profile.id
            }
          })
        ]);

        return {
          ...profile,
          followersCount,
          followingCount
        };
      })
    );

    // Format the response
    const formattedProfiles = profilesWithCounts.map(profile => {
      // Get avatar URL - if user has an image use it, otherwise generate a consistent avatar
      const avatarUrl = profile.image 
        ? profile.image 
        : getProfileIconForUser(profile.id);
      
      return {
        id: profile.id,
        name: profile.name || 'Anonymous',
        avatar: avatarUrl,
        level: Math.min(Math.floor(profile.credits / 1000) + 1, 5),
        levelTitle: 'Designer',
        followers: profile.followersCount,
        following: profile.followingCount,
        verified: profile.verified
      };
    });

    return NextResponse.json({ profiles: formattedProfiles });
  } catch (error) {
    console.error('Error fetching recommended profiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 