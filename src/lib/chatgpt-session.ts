import { Browser, Page, ConsoleMessage, HTTPRequest, Frame, HTTPResponse } from 'puppeteer-core';
import { launchBrowser } from './puppeteer-utils';
import fs from 'fs';
import puppeteer from 'puppeteer';

declare global {
  interface Window {
    chrome?: any;
  }
}

interface ChatGPTSession {
  browser: any;
  page: any;
  isConnected: boolean;
  lastActivity: Date;
}

export class ChatGPTSessionManager {
  private static instance: ChatGPTSessionManager;
  private session: ChatGPTSession | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes (reduced from 30)
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds
  private page: any | null = null;
  private browser: any | null = null;
  private cookies: any[] = [];
  private cookiesPath: string = '/tmp/chatgpt-cookies.json';
  private reconnectEndpoint: string | null = null; // Store reconnect endpoint

  private constructor() {}

  public static getInstance(): ChatGPTSessionManager {
    if (!ChatGPTSessionManager.instance) {
      ChatGPTSessionManager.instance = new ChatGPTSessionManager();
    }
    return ChatGPTSessionManager.instance;
  }

  public async getSession(): Promise<ChatGPTSession | null> {
    if (this.session && this.session.isConnected) {
      // Update last activity
      this.session.lastActivity = new Date();
      this.resetSessionTimeout();
      return this.session;
    }
    
    // Try to reconnect if we have a reconnect endpoint
    if (this.reconnectEndpoint) {
      console.log('[CHATGPT-SESSION] Session not available, attempting reconnect...');
      const reconnectedSession = await this.reconnectSession();
      if (reconnectedSession) {
        return reconnectedSession;
      }
    }
    
    return null;
  }

  public async createSession(): Promise<ChatGPTSession> {
    console.log('[CHATGPT-SESSION] Creating new session...');

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`[CHATGPT-SESSION] Attempt ${attempt}/${this.MAX_RETRIES}`);
        
        // Launch browser with timeout
        const { browser, page } = await Promise.race([
          launchBrowser(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Browser launch timeout')), 60000)
          )
        ]) as any;

        this.browser = browser;
        this.page = page;

        // Block detection scripts
        // Handle both Puppeteer and Playwright page objects
      if (typeof page.setRequestInterception === 'function') {
        await page.setRequestInterception(true);
      } else if (typeof page.route === 'function') {
        // Playwright equivalent - intercept all requests
        await page.route('**/*', (route: any) => route.continue());
      }
        page.on('request', async (request: HTTPRequest) => {
          const url = request.url();
          if (
            url.includes('jsd/main.js') || // Block Cloudflare detection
            url.includes('challenge-platform') || // Block Cloudflare challenges
            url.includes('cloudflare') || // Block other Cloudflare scripts
            url.includes('analytics') || // Block analytics
            url.includes('tracking') // Block tracking
          ) {
            await request.abort();
          } else {
            await request.continue();
          }
        });

        // Set minimal headers
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        // Navigate to ChatGPT
        console.log('[CHATGPT-SESSION] Navigating to ChatGPT...');
        try {
          await Promise.race([
            page.goto('https://chat.openai.com/', {
              waitUntil: 'networkidle0',
              timeout: 60000
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Navigation timeout')), 65000)
            )
          ]);
        } catch (navError) {
          console.error('[CHATGPT-SESSION] Navigation error:', navError);
          const currentUrl = await page.url();
          console.log('[CHATGPT-SESSION] Current URL:', currentUrl);
          if (!currentUrl.includes('openai.com')) {
            throw navError;
          }
        }

        // Check for and handle Cloudflare challenge first
        const currentUrl = await page.url();
        console.log('[CHATGPT-SESSION] Current URL after navigation:', currentUrl);
        
        if (currentUrl.includes('__cf_chl_rt_tk') || currentUrl.includes('__cf_chl_tk')) {
          console.log('[CHATGPT-SESSION] Cloudflare challenge detected in URL');
          await this.handleCloudflareChallenge();
        }
        
        // Try session token injection
        const tokenInjected = await this.injectSessionToken();
        
        if (tokenInjected) {
          // Reload the page to apply the session token
          console.log('[CHATGPT-SESSION] Reloading page after token injection...');
          await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
        } else {
          // Fallback to cookies if no session token
          console.log('[CHATGPT-SESSION] No session token, trying cookies...');
          await this.loadCookies();
        }

        // Wait for chat interface with better detection
        let chatInterface = false;
        for (let i = 0; i < 5; i++) {
          try {
            console.log(`[CHATGPT-SESSION] Checking for chat interface (attempt ${i + 1}/5)...`);
            
            // Enhanced chat interface detection
            const interfaceCheck = await page.evaluate(() => {
              // More comprehensive selectors for ChatGPT interface
              const inputSelectors = [
                'textarea[data-testid="prompt-textarea"]',
                'textarea[data-id="root"]',
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Send a message"]',
                'div[contenteditable="true"][data-testid="prompt-textarea"]',
                'div[contenteditable="true"]',
                '#prompt-textarea'
              ];
              
              const interfaceSelectors = [
                'div[data-testid="conversation-turn-"]',
                'div.text-base',
                'button[aria-label*="New chat"]',
                'nav',
                'main',
                '[class*="chat"]',
                '[id*="chat"]'
              ];
              
              const foundInputs = inputSelectors.filter(selector => 
                document.querySelector(selector) !== null
              );
              
              const foundInterface = interfaceSelectors.filter(selector => 
                document.querySelector(selector) !== null
              );
              
              const hasAnyInputs = foundInputs.length > 0;
              const hasInterface = foundInterface.length > 0;
              const hasContent = document.body.textContent && document.body.textContent.length > 100;
              
              return {
                hasInputs: hasAnyInputs,
                hasInterface: hasInterface,
                hasContent: hasContent,
                foundInputs: foundInputs,
                foundInterface: foundInterface,
                url: window.location.href,
                title: document.title,
                bodyLength: document.body.textContent?.length || 0
              };
            });
            
            console.log('[CHATGPT-SESSION] Interface check results:', JSON.stringify(interfaceCheck, null, 2));
            
            // Consider chat interface found if we have inputs OR interface elements
            chatInterface = interfaceCheck.hasInputs || interfaceCheck.hasInterface;

            if (chatInterface) {
              console.log('[CHATGPT-SESSION] ✅ Chat interface found');
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (e) {
            console.error('[CHATGPT-SESSION] Error checking chat interface:', e);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // If chat interface not found, try automated login
        if (!chatInterface) {
          console.log('[CHATGPT-SESSION] Chat interface not found, attempting automated login...');
          const loginSuccessful = await this.performAutomatedLogin();
          
          if (loginSuccessful) {
            // Wait a bit more for the interface to load after login
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check again for chat interface with enhanced detection
            const postLoginCheck = await page.evaluate(() => {
              const inputSelectors = [
                'textarea[data-testid="prompt-textarea"]',
                'textarea[data-id="root"]',
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="Send a message"]',
                'div[contenteditable="true"][data-testid="prompt-textarea"]',
                'div[contenteditable="true"]',
                '#prompt-textarea'
              ];
              
              const interfaceSelectors = [
                'div[data-testid="conversation-turn-"]',
                'div.text-base',
                'button[aria-label*="New chat"]',
                'nav',
                'main',
                '[class*="chat"]',
                '[id*="chat"]'
              ];
              
              const foundInputs = inputSelectors.filter(selector => 
                document.querySelector(selector) !== null
              );
              
              const foundInterface = interfaceSelectors.filter(selector => 
                document.querySelector(selector) !== null
              );
              
              return {
                hasInputs: foundInputs.length > 0,
                hasInterface: foundInterface.length > 0,
                foundInputs: foundInputs,
                foundInterface: foundInterface
              };
            });
            
            console.log('[CHATGPT-SESSION] Post-login interface check:', JSON.stringify(postLoginCheck, null, 2));
            chatInterface = postLoginCheck.hasInputs || postLoginCheck.hasInterface;
          }
        }

        if (!chatInterface) {
          throw new Error('Chat interface not found after login attempts');
        }

        console.log('[CHATGPT-SESSION] ✅ Chat interface found - Session ready');
        
        // Set up session
        await this.setupSession();

        // Create and return session
        const session: ChatGPTSession = {
          browser: this.browser,
          page: this.page,
          isConnected: true,
          lastActivity: new Date()
        };

        this.session = session;
        this.resetSessionTimeout();

        console.log('[CHATGPT-SESSION] ✅ Session created and ready for use');
        return session;

      } catch (error) {
        console.error(`[CHATGPT-SESSION] Attempt ${attempt} failed:`, error);
        lastError = error as Error;

        // Close the current browser session if it exists
        if (this.browser) {
          await this.browser.close().catch(console.error);
          this.browser = null;
          this.page = null;
        }

        // Wait before retrying
        if (attempt < this.MAX_RETRIES) {
          console.log(`[CHATGPT-SESSION] Waiting ${this.RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    throw lastError || new Error('Failed to create session after all retries');
  }

  // Simplified session setup - no reconnect needed for self-hosted Chrome
  private async setupSession() {
    try {
      console.log('[CHATGPT-SESSION] Session setup complete');
      // Store endpoint for potential reconnection (optional)
      this.reconnectEndpoint = this.browser.wsEndpoint();
    } catch (error) {
      console.error('[CHATGPT-SESSION] Failed to set up session:', error);
    }
  }

  // Simplified reconnect for self-hosted Chrome
  public async reconnectSession(): Promise<ChatGPTSession | null> {
    console.log('[CHATGPT-SESSION] Reconnect not needed for self-hosted Chrome');
    return null;
  }

  private async handleCloudflareChallenge() {
    try {
      // Wait for initial page load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get current URL
      const currentUrl = await this.page.url();

      // Check if we're on a Cloudflare challenge page using multiple methods
      const urlHasChallenge = currentUrl.includes('__cf_chl_rt_tk') || 
                              currentUrl.includes('__cf_chl_tk') || 
                              currentUrl.includes('cf_challenge');
      
      const isChallengePresent = await this.page.evaluate(() => {
        const title = document.title || '';
        const body = document.body.textContent || '';
        return {
          isCloudflare: title.includes('Cloudflare') || 
                        body.includes('Checking if the site connection is secure') ||
                        body.includes('Please wait while we verify your browser') ||
                        body.includes('Just a moment') ||
                        body.includes('DDoS protection'),
          title: title,
          bodyPreview: body.substring(0, 200)
        };
      }).catch(() => ({ isCloudflare: false, title: '', bodyPreview: '' }));

      const hasChallenge = urlHasChallenge || isChallengePresent.isCloudflare;

      if (hasChallenge) {
        console.log('[CHATGPT-SESSION] Detected Cloudflare challenge');
        console.log('[CHATGPT-SESSION] Challenge detected via URL:', urlHasChallenge);
        console.log('[CHATGPT-SESSION] Challenge detected via content:', isChallengePresent.isCloudflare);
        console.log('[CHATGPT-SESSION] Current URL:', currentUrl);
        console.log('[CHATGPT-SESSION] Page title:', isChallengePresent.title);
        console.log('[CHATGPT-SESSION] Body preview:', isChallengePresent.bodyPreview);
        
        // Take screenshot before challenge
        await this.takeDebugScreenshot('cloudflare-challenge');
        
        // Wait for the challenge to complete with improved detection
        let challengeComplete = false;
        const startTime = Date.now();
        const timeout = 90000; // Increased to 90 seconds
        
        console.log('[CHATGPT-SESSION] Waiting for Cloudflare challenge to complete...');

        while (!challengeComplete && Date.now() - startTime < timeout) {
          try {
            // Handle frame detachment by refreshing page reference if needed
            if (!this.page || this.page._detached) {
              console.log('[CHATGPT-SESSION] Page detached, attempting to get fresh reference...');
              
              // Get all pages from browser
              const pages = await this.browser.pages();
              if (pages.length > 0) {
                this.page = pages[pages.length - 1]; // Use latest page
                console.log('[CHATGPT-SESSION] Got fresh page reference');
              } else {
                throw new Error('No pages available in browser');
              }
            }

            // Check multiple indicators of challenge completion with robust error handling
            const pageStatus = await this.page.evaluate(() => {
              try {
                const url = window.location.href;
                const title = document.title || '';
                const body = document.body?.textContent || '';
                
                // Challenge completion indicators
                const urlClean = !url.includes('__cf_chl_rt_tk') && 
                                !url.includes('__cf_chl_tk') && 
                                !url.includes('cf_challenge');
                
                const titleNormal = !title.includes('Cloudflare') && 
                                   title !== '' && 
                                   !title.includes('Just a moment');
                                   
                const bodyNormal = !body.includes('Checking if the site connection is secure') &&
                                  !body.includes('Please wait while we verify') &&
                                  !body.includes('Just a moment') &&
                                  !body.includes('Enable JavaScript and cookies') &&
                                  body.length > 1000; // Proper page should have substantial content
                
                return {
                  url,
                  title,
                  bodyLength: body.length,
                  urlClean,
                  titleNormal,
                  bodyNormal,
                  allClear: urlClean && titleNormal && bodyNormal
                };
              } catch (innerError) {
                console.log('Inner evaluation error:', innerError);
                return {
                  url: 'error',
                  title: 'error', 
                  bodyLength: 0,
                  urlClean: false,
                  titleNormal: false,
                  bodyNormal: false,
                  allClear: false
                };
              }
            }).catch(async (evalError: any) => {
              console.log('[CHATGPT-SESSION] Evaluation failed, checking if challenge navigation occurred:', evalError?.message || 'Unknown error');
              
              // If evaluation fails, try a simple URL check as fallback
              try {
                const url = await this.page.url();
                const urlClean = !url.includes('__cf_chl_rt_tk') && 
                                !url.includes('__cf_chl_tk') &&
                                url.includes('chatgpt.com');
                                
                return {
                  url,
                  title: 'unknown',
                  bodyLength: 0,
                  urlClean,
                  titleNormal: false,
                  bodyNormal: false,
                  allClear: urlClean // If URL is clean, challenge might be done
                };
                             } catch (urlError: any) {
                 console.log('[CHATGPT-SESSION] Even URL check failed:', urlError?.message || 'Unknown error');
                return {
                  url: 'error',
                  title: 'error',
                  bodyLength: 0,
                  urlClean: false,
                  titleNormal: false,
                  bodyNormal: false,
                  allClear: false
                };
              }
            });
            
            console.log(`[CHATGPT-SESSION] Challenge check: URL clean=${pageStatus.urlClean}, Title normal=${pageStatus.titleNormal}, Body normal=${pageStatus.bodyNormal}, URL=${pageStatus.url.substring(0, 100)}...`);

            if (pageStatus.allClear) {
              console.log('[CHATGPT-SESSION] ✅ Challenge completed - all indicators clear');
              challengeComplete = true;
                break;
              }

            // If URL is clean, challenge might be complete - do one more comprehensive check
            if (pageStatus.urlClean) {
              console.log('[CHATGPT-SESSION] URL cleared, doing final verification...');
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              try {
                const finalCheck = await this.page.evaluate(() => {
                  const body = document.body?.textContent || '';
                  const hasContent = body.length > 500;
                  const noChallengeText = !body.includes('Enable JavaScript and cookies') &&
                                         !body.includes('Just a moment');
                  return hasContent && noChallengeText;
                });
                
                if (finalCheck) {
                  console.log('[CHATGPT-SESSION] ✅ Challenge completed - final check passed');
                  challengeComplete = true;
                  break;
                }
              } catch (finalError) {
                console.log('[CHATGPT-SESSION] Final check failed, but URL is clean - assuming complete');
                challengeComplete = true;
                break;
              }
            }

            // Wait before next check
            await new Promise(resolve => setTimeout(resolve, 3000));
            
                     } catch (outerError: any) {
             console.log('[CHATGPT-SESSION] Outer challenge check error:', outerError?.message || 'Unknown error');
             
             // If we have repeated errors, try to reload the page
             if ((outerError?.message || '').includes('detached') || (outerError?.message || '').includes('Target closed')) {
              console.log('[CHATGPT-SESSION] Attempting page reload due to detachment...');
              try {
                await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                console.log('[CHATGPT-SESSION] Page reloaded successfully');
                             } catch (reloadError: any) {
                 console.log('[CHATGPT-SESSION] Page reload failed:', reloadError?.message || 'Unknown error');
                // Continue with next iteration
              }
            }
            
            // Wait longer after errors
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }

        if (!challengeComplete) {
          console.log('[CHATGPT-SESSION] ❌ Challenge did not complete within timeout');
          // Take final screenshot for debugging
          await this.takeDebugScreenshot('cloudflare-challenge-timeout');
          throw new Error('Cloudflare challenge timeout');
        }

        console.log('[CHATGPT-SESSION] ✅ Challenge completed, waiting for page to fully load...');
        
        // Wait longer for any post-challenge redirects and full page rendering
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // Take screenshot after challenge
        await this.takeDebugScreenshot('post-cloudflare-challenge');
        
        // Verify we're on the correct page with more detailed checks
        const finalStatus = await this.page.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            bodyLength: document.body?.textContent?.length || 0,
            hasNavigation: !!document.querySelector('nav'),
            hasMainContent: !!document.querySelector('main')
          };
        });
        
        console.log('[CHATGPT-SESSION] Final page status:', finalStatus);
        
        if (!finalStatus.url.includes('chatgpt.com')) {
          throw new Error('Unexpected URL after Cloudflare challenge: ' + finalStatus.url);
        }
        
        if (finalStatus.bodyLength < 1000) {
          console.log('[CHATGPT-SESSION] ⚠️ Page content seems incomplete, but continuing...');
        }
        
        console.log('[CHATGPT-SESSION] ✅ Cloudflare challenge successfully bypassed');
        } else {
        console.log('[CHATGPT-SESSION] No Cloudflare challenge detected');
      }
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error handling Cloudflare challenge:', error);
      throw error;
    }
  }

  private async findInputElement(): Promise<boolean> {
    const selectors = [
      'textarea[data-testid="prompt-textarea"]',
      'textarea[data-id="root"]',
      'textarea.chatgpt-textarea'
    ];

    try {
      // Take screenshot before looking for input
      await this.takeDebugScreenshot('before-input-search');

      // Wait for frames to load and stabilize
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get all frames including the main frame
      const frames = [this.page, ...this.page.frames()];

      for (const selector of selectors) {
        console.log(`[CHATGPT-SESSION] Looking for input with selector: ${selector}`);
        
        for (const frame of frames) {
          try {
            // Check if frame is still attached
            if (!frame.isDetached()) {
              // Wait for selector with a reasonable timeout
              await frame.waitForSelector(selector, { timeout: 5000 });
              
              // Verify the element is actually visible and enabled
              const element = await frame.$(selector);
              if (element) {
                const isVisible = await element.isVisible();
                const isEnabled = await element.isEnabled();
                
                if (isVisible && isEnabled) {
                  console.log(`[CHATGPT-SESSION] Found usable input element with selector: ${selector}`);
                  return true;
                }
              }
            }
          } catch (frameError) {
            // Frame-specific errors are expected and can be ignored
            continue;
          }
        }
        
        console.log(`[CHATGPT-SESSION] Selector not found: ${selector}`);
      }

      // Take screenshot if no input found
      await this.takeDebugScreenshot('input-not-found');
      return false;

    } catch (error: unknown) {
      const err = error as Error;
      console.error('[CHATGPT-SESSION] Error finding input element:', err);
      throw err;
    }
  }

  private async takeDebugScreenshot(name: string) {
    try {
      if (!this.page) {
        console.log(`[CHATGPT-SESSION] Cannot take screenshot '${name}': no page available`);
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `/tmp/chatgpt-${name}-${timestamp}.png`;
      
      await this.page.screenshot({ 
        path: filename,
        fullPage: true,
        captureBeyondViewport: true
      });
      
      console.log(`[CHATGPT-SESSION] Saved screenshot: ${filename}`);
      
      // Also save the page content for debugging
      const content = await this.page.content();
      const htmlFilename = `/tmp/chatgpt-${name}-${timestamp}.html`;
      const fs = require('fs');
      fs.writeFileSync(htmlFilename, content);
      console.log(`[CHATGPT-SESSION] Saved HTML content: ${htmlFilename}`);

      } catch (error) {
      console.error(`[CHATGPT-SESSION] Error taking screenshot '${name}':`, error);
    }
  }

  private async selectGPT4Model() {
    try {
      // Wait for model selector button
      const modelButton = await this.page.waitForSelector('button[aria-label="Model switcher"]', {
        visible: true,
        timeout: 10000
      });
      
      if (!modelButton) {
        console.log('[CHATGPT-SESSION] Model selector button not found');
        return;
      }
      
      // Click model selector
      await modelButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot of model selector
      await this.takeDebugScreenshot('model-selector');
      
      // Look for GPT-4 option
      const gpt4Option = await this.page.waitForSelector('div[role="menuitem"]:has-text("GPT-4")', {
        visible: true,
        timeout: 5000
      });
      
      if (!gpt4Option) {
        console.log('[CHATGPT-SESSION] GPT-4 option not found');
        return;
      }
      
      // Click GPT-4 option
      await gpt4Option.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot after selection
      await this.takeDebugScreenshot('gpt4-selected');
      
      console.log('[CHATGPT-SESSION] Selected GPT-4 model');
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error selecting GPT-4 model:', error);
      // Don't throw error, just log it - model selection is optional
    }
  }

  private async getCurrentModel(): Promise<string | null> {
    try {
      // Try multiple selectors for model indicator
      const modelSelectors = [
        'button[aria-label="Model switcher"]',
        '[data-testid="model-switcher"]',
        'button[data-testid*="model"]'
      ];
      
      for (const selector of modelSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, {
            visible: true,
            timeout: 5000
          });
          
          if (element) {
            const text = await this.page.evaluate((el: Element) => el.textContent, element);
            if (text) {
              console.log(`[CHATGPT-SESSION] Current model: ${text}`);
              return text;
            }
          }
    } catch (error) {
          console.log(`[CHATGPT-SESSION] Selector not found: ${selector}`);
        }
      }
      
      // Take screenshot if no model found
      await this.takeDebugScreenshot('no-model-indicator');
      console.log('[CHATGPT-SESSION] Could not determine current model');
      return null;
      
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error getting current model:', error);
      return null;
    }
  }

  public async sendMessage(message: string): Promise<string> {
    return await this.withPage(async (page) => {
      console.log('[CHATGPT-SESSION] Sending message:', message);
      // Type the message
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"]';
      await page.waitForSelector(chatInputSelector, { timeout: 10000, visible: true });
      const textarea = await page.$(chatInputSelector);
      if (!textarea) throw new Error('Chat input not found');
      await textarea.focus();
      await page.evaluate((el: HTMLTextAreaElement) => { el.value = ''; }, textarea); // clear any existing text
      await new Promise(res => setTimeout(res, 100)); // small delay
      await textarea.type(message);
      await page.keyboard.press('Enter');
      // Wait for response
      console.log('[CHATGPT-SESSION] Waiting for response...');
      const responseSelector = 'div.markdown.prose';
      await page.waitForSelector(`${responseSelector}:not(:empty)`, { timeout: 60000 });
      // Give a little extra time for the full response to stream
      await new Promise(resolve => setTimeout(resolve, 3000));
      const responses = await page.$$eval(responseSelector, (elements: Element[]) => {
        return elements.map((el: Element) => el.innerHTML);
      });
      // The last element should be the newest response
      const lastResponse = responses[responses.length - 1];
      if (!lastResponse) {
        throw new Error('Could not find a response from ChatGPT.');
      }
      console.log('[CHATGPT-SESSION] Received response');
      return lastResponse;
    });
  }

  // Helper method to wrap page operations with proper error handling
  private async withPage<T>(operation: (page: Page) => Promise<T>): Promise<T> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    try {
      return await operation(this.page);
    } catch (error) {
      console.log('[CHATGPT-SESSION] Error during operation:', error);
      
      // Check if it's a connection error
      if (error instanceof Error && (
        error.message.includes('Target closed') ||
        error.message.includes('Protocol error') ||
        error.message.includes('Session closed')
      )) {
        console.log('[CHATGPT-SESSION] Connection error detected, attempting to recover...');
        
        // Try to check if page is still accessible
        try {
          await this.page.evaluate(() => document.title);
          console.log('[CHATGPT-SESSION] Page is still accessible, retrying operation...');
          // Wait a moment and retry once
          await new Promise(res => setTimeout(res, 2000));
          return await operation(this.page);
        } catch (retryError) {
          console.log('[CHATGPT-SESSION] Page is not accessible, need to reconnect...');
          throw new Error('Session closed and reconnect failed');
        }
      }
      
      throw error;
    }
  }

  public async sendImagePrompt(prompt: string, imagePath: string): Promise<string> {
    return await this.withPage(async (page) => {
      console.log('[CHATGPT-SESSION] Uploading image and sending prompt...');
      // Collect all current image URLs before sending
      const imageSelector = 'img[src^="https://files.oaiusercontent.com/"]';
      const existingImageUrls: string[] = await page.$$eval(imageSelector, (imgs: any[]) => imgs.map((img: any) => (img as HTMLImageElement).src));

      // Wait for the add files button and click it
      const addButtonSelector = 'button[aria-label*="Add photos and files"], button[aria-label*="Attach files"], button[aria-label*="Upload"], button';
      let addButton = await page.$(addButtonSelector);
      if (!addButton) {
        // Try clicking the "+" button if visible
        const plusButton = await page.$('button:has(svg[data-testid="PlusIcon"])');
        if (plusButton) {
          await plusButton.click();
          await new Promise(res => setTimeout(res, 500));
        }
        addButton = await page.$(addButtonSelector);
      }
      if (!addButton) throw new Error('Could not find add/upload button');
      await addButton.click();
      await new Promise(res => setTimeout(res, 500));
      // Find the file input and upload the image
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) throw new Error('Could not find file input');
      await fileInput.uploadFile(imagePath);
      await new Promise(res => setTimeout(res, 1500)); // Wait for upload
      // Type the prompt
      const chatInputSelector = 'textarea[data-testid="prompt-textarea"], textarea[placeholder="Ask anything"], textarea';
      const textarea = await page.$(chatInputSelector);
      if (!textarea) throw new Error('Chat input not found');
      await textarea.focus();
      await page.evaluate((el: HTMLTextAreaElement) => { el.value = ''; }, textarea);
      await new Promise(res => setTimeout(res, 100));
      await textarea.type(prompt);
      await new Promise(res => setTimeout(res, 300)); // Small delay after typing
      // Try pressing Enter
      await page.keyboard.press('Enter');
      await new Promise(res => setTimeout(res, 1000)); // Wait to see if message is sent
      // If the prompt is still in the textarea, try clicking the Send button
      const promptValue = await page.evaluate((el: HTMLTextAreaElement) => el.value, textarea);
      if (promptValue && promptValue.trim().length > 0) {
        // Try clicking the send button
        const sendButton = await page.$('button[aria-label*="Send"], button:has(svg[data-testid="SendIcon"])');
        if (sendButton) {
          await sendButton.click();
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      // Wait 3 minutes and 20 seconds before starting to poll for the generated image
      console.log('[CHATGPT-SESSION] Waiting 3 minutes and 20 seconds for ChatGPT to start rendering...');
      await new Promise(res => setTimeout(res, 200000));
      console.log('[CHATGPT-SESSION] Starting to poll for the generated image (up to 3 more minutes)...');
      // Scroll to the bottom before polling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // Poll for a new assistant message with an image, up to 3 more minutes
      const pollTimeout = 180000; // 3 minutes
      const pollInterval = 2500; // 2.5 seconds
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      let pollCount = 0;
      while (Date.now() - pollStart < pollTimeout) {
        pollCount++;
        // New logic: find assistant messages by article[data-testid^="conversation-turn-"] with h6 containing 'ChatGPT said:'
        const assistantCount = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.filter(node => {
            const h6 = node.querySelector('h6');
            return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
          }).length
        );
        // Get all assistant articles and look for an image inside each
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        if (assistantImages.length > 0) {
          generatedImageUrl = assistantImages[assistantImages.length - 1];
          console.log(`[CHATGPT-SESSION] New generated image found in assistant article after polling: ${generatedImageUrl}`);
          break;
        }
        await new Promise(res => setTimeout(res, pollInterval));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
      // If no image found after polling, fallback to the last assistant article with an image
      if (!generatedImageUrl) {
        // No image found after polling, try fallback
        // Fallback: look for any generated image
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"] img',
          (imgs: any[]) => imgs.map((img: any) => img.src)
        );
        generatedImageUrl = assistantImages[assistantImages.length - 1] || null;
        
        if (!generatedImageUrl) {
          throw new Error('No generated image found after polling timeout');
        }
      }
      // Download the image and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      // Try to detect mime type from URL (default to jpeg)
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      console.log('[CHATGPT-SESSION] Returning generated image as base64.');
      return `data:${mime};base64,${base64}`;
    });
  }

  public async sendMultipleImagePrompt(prompt: string, imageUrls: string[]) {
    return await this.withPage(async (page) => {
      console.log('[CHATGPT-SESSION] Ensuring chat is open...');
      // Click "New chat" if on home screen or no chat is open
      let newChatClicked = false;
      const links = await page.$$('a');
      for (const link of links) {
        const text = await page.evaluate((el: Element) => el.textContent, link);
        if (text && text.includes('New chat')) {
          console.log('[CHATGPT-SESSION] Clicking New chat link...');
          await link.click();
          await new Promise(res => setTimeout(res, 1500));
          newChatClicked = true;
          break;
        }
      }
      if (!newChatClicked) {
        console.log('[CHATGPT-SESSION] No New chat link found to click.');
      }
      // Wait for new chat to load
      await new Promise(res => setTimeout(res, 1500));

      console.log('[CHATGPT-SESSION] Uploading', imageUrls.length, 'images and sending prompt...');
      
      // Pre-flight check: Ensure page is stable and responsive
      console.log('[CHATGPT-SESSION] Pre-flight check: Testing page stability...');
      try {
        await page.evaluate(() => document.title);
        console.log('[CHATGPT-SESSION] ✅ Page is responsive');
      } catch (checkError) {
        console.error('[CHATGPT-SESSION] ❌ Page appears unstable:', checkError);
        throw new Error('Browser session is unstable - please refresh and try again');
      }
      
            // Download images to temporary files for upload
      const tempImagePaths: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        console.log(`[CHATGPT-SESSION] Downloading image ${i + 1}/${imageUrls.length} to temp file...`);
        try {
          const response = await fetch(imageUrls[i]);
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
          const buffer = await response.arrayBuffer();
          
          // Detect file extension from URL
          const ext = (imageUrls[i].split('.').pop() || '').toLowerCase();
          const fileExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
          
          // Create temp file path
          const tempPath = `/tmp/chatgpt-upload-${Date.now()}-${i}.${fileExt}`;
          
          // Write to temp file
          const fs = await import('fs');
          fs.writeFileSync(tempPath, Buffer.from(buffer));
          tempImagePaths.push(tempPath);
          
          console.log(`[CHATGPT-SESSION] Image ${i + 1} saved to ${tempPath}`);
        } catch (error) {
          console.error(`[CHATGPT-SESSION] Error processing image ${i + 1}:`, error);
          throw error;
        }
      }

      // Upload each image using simple file upload
      for (let i = 0; i < tempImagePaths.length; i++) {
        console.log(`[CHATGPT-SESSION] Uploading image ${i + 1}/${tempImagePaths.length} via file upload...`);
        
        try {
          // Step 1: Click the attach button to initialize the file input
          console.log('[CHATGPT-SESSION] Step 1: Looking for attach button...');
          
          const attachButtonSelectors = [
            'button[aria-label*="Upload"]',
            'button[aria-label*="upload"]',
            'button[aria-label*="Add photos and files"]',
            'button[aria-label*="attach"]',
            'button[aria-label*="file"]'
          ];
          
          let attachButton = null;
          for (const selector of attachButtonSelectors) {
            attachButton = await page.$(selector);
            if (attachButton) {
              console.log(`[CHATGPT-SESSION] Found attach button with selector: ${selector}`);
              break;
            }
          }
          
          if (!attachButton) {
              await page.screenshot({ path: `/tmp/debug-no-attach-button-${i}.png` });
              throw new Error('Could not find attach button');
            }
          
            await attachButton.click();
          console.log('[CHATGPT-SESSION] Clicked attach button');
          
          // Step 2: Wait for the hidden file input to exist in DOM
          console.log('[CHATGPT-SESSION] Step 2: Waiting for file input to appear...');
          await page.waitForSelector('input[type="file"]', { 
            visible: false, 
            timeout: 5000 
          });
          
          const fileInput = await page.$('input[type="file"]');
          if (!fileInput) {
            await page.screenshot({ path: `/tmp/debug-no-file-input-${i}.png` });
            throw new Error('File input not found after clicking attach button');
          }
          
          // Step 3: Upload the temp file directly
          console.log(`[CHATGPT-SESSION] Step 3: Uploading file ${tempImagePaths[i]}...`);
          await fileInput.uploadFile(tempImagePaths[i]);
          
          console.log(`[CHATGPT-SESSION] File uploaded for image ${i + 1}`);
          
          // Step 4: Wait for image preview to appear
          console.log('[CHATGPT-SESSION] Step 4: Waiting for image preview...');
          
          // Take a debug screenshot to see what's happening
          await page.screenshot({ path: `/tmp/debug-waiting-for-preview-${i}.png` });
          
          // Try multiple selectors for image previews
          const previewSelectors = [
            'img[src^="blob:"]',  // Original blob URLs
            'img[src*="cdn.openai.com"]', // ChatGPT CDN images
            'img[alt*="uploaded"]', // Images with alt text
            '[data-testid*="attachment"]', // Attachment components
            '.file-upload-preview img', // Preview containers
            'div[role="img"]', // Div-based images
            'picture img', // Picture elements
            'figure img', // Figure elements
            'img[src*="data:"]' // Base64 data URLs
          ];
          
          let previewFound = false;
          for (const selector of previewSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              console.log(`[CHATGPT-SESSION] Found image preview with selector: ${selector}`);
              previewFound = true;
              break;
          } catch (e) {
              // Continue to next selector
            }
          }
          
          if (!previewFound) {
            // Final debug: check what's actually in the DOM
            console.log('[CHATGPT-SESSION] No preview found with standard selectors, checking DOM...');
            
            const allImages = await page.$$eval('img', (imgs: any[]) => 
              imgs.map(img => ({
                src: img.src?.substring(0, 50) + '...',
                alt: img.alt,
                className: img.className
              }))
            );
            console.log('[CHATGPT-SESSION] All images in DOM:', JSON.stringify(allImages, null, 2));
            
            // Check for any file attachments or upload indicators
            const attachments = await page.$$eval('*[class*="attach"], *[class*="upload"], *[data-testid*="file"], *[data-testid*="attachment"]', 
              (elements: any[]) => elements.map(el => ({
                tag: el.tagName,
                className: el.className,
                testId: el.getAttribute('data-testid'),
                text: el.textContent?.substring(0, 30)
              }))
            );
            console.log('[CHATGPT-SESSION] File attachments found:', JSON.stringify(attachments, null, 2));
            
            // Continue anyway - the upload might have worked even without visible preview
            console.log('[CHATGPT-SESSION] Continuing without preview confirmation...');
          } else {
            console.log('[CHATGPT-SESSION] Image preview confirmed');
          }
          
          // Take screenshot after successful upload
          await page.screenshot({ path: `/tmp/debug-after-upload-${i}.png` });
          
          // Step 5: If more images, wait before next upload
          if (i < tempImagePaths.length - 1) {
            await new Promise(res => setTimeout(res, 1000));
          }
          
          console.log(`[CHATGPT-SESSION] Successfully uploaded image ${i + 1}/${tempImagePaths.length}`);
          
        } catch (error) {
          console.error(`[CHATGPT-SESSION] Error uploading image ${i + 1}:`, error);
          await page.screenshot({ path: `/tmp/debug-upload-error-${i}.png` });
          throw error;
        }
      }

      // Wait for all images to finish uploading and UI to update
      console.log('[CHATGPT-SESSION] Waiting for images to finish uploading...');
      await new Promise(res => setTimeout(res, 2000)); // Reduced since we already wait for each image
      
      // Verify all images are properly attached by checking multiple preview types
      console.log('[CHATGPT-SESSION] Verifying all images are attached...');
      
      const allImagePreviews = await page.$$eval('img[src^="blob:"], img[src*="cdn.openai.com"], img[alt*="uploaded"], [data-testid*="attachment"]', 
        (elements: any[]) => elements.length
      );
      console.log(`[CHATGPT-SESSION] Found ${allImagePreviews} total image previews (expected: ${tempImagePaths.length})`);
      
      if (allImagePreviews < tempImagePaths.length) {
        console.warn(`[CHATGPT-SESSION] Warning: Expected ${tempImagePaths.length} images but only found ${allImagePreviews} previews`);
        // Take a final debug screenshot
        await page.screenshot({ path: '/tmp/debug-final-verification.png' });
      } else {
        console.log('[CHATGPT-SESSION] ✅ All images appear to be attached successfully');
      }

      // Clean up temporary files
      try {
        const fs = await import('fs');
        for (const tempPath of tempImagePaths) {
          fs.unlinkSync(tempPath);
          console.log(`[CHATGPT-SESSION] Cleaned up temp file: ${tempPath}`);
        }
      } catch (cleanupError) {
        console.warn('[CHATGPT-SESSION] Error cleaning up temp files:', cleanupError);
      }

      // Type the prompt
      console.log('[CHATGPT-SESSION] Typing prompt...');
      try {
        // Wait for the input area to be ready
        await new Promise(res => setTimeout(res, 1000));
        
        // Try different input selectors in order of preference
        let input = null;
        const selectors = [
          'div#prompt-textarea[contenteditable="true"]',
          'div.ProseMirror[contenteditable="true"]',
          'textarea[data-testid="prompt-textarea"]',
          '[role="textbox"]'
        ];
        
        for (const selector of selectors) {
          input = await page.$(selector);
          if (input) {
            console.log(`[CHATGPT-SESSION] Found input with selector: ${selector}`);
            break;
          }
        }

        if (!input) {
          console.log('[CHATGPT-SESSION] Could not find input element');
          await page.screenshot({ path: '/tmp/debug-no-input-element.png' });
          throw new Error('Could not find input element');
        }

        // Focus and clear the input
        await input.focus();
        await new Promise(res => setTimeout(res, 300));
        
        // Clear any existing content using keyboard shortcuts
        await page.keyboard.down('Meta');
        await page.keyboard.press('a');
        await page.keyboard.up('Meta');
        await page.keyboard.press('Backspace');
        await new Promise(res => setTimeout(res, 300));
        
        // Type the prompt
        console.log('[CHATGPT-SESSION] Typing prompt text...');
        await page.keyboard.type(prompt);
        await new Promise(res => setTimeout(res, 2000)); // Increased wait time

        // Step 5: Wait for send button to become enabled (final step from ChatGPT's flow)
        console.log('[CHATGPT-SESSION] Step 5: Waiting for send button to become enabled...');
        
        try {
          await page.waitForFunction(() => {
            const sendBtn = document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement;
          return sendBtn && !sendBtn.disabled;
        }, { timeout: 15000 });
        
        console.log('[CHATGPT-SESSION] Send button is now enabled!');
        
        // Now find and click the send button
        const sendButton = await page.$('button[data-testid="send-button"]:not([disabled])');
        if (sendButton) {
          console.log('[CHATGPT-SESSION] Clicking enabled send button...');
          await sendButton.click();
        await new Promise(res => setTimeout(res, 1000));
        } else {
          console.log('[CHATGPT-SESSION] Send button became enabled but not found, trying alternative selectors...');
          
          const altSendSelectors = [
            'button[aria-label="Send message"]:not([disabled])',
            'button[data-testid="fruitjuice-send-button"]:not([disabled])',
            'button[aria-label*="Send"]:not([disabled])'
          ];
          
          let altSendButton = null;
          for (const selector of altSendSelectors) {
            altSendButton = await page.$(selector);
            if (altSendButton) {
              console.log(`[CHATGPT-SESSION] Found send button with selector: ${selector}`);
              await altSendButton.click();
              break;
            }
          }
          
          if (!altSendButton) {
            console.log('[CHATGPT-SESSION] Could not find send button, trying Enter key...');
        await page.keyboard.press('Enter');
          }
        }
        
        // Wait for the message to appear in the chat
        console.log('[CHATGPT-SESSION] Waiting for message to appear in chat...');
        const promptText = prompt.trim();
        try {
          await page.waitForFunction((promptText: string) => {
            return Array.from(document.querySelectorAll('div[data-message-author-role="user"]'))
              .some(el => el.textContent && el.textContent.trim().includes(promptText));
          }, { timeout: 15000 }, promptText);
          console.log('[CHATGPT-SESSION] Message sent and visible in chat');
        } catch (messageError) {
          console.error('[CHATGPT-SESSION] Message did not appear in chat:', messageError);
          await page.screenshot({ path: '/tmp/debug-message-wait-failed.png' });
          console.log('[CHATGPT-SESSION] Screenshot saved: /tmp/debug-message-wait-failed.png');
          
          // Try alternative message detection
          const userMessages = await this.page.$$eval('[data-message-author-role="user"]', 
            (els: any[]) => els.map(el => el.textContent?.trim())
          );
          console.log('[CHATGPT-SESSION] Found user messages:', userMessages);
          
          // Check if message was actually sent by looking for any recent user message
          if (userMessages.length > 0) {
            console.log('[CHATGPT-SESSION] Message appears to have been sent, continuing...');
          } else {
            throw messageError;
          }
      }

        } catch (frameError: any) {
          console.error('[CHATGPT-SESSION] Frame detachment or send button error:', frameError);
          
          // Check if it's a frame detachment error
          if (frameError?.message?.includes('frame got detached') || frameError?.message?.includes('detached')) {
            console.log('[CHATGPT-SESSION] Browser frame detached - attempting recovery...');
            
            // Take a screenshot to see current state
            try {
              await page.screenshot({ path: '/tmp/debug-frame-detached.png' });
            } catch (screenshotError) {
              console.log('[CHATGPT-SESSION] Could not take screenshot after frame detachment');
            }
            
            // Try to continue anyway - maybe the message was sent before detachment
            console.log('[CHATGPT-SESSION] Attempting to continue despite frame detachment...');
            throw new Error('Browser session lost - please try again');
          } else {
            // For other send button errors, try Enter key as fallback
            console.log('[CHATGPT-SESSION] Send button error, trying Enter key fallback...');
            try {
              await page.keyboard.press('Enter');
              await new Promise(res => setTimeout(res, 2000));
            } catch (enterError) {
              console.error('[CHATGPT-SESSION] Enter key fallback also failed:', enterError);
              throw frameError; // Re-throw original error
            }
          }
      }

    } catch (error) {
        console.log('[CHATGPT-SESSION] Error sending prompt:', error);
      throw error;
    }

      // No cleanup needed since we're using base64 data instead of temp files

      console.log('[CHATGPT-SESSION] Waiting 3 minutes and 20 seconds for ChatGPT to start rendering...');
      await new Promise(res => setTimeout(res, 200000));
      console.log('[CHATGPT-SESSION] Starting to poll for the generated image (up to 3 more minutes)...');
      
      // Scroll to the bottom before polling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Poll for a new assistant message with an image, up to 3 more minutes
      const pollTimeout = 180000; // 3 minutes
      const pollInterval = 2500; // 2.5 seconds
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      let pollCount = 0;
      
      while (Date.now() - pollStart < pollTimeout) {
        pollCount++;
        
        // Get all assistant articles and look for an image inside each
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => {
              const img = node.querySelector('img[src^="https://files.oaiusercontent.com/"]');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        
        if (assistantImages.length > 0) {
          generatedImageUrl = assistantImages[assistantImages.length - 1];
          console.log(`[CHATGPT-SESSION] Generated image found: ${generatedImageUrl}`);
          break;
        }
        
        await new Promise(res => setTimeout(res, pollInterval));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
      
      // If no image found after polling, try fallback
      if (!generatedImageUrl) {
        // Fallback: look for any generated image
        const assistantImages: string[] = await page.$$eval(
          'article[data-testid^="conversation-turn-"] img',
          (imgs: any[]) => imgs.map((img: any) => img.src)
        );
        generatedImageUrl = assistantImages[assistantImages.length - 1] || null;
        
        if (!generatedImageUrl) {
          throw new Error('No generated image found after polling timeout');
        }
      }
      
      // Download the image and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Try to detect mime type from URL (default to jpeg)
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      
      console.log('[CHATGPT-SESSION] Returning generated image as base64.');
      return `data:${mime};base64,${base64}`;
    });
  }

  public async closeSession(): Promise<void> {
    if (this.session) {
      console.log('[CHATGPT-SESSION] Closing session...');
      try {
        // Save cookies before closing if page is still available
        if (this.page && !this.page.isClosed()) {
          try {
          const cookies = await this.page.cookies();
          fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
          console.log('[CHATGPT-SESSION] Saved cookies before closing');
          } catch (cookieError) {
            console.error('[CHATGPT-SESSION] Error saving cookies:', cookieError);
          }
        }
        
        // Close browser if still available
        if (this.browser && !this.browser.isConnected()) {
        await this.session.browser.close();
        console.log('[CHATGPT-SESSION] Browser closed');
        }
      } catch (error) {
        console.error('[CHATGPT-SESSION] Error during session cleanup:', error);
      } finally {
        this.session = null;
        this.browser = null;
        this.page = null;
        this.reconnectEndpoint = null; // Clear reconnect endpoint
        
        if (this.sessionTimeout) {
          clearTimeout(this.sessionTimeout);
          this.sessionTimeout = null;
        }
        
        console.log('[CHATGPT-SESSION] Session cleanup complete');
      }
    }
  }

  private resetSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    this.sessionTimeout = setTimeout(async () => {
      console.log('[CHATGPT-SESSION] Session timed out after inactivity');
      try {
        // Try to reconnect first instead of closing
        const reconnectedSession = await this.reconnectSession();
        if (reconnectedSession) {
          console.log('[CHATGPT-SESSION] Successfully reconnected after timeout');
          return;
        }
        
        // If reconnect failed, try to save cookies before closing
        if (this.page && !this.page.isClosed()) {
          try {
          const cookies = await this.page.cookies();
          fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
          console.log('[CHATGPT-SESSION] Saved cookies before session timeout');
          } catch (cookieError) {
            console.error('[CHATGPT-SESSION] Error saving cookies:', cookieError);
          }
        }
        
        await this.closeSession();
      } catch (error) {
        console.error('[CHATGPT-SESSION] Error during session timeout cleanup:', error);
      }
    }, this.SESSION_TIMEOUT);
    
    console.log(`[CHATGPT-SESSION] Session timeout reset to ${this.SESSION_TIMEOUT}ms`);
  }

  public isConnected(): boolean {
    return this.session?.isConnected || false;
  }

  async uploadImagesAndSendPrompt(images: string[], prompt: string) {
    console.log('[CHATGPT-SESSION] Uploading', images.length, 'images and sending prompt...');
    
    try {
      // Upload each image
      for (let i = 0; i < images.length; i++) {
        console.log(`[CHATGPT-SESSION] Uploading image ${i + 1}/${images.length}...`);
        
        try {
          // Look for the attach button
          const attachButton = await this.page.$('button[aria-label*="Attach"], button:has-text("Attach")');
          if (!attachButton) {
            console.log('[CHATGPT-SESSION] Could not find attach button');
            await this.page.screenshot({ path: '/tmp/debug-no-attach-button.png' });
            throw new Error('Could not find attach button');
          }
          
          console.log('[CHATGPT-SESSION] Found attach button, clicking...');
          await attachButton.click();
          await new Promise(res => setTimeout(res, 1000));

          // Look for the file input
          const fileInput = await this.page.$('input[type="file"]');
          if (!fileInput) {
            console.log('[CHATGPT-SESSION] Could not find file input');
            await this.page.screenshot({ path: '/tmp/debug-no-file-input.png' });
            throw new Error('Could not find file input');
          }

          console.log('[CHATGPT-SESSION] Found file input, uploading image...');
          await fileInput.uploadFile(images[i]);
          
          // Wait for upload to complete - look for image preview or attachment indicator
          await new Promise(res => setTimeout(res, 3000));
          
          // Close any open menus by clicking somewhere safe
          await this.page.click('main');
          await new Promise(res => setTimeout(res, 500));
          
        } catch (error) {
          console.log('[CHATGPT-SESSION] Error uploading image:', error);
          throw error;
        }
      }

      // Wait for all images to finish uploading and UI to update
      console.log('[CHATGPT-SESSION] Waiting for images to finish uploading...');
      await new Promise(res => setTimeout(res, 3000));

      // Type the prompt
      console.log('[CHATGPT-SESSION] Typing prompt...');
      try {
        // Wait for the input area to be ready
        await new Promise(res => setTimeout(res, 1000));
        
        // Try different input selectors in order of preference
        let input = null;
        const selectors = [
          'div#prompt-textarea[contenteditable="true"]',
          'div.ProseMirror[contenteditable="true"]',
          'textarea[data-testid="prompt-textarea"]',
          '[role="textbox"]'
        ];
        
        for (const selector of selectors) {
          input = await this.page.$(selector);
          if (input) {
            console.log(`[CHATGPT-SESSION] Found input with selector: ${selector}`);
            break;
          }
        }

        if (!input) {
          console.log('[CHATGPT-SESSION] Could not find input element');
          await this.page.screenshot({ path: '/tmp/debug-no-input-element.png' });
          throw new Error('Could not find input element');
        }

        // Focus and clear the input
        await input.focus();
        await new Promise(res => setTimeout(res, 300));
        
        // Clear any existing content using keyboard shortcuts
        await this.page.keyboard.down('Meta');
        await this.page.keyboard.press('a');
        await this.page.keyboard.up('Meta');
        await this.page.keyboard.press('Backspace');
        await new Promise(res => setTimeout(res, 300));

        // Type the prompt
        console.log('[CHATGPT-SESSION] Typing prompt text...');
        await this.page.keyboard.type(prompt);
        await new Promise(res => setTimeout(res, 1000));

        // Send the message
        console.log('[CHATGPT-SESSION] Sending message...');
        await this.page.keyboard.press('Enter');
        
        // Wait for the message to appear in the chat
        console.log('[CHATGPT-SESSION] Waiting for message to appear in chat...');
        const promptText = prompt.trim();
        try {
          await this.page.waitForFunction((promptText: string) => {
            return Array.from(document.querySelectorAll('div[data-message-author-role="user"]'))
              .some(el => el.textContent && el.textContent.trim().includes(promptText));
          }, { timeout: 15000 }, promptText);
        console.log('[CHATGPT-SESSION] Message sent and visible in chat');
        } catch (messageError) {
          console.error('[CHATGPT-SESSION] Message did not appear in chat:', messageError);
          await this.page.screenshot({ path: '/tmp/debug-message-wait-failed.png' });
          console.log('[CHATGPT-SESSION] Screenshot saved: /tmp/debug-message-wait-failed.png');
          
          // Try alternative message detection
          const userMessages = await this.page.$$eval('[data-message-author-role="user"]', 
            (els: any[]) => els.map(el => el.textContent?.trim())
          );
          console.log('[CHATGPT-SESSION] Found user messages:', userMessages);
          
          // Check if message was actually sent by looking for any recent user message
          if (userMessages.length > 0) {
            console.log('[CHATGPT-SESSION] Message appears to have been sent, continuing...');
          } else {
            throw messageError;
          }
        }

      } catch (error) {
        console.log('[CHATGPT-SESSION] Error sending prompt:', error);
        throw error;
      }

      console.log('[CHATGPT-SESSION] Waiting 3 minutes and 20 seconds for ChatGPT to start rendering...');
      await new Promise(res => setTimeout(res, 200000));
      console.log('[CHATGPT-SESSION] Starting to poll for the generated image (up to 3 more minutes)...');
      // Scroll to the bottom before polling
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // Poll for a new assistant message with an image, up to 3 more minutes
      const pollTimeout = 180000; // 3 minutes
      const pollInterval = 2500; // 2.5 seconds
      const pollStart = Date.now();
      let generatedImageUrl: string | null = null;
      let pollCount = 0;
      while (Date.now() - pollStart < pollTimeout) {
        pollCount++;
        // New logic: find assistant messages by article[data-testid^="conversation-turn-"] with h6 containing 'ChatGPT said:'
        const assistantCount = await this.page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.filter(node => {
            const h6 = node.querySelector('h6');
            return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
          }).length
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantCount} assistant articles.`);
        // Get all assistant articles and look for an image inside each
        const assistantImages: string[] = await this.page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && (h6.textContent.includes('ChatGPT said:') || h6.textContent.includes('ChatGPT'));
            })
            .map(node => {
              // Try multiple image selectors
              const img = node.querySelector('img') || 
                          node.querySelector('img[src*="blob:"]') ||
                          node.querySelector('img[src*="data:"]') ||
                          node.querySelector('img[alt*="image"]') ||
                          node.querySelector('[role="img"] img') ||
                          node.querySelector('picture img');
              return img ? img.src : null;
            })
            .filter(Boolean)
        );
        console.log(`[CHATGPT-SESSION] Poll #${pollCount}: Found ${assistantImages.length} assistant articles with images.`);
        if (assistantImages.length > 0) {
          generatedImageUrl = assistantImages[assistantImages.length - 1];
          console.log(`[CHATGPT-SESSION] New generated image found in assistant article after polling: ${generatedImageUrl}`);
          break;
        }
        await new Promise(res => setTimeout(res, pollInterval));
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }
      // If no image found after polling, fallback to the last assistant article with an image
      if (!generatedImageUrl) {
        // Log the HTML of all assistant articles for debugging
        const assistantHtml: string[] = await this.page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes
            .filter(node => {
              const h6 = node.querySelector('h6');
              return h6 && h6.textContent && h6.textContent.includes('ChatGPT said:');
            })
            .map(node => node.outerHTML)
        );
        console.log('[CHATGPT-SESSION] Assistant article HTML dump:', JSON.stringify(assistantHtml, null, 2));
        // Additional debugging: log <main> HTML
        const mainHtml = await this.page.evaluate(() => {
          const main = document.querySelector('main');
          return main ? main.innerHTML : 'No <main> found';
        });
        console.log('[CHATGPT-SESSION] <main> HTML dump:', mainHtml);
        // Log all article[data-testid^="conversation-turn-"] outerHTML
        const allArticles = await this.page.$$eval(
          'article[data-testid^="conversation-turn-"]',
          (nodes: any[]) => nodes.map((node: any) => node.outerHTML)
        );
        console.log('[CHATGPT-SESSION] All article[data-testid^="conversation-turn-"] HTML:', JSON.stringify(allArticles, null, 2));
        // Log all <img> srcs
        const allImgSrcs = await this.page.$$eval('img', (imgs: any[]) => imgs.map((img: any) => img.src));
        console.log('[CHATGPT-SESSION] All <img> srcs:', JSON.stringify(allImgSrcs, null, 2));
        // Fallback: try again for images in assistant articles with broader selectors
        const assistantImages: string[] = await this.page.$$eval(
          'article[data-testid^="conversation-turn-"], div[data-message-author-role="assistant"], [data-testid*="message"], .group',
          (nodes: any[]) => {
            const allImages: string[] = [];
            
            nodes.forEach(node => {
              // Try multiple image selectors within each node
              const imgs = node.querySelectorAll('img') || [];
              imgs.forEach((img: any) => {
                if (img.src && 
                    (img.src.includes('blob:') || 
                     img.src.includes('data:') || 
                     img.src.includes('oaidalleapiprodscus.blob.core.windows.net') ||
                     img.src.includes('cdn.openai.com') ||
                     img.alt?.includes('image') ||
                     img.src.includes('generated'))) {
                  allImages.push(img.src);
                }
              });
            });
            
            return allImages;
          }
        );
        generatedImageUrl = assistantImages[assistantImages.length - 1] || null;
        if (!generatedImageUrl) {
          // Fallback: pull the last relevant image in the DOM
          const allImages: string[] = await this.page.$$eval('img', (imgs: any[]) => 
            imgs
              .map((img: any) => img.src)
              .filter((src: string) => 
                src && (
                  src.includes('blob:') || 
                  src.includes('data:image') || 
                  src.includes('oaidalleapiprodscus.blob.core.windows.net') ||
                  src.includes('cdn.openai.com') ||
                  src.includes('generated') ||
                  (src.includes('http') && !src.includes('avatar') && !src.includes('icon'))
                )
              )
          );
          generatedImageUrl = allImages[allImages.length - 1] || null;
          if (!generatedImageUrl) {
            console.error('[CHATGPT-SESSION] No generated image found in assistant articles or anywhere in the DOM.');
            await this.page.screenshot({ path: '/tmp/debug-after-polling.png' });
            console.error('[CHATGPT-SESSION] Screenshot saved as debug-after-polling.png');
            throw new Error('No generated image found in assistant articles or anywhere in the DOM');
          }
          console.log('[CHATGPT-SESSION] Fallback: using last image in DOM:', generatedImageUrl);
        } else {
          console.log('[CHATGPT-SESSION] Polling timed out, using last assistant article image:', generatedImageUrl);
        }
      }
      // Download the image and convert to base64
      const response = await fetch(generatedImageUrl);
      if (!response.ok) throw new Error('Failed to download generated image');
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      // Try to detect mime type from URL (default to jpeg)
      const ext = (generatedImageUrl.split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      console.log('[CHATGPT-SESSION] Returning generated image as base64.');
      return `data:${mime};base64,${base64}`;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error in uploadImagesAndSendPrompt:', error);
      throw error;
    }
  }

  private async launchBrowser() {
    console.log('[CHATGPT-SESSION] Attempting to launch browser...');
    
    try {
      // Use the existing browserless connection utility
      const { browser, page } = await launchBrowser();
      this.browser = browser;
      this.page = page;

      // Set a more realistic user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      
      // Set extra headers that might help bypass Cloudflare
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document'
      });
      
      // Enable JavaScript and accept cookies
      await this.page.setJavaScriptEnabled(true);
      
      // Filter out problematic cookie properties before setting
      const filteredCookies = this.cookies.map(cookie => {
        const { partitionKey, sameParty, sourceScheme, sourcePort, ...cleanCookie } = cookie;
        return cleanCookie;
      });
      
      // Log cookie details before setting
      console.log('[CHATGPT-SESSION] Setting cookies:', filteredCookies.length);
      for (const cookie of filteredCookies) {
        console.log(`- ${cookie.name} (expires: ${cookie.expires ? new Date(cookie.expires * 1000).toISOString() : 'session'})`);
      }
      
      await this.page.setCookie(...filteredCookies);
      
      // Verify cookies were set
      const pagesCookies = await this.page.cookies();
      console.log('[CHATGPT-SESSION] Cookies after setting:', pagesCookies.length);
      for (const cookie of pagesCookies) {
        console.log(`- ${cookie.name} (expires: ${cookie.expires ? new Date(cookie.expires * 1000).toISOString() : 'session'})`);
      }
      
      console.log('[CHATGPT-SESSION] Browser launched successfully');
    } catch (error: unknown) {
      console.error('[CHATGPT-SESSION] Browser launch failed:', error);
      throw error;
    }
  }

  private async loadCookies() {
    try {
      // Try multiple cookie file locations
      const possiblePaths = [
        this.cookiesPath,                    // /tmp/chatgpt-cookies.json
        'chatgpt-cookies.json',              // In current directory
        process.cwd() + '/chatgpt-cookies.json'  // Absolute path to current directory
      ];

      // Essential cookies that should never be removed
      const essentialCookies = new Set([
        '_dd_s',          // DataDog session
        '__cflb',         // CloudFlare load balancer
        '__cf_bm',        // CloudFlare bot management
        'cf_clearance',   // CloudFlare clearance
        '__Secure-next-auth.session-token',  // Auth session
        '__Host-next-auth.csrf-token',       // CSRF protection
        'oai-hm',         // OpenAI session management
        '_cfuvid',        // CloudFlare visitor ID
        'oai-did'         // OpenAI device ID
      ]);

      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          console.log(`[CHATGPT-SESSION] Found cookies at: ${path}`);
          const cookiesStr = fs.readFileSync(path, 'utf8');
          this.cookies = JSON.parse(cookiesStr);
          
          // Log cookie details
          console.log('[CHATGPT-SESSION] Cookie details:');
          for (const cookie of this.cookies) {
            console.log(`- ${cookie.name} (expires: ${cookie.expires ? new Date(cookie.expires * 1000).toISOString() : 'session'})`);
          }
          
          // Only filter non-essential cookies that have truly expired
          const now = Date.now() / 1000; // Convert to seconds
          this.cookies = this.cookies.map(cookie => {
            // Ensure all cookies have the correct domain
            if (cookie.domain === 'chatgpt.com') {
              cookie.domain = '.chatgpt.com';
            }
            return cookie;
          }).filter(cookie => {
            // Keep all essential cookies
            if (essentialCookies.has(cookie.name)) {
              return true;
            }
            
            // For non-essential cookies, check expiration
            const isExpired = cookie.expires > 0 && cookie.expires < now;
            if (isExpired) {
              console.log(`[CHATGPT-SESSION] Removing expired non-essential cookie: ${cookie.name}`);
            }
            return !isExpired;
          });
          
          // Copy cookies to tmp location for future use
          if (path !== this.cookiesPath) {
            fs.writeFileSync(this.cookiesPath, JSON.stringify(this.cookies, null, 2));
            console.log('[CHATGPT-SESSION] Copied cookies to:', this.cookiesPath);
          }
          
          return;
        }
      }

      console.log('[CHATGPT-SESSION] No cookies file found in any location');
      this.cookies = [];
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[CHATGPT-SESSION] Error loading cookies:', err.message);
      this.cookies = [];
    }
  }

  private async findInputLikeElements() {
    try {
      // Get all potentially interactive elements
      const elements = await this.page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        return allElements
          .filter(el => {
            const htmlEl = el as HTMLElement;
            const isVisible = !!(htmlEl.offsetWidth || htmlEl.offsetHeight || htmlEl.getClientRects().length);
            const isInteractive = 
              el.tagName === 'INPUT' ||
              el.tagName === 'TEXTAREA' ||
              el.tagName === 'BUTTON' ||
              el.getAttribute('role') === 'textbox' ||
              el.getAttribute('role') === 'button' ||
              el.getAttribute('contenteditable') === 'true';
            return isVisible && isInteractive;
          })
          .map(el => {
            const htmlEl = el as HTMLElement;
            return {
              tagName: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className,
              role: el.getAttribute('role'),
              ariaLabel: el.getAttribute('aria-label'),
              placeholder: el.getAttribute('placeholder'),
              contentEditable: el.getAttribute('contenteditable'),
              isVisible: !!(htmlEl.offsetWidth || htmlEl.offsetHeight || htmlEl.getClientRects().length),
              text: el.textContent?.trim().substring(0, 100),
              rect: htmlEl.getBoundingClientRect().toJSON()
            };
          });
      });
      
      console.log('[CHATGPT-SESSION] Found interactive elements:', JSON.stringify(elements, null, 2));
      return elements;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error finding interactive elements:', error);
      return [];
    }
  }

  private async debugElementInteraction(element: any, action: string) {
    try {
      const elementInfo = await element.evaluate((el: any) => ({
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        role: el.getAttribute('role'),
        isVisible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
        isConnected: el.isConnected,
        rect: el.getBoundingClientRect().toJSON(),
        computedStyle: {
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity,
          zIndex: window.getComputedStyle(el).zIndex,
          position: window.getComputedStyle(el).position
        }
      }));

      console.log(`[CHATGPT-SESSION] Attempting ${action} on element:`, JSON.stringify(elementInfo, null, 2));

      // Check if element is actually clickable
      const isClickable = await element.evaluate((el: any) => {
        const rect = el.getBoundingClientRect();
        const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        const hasSize = rect.width > 0 && rect.height > 0;
        const style = window.getComputedStyle(el);
        const isStyleVisible = style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
        
        // Check if element is covered by other elements
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        const isCovered = elementAtPoint !== el && !el.contains(elementAtPoint);
        
        return {
          isVisible,
          hasSize,
          isStyleVisible,
          isCovered,
          coveringElement: isCovered ? {
            tagName: elementAtPoint?.tagName,
            id: elementAtPoint?.id,
            className: elementAtPoint?.className
          } : null
        };
      });

      console.log(`[CHATGPT-SESSION] Clickability check:`, JSON.stringify(isClickable, null, 2));
      
      // Take a screenshot of the area around the element
      await this.page.screenshot({
        path: `/tmp/debug-${action}-before.png`,
        clip: {
          x: Math.max(0, elementInfo.rect.x - 50),
          y: Math.max(0, elementInfo.rect.y - 50),
          width: elementInfo.rect.width + 100,
          height: elementInfo.rect.height + 100
        }
      });

    } catch (error) {
      console.error(`[CHATGPT-SESSION] Error debugging ${action}:`, error);
    }
  }

  // New method to inject session token directly
  private async injectSessionToken() {
    try {
      console.log('[CHATGPT-SESSION] Attempting session token injection...');
      
      // Get session token from environment or config
      const sessionToken = process.env.CHATGPT_SESSION_TOKEN;
      if (!sessionToken) {
        console.log('[CHATGPT-SESSION] No session token found in environment');
        return false;
      }

      // Inject the session token into localStorage
      await this.page.evaluate((token: string) => {
        localStorage.setItem('__Secure-next-auth.session-token', token);
        console.log('[CHATGPT-SESSION] Session token injected into localStorage');
      }, sessionToken);

      // Also set it as a cookie for compatibility
      await this.page.setCookie({
        name: '__Secure-next-auth.session-token',
        value: sessionToken,
        domain: '.chatgpt.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'Lax'
      });

      console.log('[CHATGPT-SESSION] Session token injection completed');
      return true;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error injecting session token:', error);
      return false;
    }
  }

  // New method to check if we're logged in
  private async checkLoginStatus(): Promise<boolean> {
    try {
      const isLoggedIn = await this.page.evaluate(() => {
        // Check for login indicators using Puppeteer-compatible selectors
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('log in'));
        const signupButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('sign up'));
        
        // Check for various chat interface indicators
        const chatInput = document.querySelector('textarea[placeholder*="Ask"], textarea[placeholder*="anything"], div[contenteditable="true"]');
        const newChatButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('new chat'));
        const chatInterface = document.querySelector('[class*="chat"], [id*="chat"]');
        
        // If we see login/signup buttons, we're not logged in
        if (loginButton || signupButton) {
          console.log('[CHATGPT-SESSION] Found login/signup buttons - not logged in');
          return false;
        }
        
        // If we see the chat input or new chat button, we're likely logged in
        if (chatInput || newChatButton || chatInterface) {
          console.log('[CHATGPT-SESSION] Found chat interface - logged in');
          return true;
        }
        
        console.log('[CHATGPT-SESSION] No clear login indicators found');
        return false;
      });
      
      console.log('[CHATGPT-SESSION] Login status check:', isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error checking login status:', error);
      return false;
    }
  }

  // New method to perform automated login
  private async performAutomatedLogin(): Promise<boolean> {
    try {
      console.log('[CHATGPT-SESSION] Attempting automated login...');
      
      // Check if we need to log in
      const needsLogin = await this.checkLoginStatus();
      if (!needsLogin) {
        console.log('[CHATGPT-SESSION] Already logged in, no login needed');
        return true;
      }

      // Get credentials from environment
      const email = process.env.CHATGPT_EMAIL;
      const password = process.env.CHATGPT_PASSWORD;
      
      if (!email || !password) {
        console.log('[CHATGPT-SESSION] No credentials found in environment');
        return false;
      }

      // Click the login button using Puppeteer-compatible approach
      const loginButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent?.toLowerCase().includes('log in'));
      });
      
      if (loginButton && await loginButton.asElement()) {
        await loginButton.asElement()?.click();
        await this.page.waitForTimeout(2000);
      }

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      // Fill in email
      await this.page.type('input[type="email"], input[name="email"]', email);
      await this.page.waitForTimeout(1000);
      
      // Click continue or next
      const continueButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.type === 'submit' || 
          btn.textContent?.toLowerCase().includes('continue') ||
          btn.textContent?.toLowerCase().includes('next')
        );
      });
      
      if (continueButton && await continueButton.asElement()) {
        await continueButton.asElement()?.click();
        await this.page.waitForTimeout(2000);
      }

      // Fill in password
      await this.page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 10000 });
      await this.page.type('input[type="password"], input[name="password"]', password);
      await this.page.waitForTimeout(1000);

      // Click login
      const submitButton = await this.page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.type === 'submit' || 
          btn.textContent?.toLowerCase().includes('continue') ||
          btn.textContent?.toLowerCase().includes('log in')
        );
      });
      
      if (submitButton && await submitButton.asElement()) {
        await submitButton.asElement()?.click();
      }

      // Wait for login to complete
      await this.page.waitForTimeout(5000);
      
      // Check if login was successful
      const loginSuccessful = await this.checkLoginStatus();
      console.log('[CHATGPT-SESSION] Automated login result:', loginSuccessful);
      
      return loginSuccessful;
    } catch (error) {
      console.error('[CHATGPT-SESSION] Error during automated login:', error);
      return false;
    }
  }
}

// Cleanup on process exit
process.on('SIGINT', async () => {
  const manager = ChatGPTSessionManager.getInstance();
  await manager.closeSession();
  process.exit();
});

process.on('SIGTERM', async () => {
  const manager = ChatGPTSessionManager.getInstance();
  await manager.closeSession();
  process.exit();
});

export default ChatGPTSessionManager; 