import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ImageData {
  src: string;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface ImageElement extends BaseElement {
  type: 'upload' | 'generated';
  image: ImageData | string;
}

interface CanvasData {
  id: string;
  name: string;
  elements: (BaseElement | ImageElement)[];
  parentId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    console.log('GET: Retrieving project data:', projectId);

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        canvasData: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Initialize canvasData if it doesn't exist
    let processedCanvasData: CanvasData[] = [];
    
    if (project.canvasData && Array.isArray(project.canvasData)) {
      try {
        console.log('Processing canvas data with', (project.canvasData as any[]).length, 'canvases');
        
        processedCanvasData = (project.canvasData as any[])
          .filter((canvas: any) => canvas && typeof canvas === 'object' && canvas.id)
          .map((canvas: any): CanvasData => {
            // Ensure elements array exists and is valid
            let elements: any[] = [];
            if (Array.isArray(canvas.elements)) {
              elements = canvas.elements
                .filter((element: any) => element && typeof element === 'object' && element.id)
                .map((element: any): BaseElement | ImageElement => {
                  if (element.type === 'upload' || element.type === 'generated') {
                    // Handle image elements
                    let imageData: ImageData;
                    
                    if (element.image) {
                      if (typeof element.image === 'object') {
                        imageData = {
                          src: element.image.src || '',
                          width: element.image.width || element.width || 0,
                          height: element.image.height || element.height || 0,
                          naturalWidth: element.image.naturalWidth || element.naturalWidth,
                          naturalHeight: element.image.naturalHeight || element.naturalHeight
                        };
                      } else if (typeof element.image === 'string') {
                        imageData = {
                          src: element.image,
                          width: element.width || 0,
                          height: element.height || 0,
                          naturalWidth: element.naturalWidth,
                          naturalHeight: element.naturalHeight
                        };
                      } else {
                        // Default empty image
                        imageData = {
                          src: '',
                          width: element.width || 0,
                          height: element.height || 0
                        };
                      }
                    } else {
                      // Default empty image
                      imageData = {
                        src: '',
                        width: element.width || 0,
                        height: element.height || 0
                      };
                    }
                    
                    const imageElement: ImageElement = {
                      ...element,
                      type: element.type,
                      id: element.id,
                      x: element.x || 0,
                      y: element.y || 0,
                      width: element.width || imageData.width || 0,
                      height: element.height || imageData.height || 0,
                      naturalWidth: element.naturalWidth || imageData.naturalWidth,
                      naturalHeight: element.naturalHeight || imageData.naturalHeight,
                      image: imageData
                    };
                    return imageElement;
                  }

                  // Handle other element types
                  return {
                    ...element,
                    id: element.id,
                    type: element.type,
                    x: element.x || 0,
                    y: element.y || 0,
                    width: element.width,
                    height: element.height
                  } as BaseElement;
                });
            }

            return {
              id: canvas.id || 'root',
              name: canvas.name || project.name || 'Root Canvas',
              elements,
              parentId: canvas.parentId
            };
          });

      } catch (error) {
        console.error('Error processing canvas data:', error);
        // If there's an error processing the data, create a default canvas
        processedCanvasData = [{
          id: 'root',
          name: project.name || 'Root Canvas',
          elements: []
        }];
      }
    } else {
      // Create default canvas if no data exists
      processedCanvasData = [{
        id: 'root',
        name: project.name || 'Root Canvas',
        elements: []
      }];
    }

    const normalizedProject = {
      ...project,
      canvasData: processedCanvasData
    };

    console.log('API: Sending project data with', processedCanvasData.length, 'canvases');
    return NextResponse.json(normalizedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await request.json();
    const { name, description, canvasData } = body;

    console.log('PATCH: Received project data update request:', { 
      projectId, 
      name, 
      description, 
      canvasDataLength: Array.isArray(canvasData) ? canvasData.length : 'not an array' 
    });

    // Get the current project data first
    const currentProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        canvasData: true,
        name: true,
        description: true
      }
    });

    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Validate and process canvasData
    let processedCanvasData = canvasData;
    if (Array.isArray(canvasData)) {
      // Remove duplicate canvases and ensure proper structure
      const uniqueCanvases = new Map();
      
      processedCanvasData = canvasData
        .filter(canvas => canvas && typeof canvas === 'object' && canvas.id)
        .map(canvas => {
          // Process elements to ensure they're serializable
          const elements = Array.isArray(canvas.elements) 
            ? canvas.elements
              .filter((element: any) => element && typeof element === 'object' && element.id)
              .map((element: any) => {
                // Create a serializable version of the element
                const serializedElement = { ...element };
                
                // Handle image elements
                if (element.type === 'upload' || element.type === 'generated') {
                  if (element.image) {
                    if (typeof element.image === 'object') {
                      // Ensure image has proper structure
                      serializedElement.image = {
                        src: element.image.src || '',
                        width: element.image.width || element.width || 0,
                        height: element.image.height || element.height || 0,
                        naturalWidth: element.image.naturalWidth || element.naturalWidth,
                        naturalHeight: element.image.naturalHeight || element.naturalHeight
                      };
                    } else if (typeof element.image === 'string') {
                      // If it's a string (URL), convert to proper structure
                      serializedElement.image = {
                        src: element.image,
                        width: element.width || 0,
                        height: element.height || 0,
                        naturalWidth: element.naturalWidth,
                        naturalHeight: element.naturalHeight
                      };
                    }
                  }
                }
                
                // Remove any circular references or complex objects
                delete serializedElement.transformer;
                delete serializedElement.node;
                
                return serializedElement;
              })
            : [];

          // Create normalized canvas object
          const normalizedCanvas = {
            id: canvas.id,
            name: canvas.name || name || 'Untitled Canvas',
            elements,
            parentId: canvas.parentId
          };

          // Only keep the first occurrence of each canvas ID
          if (!uniqueCanvases.has(canvas.id)) {
            uniqueCanvases.set(canvas.id, normalizedCanvas);
          }

          return normalizedCanvas;
        })
        .filter(canvas => canvas && uniqueCanvases.get(canvas.id) === canvas);

      // If the new canvas data is empty but the current one has data, preserve the current data
      const currentCanvasData = currentProject.canvasData as any[];
      if ((processedCanvasData.length === 0 || 
          (processedCanvasData.length === 1 && processedCanvasData[0]?.elements?.length === 0)) && 
          Array.isArray(currentCanvasData) && 
          currentCanvasData.length > 0) {
        console.log('Preserving existing canvas data as new data is empty');
        processedCanvasData = currentCanvasData;
      }
    }

    // If no valid canvasData, create a default one
    if (!processedCanvasData || !Array.isArray(processedCanvasData) || processedCanvasData.length === 0) {
      processedCanvasData = [{
        id: 'root',
        name: name || currentProject.name || 'Root Canvas',
        elements: []
      }];
    }

    // Use the current values if new ones aren't provided
    const updatedName = name || currentProject.name;
    const updatedDescription = description !== undefined ? description : currentProject.description;

    const project = await prisma.project.update({
      where: {
        id: projectId,
        userId: session.user.id
      },
      data: {
        name: updatedName,
        description: updatedDescription,
        canvasData: processedCanvasData,
        updatedAt: new Date()
      }
    });

    console.log('API: Updated project data successfully');
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = await params.id;
    console.log('DELETE: Deleting project:', projectId);

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        messages: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // First delete all associated chat messages
    await prisma.chatMessage.deleteMany({
      where: {
        projectId: projectId
      }
    });

    // Then delete the project
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('DELETE: Error deleting project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 