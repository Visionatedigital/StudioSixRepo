# StudioSix AI Design Companion

StudioSix is an AI-enhanced architecture platform that combines powerful design tools with artificial intelligence to streamline the creative process. The AI Design Companion is a key feature that provides an infinite canvas with integrated AI capabilities for generating and manipulating design elements.

## Features

### Infinite Canvas
- Smooth panning and zooming with mouse, touchpad, or touch gestures
- Infinite workspace for creative freedom
- Fluid interaction without forced grid snapping

### Drawing Tools
- Freehand sketching with customizable brush settings
- Color palette with multiple color options
- Adjustable stroke width
- Undo/redo support

### Shape and Text Tools
- Add rectangles and other basic shapes
- Insert and edit text elements
- Transform, scale, and rotate any element
- Drag and drop functionality

### AI Integration
- Direct Stable Diffusion integration for image generation
- Customizable generation parameters:
  - Prompt and negative prompt
  - Image dimensions
  - Number of steps
  - CFG scale
  - Sampler selection
- Real-time feedback with notifications

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Stable Diffusion API key

### Environment Setup
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_STABLE_DIFFUSION_API_URL=your_api_url
NEXT_PUBLIC_STABLE_DIFFUSION_API_KEY=your_api_key
```

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Usage
1. Navigate to the AI Design Companion page
2. Use the toolbar to select tools and adjust settings
3. Draw, add shapes, or insert text on the canvas
4. Use the AI generation feature to create images from text prompts
5. Transform and arrange elements as needed

## Technical Stack
- Next.js 13+ with App Router
- React Konva for canvas rendering
- TypeScript for type safety
- Tailwind CSS for styling
- Headless UI for accessible components
- Stable Diffusion API for AI image generation

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
