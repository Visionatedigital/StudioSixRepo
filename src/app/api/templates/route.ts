import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, canvasData, type, isDefault } = body;

    // If setting as default, unset other defaults of the same type
    if (isDefault) {
      await prisma.template.updateMany({
        where: {
          type,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        canvasData,
        type,
        isDefault
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 