'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Code2, Globe, Shield, Zap, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}>
        {copied === id ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to integrate Art Captcha widgets into your applications
          </p>
        </div>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Bot Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced image-based verification system
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Easy Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Simple JavaScript widget for any website
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code2 className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Customizable</h4>
                  <p className="text-sm text-muted-foreground">
                    Themes, sizes, and callback functions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Lightweight</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimal footprint, fast loading
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Basic Integration</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add this code to your HTML where you want the CAPTCHA to appear:
              </p>
              <CodeBlock
                id="basic-integration"
                code={`<!-- Replace CAPTCHA_ID with your actual captcha ID -->
<div id="captcha-container" data-art-captcha="CAPTCHA_ID"></div>
<script src="https://your-domain.com/api/widget/script?id=CAPTCHA_ID"></script>`}
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Manual Initialization</h4>
              <p className="text-sm text-muted-foreground mb-3">
                For more control, initialize the widget manually:
              </p>
              <CodeBlock
                id="manual-init"
                code={`<div id="my-captcha"></div>
<script src="https://your-domain.com/api/widget/script?id=CAPTCHA_ID"></script>
<script>
  const captcha = ArtCaptcha.init('#my-captcha', {
    onSuccess: function(verificationToken) {
      // User completed captcha successfully
      console.log('Verification token:', verificationToken);

      // Add token to your form
      document.getElementById('captcha-token').value = verificationToken;
    },
    onError: function(error) {
      // Captcha verification failed
      console.error('Captcha failed:', error);
    },
    onReset: function() {
      // Captcha was reset
      console.log('Captcha reset');
    }
  });
</script>`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">URL Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Parameter</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>id</code>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">string</Badge>
                        </td>
                        <td className="p-2">-</td>
                        <td className="p-2">
                          Required. The ID of your captcha
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>theme</code>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">string</Badge>
                        </td>
                        <td className="p-2">light</td>
                        <td className="p-2">
                          Theme: <code>light</code> or <code>dark</code>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>size</code>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">string</Badge>
                        </td>
                        <td className="p-2">normal</td>
                        <td className="p-2">
                          Size: <code>small</code>, <code>normal</code>, or{' '}
                          <code>large</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Callback Options</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Callback</th>
                        <th className="text-left p-2">Parameters</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>onSuccess</code>
                        </td>
                        <td className="p-2">
                          <code>verificationToken</code>
                        </td>
                        <td className="p-2">
                          Called when captcha is verified successfully
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>onError</code>
                        </td>
                        <td className="p-2">
                          <code>error</code>
                        </td>
                        <td className="p-2">Called when verification fails</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>onReset</code>
                        </td>
                        <td className="p-2">-</td>
                        <td className="p-2">Called when captcha is reset</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server-side Validation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Server-side Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Always validate the verification token on your server before
              processing form submissions.
            </p>

            <div>
              <h4 className="font-semibold mb-2">Validation Endpoint</h4>
              <CodeBlock
                id="validation-endpoint"
                code={`POST https://your-domain.com/api/widget/validate

Content-Type: application/json

{
  "verificationToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "sessionToken": "abc123xyz789"
}`}
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Example Server Validation (Node.js)
              </h4>
              <CodeBlock
                id="server-validation"
                code={`async function validateCaptcha(verificationToken, sessionToken) {
  try {
    const response = await fetch('https://your-domain.com/api/widget/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationToken,
        sessionToken
      })
    });

    const result = await response.json();

    if (result.valid) {
      console.log('Captcha verified successfully');
      return true;
    } else {
      console.log('Captcha validation failed:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Validation request failed:', error);
    return false;
  }
}

// Usage in your form handler
app.post('/submit-form', async (req, res) => {
  const { verificationToken, sessionToken, ...formData } = req.body;

  const isValid = await validateCaptcha(verificationToken, sessionToken);

  if (!isValid) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  // Process form submission
  // ...
});`}
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Example Server Validation (PHP)
              </h4>
              <CodeBlock
                id="server-validation-php"
                code={`<?php
function validateCaptcha($verificationToken, $sessionToken) {
    $url = 'https://your-domain.com/api/widget/validate';
    $data = json_encode([
        'verificationToken' => $verificationToken,
        'sessionToken' => $sessionToken
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $data
        ]
    ]);

    $response = file_get_contents($url, false, $context);
    $result = json_decode($response, true);

    return $result['valid'] ?? false;
}

// Usage
if ($_POST) {
    $verificationToken = $_POST['captcha_token'] ?? '';
    $sessionToken = $_POST['session_token'] ?? '';

    if (!validateCaptcha($verificationToken, $sessionToken)) {
        die('Captcha verification failed');
    }

    // Process form
}
?>`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Complete Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complete Form Example</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              id="complete-example"
              code={`<!DOCTYPE html>
<html>
<head>
    <title>Contact Form with Art Captcha</title>
</head>
<body>
    <form id="contact-form" action="/submit" method="POST">
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
        </div>

        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>

        <div>
            <label for="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
        </div>

        <!-- Art Captcha Widget -->
        <div id="captcha-container" data-art-captcha="1"></div>
        <input type="hidden" id="captcha-token" name="captcha_token">
        <input type="hidden" id="session-token" name="session_token">

        <button type="submit" id="submit-btn" disabled>Send Message</button>
    </form>

    <!-- Load the captcha widget -->
    <script src="https://your-domain.com/api/widget/script?id=1&theme=light"></script>

    <script>
        // Generate a session token for this form submission
        const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        document.getElementById('session-token').value = sessionToken;

        // Initialize captcha with custom callbacks
        ArtCaptcha.init('#captcha-container', {
            onSuccess: function(verificationToken) {
                document.getElementById('captcha-token').value = verificationToken;
                document.getElementById('submit-btn').disabled = false;
                document.getElementById('submit-btn').textContent = 'Send Message';
            },
            onError: function(error) {
                document.getElementById('captcha-token').value = '';
                document.getElementById('submit-btn').disabled = true;
                document.getElementById('submit-btn').textContent = 'Complete Captcha First';
                alert('Captcha verification failed: ' + error.message);
            },
            onReset: function() {
                document.getElementById('captcha-token').value = '';
                document.getElementById('submit-btn').disabled = true;
                document.getElementById('submit-btn').textContent = 'Complete Captcha First';
            }
        });
    </script>
</body>
</html>`}
            />
          </CardContent>
        </Card>

        {/* Security Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Important Security Notes:
                </h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Always validate verification tokens on your server</li>
                  <li>• Never trust client-side validation alone</li>
                  <li>• Verification tokens expire after 10 minutes</li>
                  <li>
                    • Use HTTPS in production for secure token transmission
                  </li>
                  <li>
                    • Store session tokens securely to prevent replay attacks
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Tips for Better User Experience:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use clear, recognizable images for better accuracy</li>
                  <li>• Set reasonable accuracy thresholds (70-90%)</li>
                  <li>• Provide fallback options for accessibility</li>
                  <li>
                    • Test the widget on different devices and screen sizes
                  </li>
                  <li>• Consider using the dark theme for dark websites</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
