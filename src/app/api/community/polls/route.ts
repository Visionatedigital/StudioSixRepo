import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dynamicConfig } from '../../config';

export const dynamic = dynamicConfig.dynamic;
export const revalidate = dynamicConfig.revalidate;

// GET /api/community/polls/:id - Get a specific poll with votes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the poll ID from the URL
    const { searchParams } = new URL(req.url);
    const pollId = searchParams.get('pollId');
    
    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the poll with votes
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          select: {
            id: true,
            channelId: true,
          },
        },
      },
    });
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }
    
    // Get user's vote if exists
    const userVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: session.user.id,
        },
      },
    });
    
    // Return the poll with user's vote status
    return NextResponse.json({
      poll,
      userVote,
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

// POST /api/community/polls/vote - Vote on a poll
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { pollId, options } = await req.json();
    
    // Validate input
    if (!pollId || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: 'Poll ID and at least one option are required' },
        { status: 400 }
      );
    }
    
    // Get the poll to check if it exists and if multiple votes are allowed
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }
    
    // Check if poll has expired
    if (new Date() > new Date(poll.expiresAt)) {
      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      );
    }
    
    // Check if options are valid
    const pollOptions = poll.options as string[];
    const validOptions = options.filter(option => pollOptions.includes(option));
    
    if (validOptions.length === 0) {
      return NextResponse.json(
        { error: 'No valid options provided' },
        { status: 400 }
      );
    }
    
    // Check if multiple votes are allowed
    if (!poll.allowMultiple && validOptions.length > 1) {
      return NextResponse.json(
        { error: 'This poll only allows one vote per user' },
        { status: 400 }
      );
    }
    
    // Check if user has already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: session.user.id,
        },
      },
    });
    
    let vote;
    
    if (existingVote) {
      // Update existing vote
      vote = await prisma.pollVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          options: validOptions,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Create new vote
      vote = await prisma.pollVote.create({
        data: {
          pollId,
          userId: session.user.id,
          options: validOptions,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }
    
    // Get updated poll with votes
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        votes: true,
      },
    });
    
    // Return the vote and updated poll
    return NextResponse.json({
      vote,
      poll: updatedPoll,
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    );
  }
} 