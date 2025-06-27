# ChatGPT Automation Setup Guide

This guide explains how to set up and use the ChatGPT automation feature for image generation.

## Overview

The ChatGPT automation uses Puppeteer to interact with ChatGPT's web interface, allowing you to access the full image generation capabilities that aren't available in the OpenAI API yet.

## Prerequisites

1. **Puppeteer is already installed** in your project
2. **A ChatGPT account** with access to image generation
3. **Environment setup** for browser automation

## Setup Options

### Option 1: Manual Login (Recommended for Development)

1. **Set headless mode to false** for the first run:
   ```typescript
   browser = await puppeteer.launch({
     headless: false, // Set to false for manual login
     args: ['--no-sandbox', '--disable-setuid-sandbox']
   });
   ```

2. **Run the automation** and manually log in when the browser opens
3. **Switch back to headless mode** after successful login

### Option 2: Automated Login (Production)

1. **Add environment variables** for ChatGPT credentials:
   ```env
   CHATGPT_EMAIL=your-email@example.com
   CHATGPT_PASSWORD=your-password
   ```

2. **Update the automation code** to use credentials:
   ```typescript
   if (process.env.CHATGPT_EMAIL && process.env.CHATGPT_PASSWORD) {
     await page.type('input[name="username"]', process.env.CHATGPT_EMAIL);
     await page.click('button[type="submit"]');
     await page.waitForTimeout(2000);
     
     await page.type('input[name="password"]', process.env.CHATGPT_PASSWORD);
     await page.click('button[type="submit"]');
     await page.waitForTimeout(5000);
   }
   ```

## Usage

### API Endpoint

The automation is available at: `/api/generate/chatgpt`

### Request Format

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "prompt": "Transform this sketch into a photorealistic architectural render"
}
```

### Response Format

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## How It Works

1. **Image Processing**: Converts base64 image to temporary file
2. **Browser Launch**: Opens headless Chrome browser
3. **ChatGPT Navigation**: Navigates to ChatGPT web interface
4. **Authentication**: Handles login (manual or automated)
5. **Image Upload**: Uploads the sketch to ChatGPT
6. **Prompt Submission**: Sends the transformation prompt
7. **Response Extraction**: Waits for and downloads the generated image
8. **Cleanup**: Removes temporary files and closes browser

## Advantages

- ✅ **Full ChatGPT capabilities** - Access to all image generation features
- ✅ **Sketch-to-image conversion** - Direct upload and processing
- ✅ **Real-time interaction** - Uses the same interface as ChatGPT
- ✅ **No API limitations** - Bypasses current API restrictions

## Limitations

- ⚠️ **Slower than API** - Browser automation takes longer
- ⚠️ **Authentication required** - Needs ChatGPT login
- ⚠️ **Resource intensive** - Requires browser instance
- ⚠️ **Fragile to UI changes** - May break if ChatGPT interface changes

## Troubleshooting

### Common Issues

1. **"Login required" error**
   - Set `headless: false` and log in manually
   - Or configure environment variables for automated login

2. **"No generated image found" error**
   - Check if ChatGPT has image generation access
   - Verify the prompt is appropriate for image generation
   - Increase timeout values if needed

3. **Browser launch failures**
   - Ensure system has Chrome/Chromium installed
   - Check for sufficient system resources
   - Verify Puppeteer installation

### Debug Mode

Enable debug logging by setting:
```typescript
console.log('Debug info:', await page.content());
```

## Security Considerations

- **Never commit credentials** to version control
- **Use environment variables** for sensitive data
- **Limit access** to the automation endpoint
- **Monitor usage** to prevent abuse

## Performance Optimization

- **Reuse browser instances** for multiple requests
- **Implement caching** for repeated prompts
- **Use connection pooling** for high traffic
- **Monitor memory usage** and restart browser periodically 