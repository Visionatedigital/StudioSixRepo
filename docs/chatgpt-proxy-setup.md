# ChatGPT Proxy Setup

This document explains how to use the ChatGPT proxy feature that allows you to interact with ChatGPT directly from your StudioSix application.

## Overview

The ChatGPT proxy creates a browser automation session that:
1. Opens ChatGPT in a headless browser
2. Handles authentication automatically
3. Provides a clean UI to send messages and receive responses
4. Maintains conversation context across sessions

## Features

- ✅ **Direct ChatGPT Access** - Uses the actual ChatGPT web interface
- ✅ **Automatic Authentication** - Handles login automatically
- ✅ **Session Management** - Maintains browser sessions with timeout
- ✅ **Fallback Support** - Falls back to existing AI chat if ChatGPT fails
- ✅ **Clean UI** - Simple, intuitive interface for chatting

## How to Use

### 1. Access the ChatGPT Proxy

Navigate to the ChatGPT Proxy page:
- Go to your dashboard
- Click on "AI Tools" in the sidebar
- Click on "ChatGPT Proxy"

### 2. Connect to ChatGPT

1. Click the "Connect to ChatGPT" button
2. The system will automatically:
   - Launch a headless browser
   - Navigate to ChatGPT
   - Handle authentication
   - Create a new chat session

### 3. Start Chatting

Once connected:
1. Type your message in the input field
2. Press Enter or click "Send"
3. Wait for ChatGPT's response
4. Continue the conversation

## Technical Details

### Architecture

```
Frontend (React) → API Routes → Session Manager → Puppeteer → ChatGPT
```

### Components

- **`/chatgpt-proxy/page.tsx`** - Main UI component
- **`/api/chatgpt-proxy/connect/route.ts`** - Connection endpoint
- **`/api/chatgpt-proxy/message/route.ts`** - Message handling endpoint
- **`/lib/chatgpt-session.ts`** - Session management

### Session Management

- **Singleton Pattern** - One session manager instance
- **Auto Timeout** - Sessions expire after 30 minutes of inactivity
- **Error Recovery** - Automatic cleanup on errors
- **Process Cleanup** - Proper browser cleanup on server shutdown

### Authentication

The system uses hardcoded credentials for automation:
- Email: `visionatedigital@gmail.com`
- Password: `Ombre1sulgiallo!`

**Note**: In production, consider using environment variables for credentials.

## Error Handling

### Common Issues

1. **Connection Failed**
   - Check if ChatGPT is accessible
   - Verify credentials are correct
   - Check browser automation setup

2. **Login Failed**
   - Screenshots are saved to `/tmp/` for debugging
   - Check for CAPTCHA or security prompts
   - Verify account status

3. **Message Timeout**
   - ChatGPT may be slow to respond
   - Check network connectivity
   - Try reconnecting

### Fallback System

If ChatGPT automation fails, the system falls back to:
1. Existing AI chat endpoint (`/api/ai-chat`)
2. Generic error message

## Security Considerations

- **Credentials** - Store in environment variables
- **Session Isolation** - Each user gets their own session
- **Timeout** - Automatic session cleanup
- **Error Logging** - Screenshots for debugging only

## Performance

- **Headless Browser** - Minimal resource usage
- **Session Reuse** - Maintains connection across requests
- **Timeout Management** - Prevents resource leaks
- **Error Recovery** - Automatic cleanup

## Troubleshooting

### Development

1. **Check Logs** - Look for `[CHATGPT-SESSION]` and `[CHATGPT-PROXY]` logs
2. **Screenshots** - Check `/tmp/` for error screenshots
3. **Browser Issues** - Ensure Puppeteer is properly installed

### Production

1. **Environment** - Ensure headless browser can run
2. **Memory** - Monitor browser memory usage
3. **Network** - Check ChatGPT accessibility
4. **Credentials** - Verify authentication works

## Future Enhancements

- [ ] **Thread Management** - Save and load conversation threads
- [ ] **File Upload** - Support for image and document uploads
- [ ] **Streaming** - Real-time response streaming
- [ ] **Multi-User** - Support for multiple concurrent users
- [ ] **API Integration** - Direct OpenAI API integration as alternative

## API Reference

### Connect Endpoint

```http
POST /api/chatgpt-proxy/connect
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to ChatGPT"
}
```

### Message Endpoint

```http
POST /api/chatgpt-proxy/message
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking...",
  "success": true
}
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Check error screenshots in `/tmp/`
4. Contact development team 