'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/layout';
import { Copy, Check, Eye, Code2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function WidgetGeneratorPage() {
  const { data: session, status } = useSession();
  const [captchaId, setCaptchaId] = useState('');
  const [theme, setTheme] = useState('light');
  const [size, setSize] = useState('normal');
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com'
      : 'http://localhost:3000';

  const scriptUrl = `${baseUrl}/api/widget/script?id=${captchaId}&theme=${theme}&size=${size}`;

  const embedCode = `<!-- Art Captcha Widget -->
<div id="art-captcha-container" data-art-captcha="${captchaId}"></div>
<script src="${scriptUrl}"></script>

<!-- Optional: Custom initialization -->
<script>
  // You can also initialize manually with custom options
  /*
  const captcha = ArtCaptcha.init('#art-captcha-container', {
    onSuccess: function(verificationToken) {
      console.log('Captcha verified!', verificationToken);
      // Include verificationToken in your form submission
      document.getElementById('captcha-token').value = verificationToken;
    },
    onError: function(error) {
      console.log('Captcha failed:', error);
    },
    onReset: function() {
      console.log('Captcha reset');
    }
  });
  */
</script>`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const refreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Widget Generator</h1>
          <p className="text-muted-foreground">
            Generate embeddable JavaScript code for your CAPTCHAs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Widget Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="captcha-id">Captcha ID *</Label>
                <Input
                  id="captcha-id"
                  value={captchaId}
                  onChange={(e) => setCaptchaId(e.target.value)}
                  placeholder="Enter the ID of your captcha"
                  type="number"
                />
                <p className="text-sm text-muted-foreground">
                  You can find the ID in your captcha list
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={size}
                  onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">
                      Small (max-width: 300px)
                    </SelectItem>
                    <SelectItem value="normal">
                      Normal (max-width: 400px)
                    </SelectItem>
                    <SelectItem value="large">
                      Large (max-width: 500px)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Generated Script URL</Label>
                  <Badge variant="secondary">{theme}</Badge>
                </div>
                <div className="relative">
                  <code className="block p-3 bg-muted rounded-md text-sm break-all">
                    {scriptUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(scriptUrl)}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshPreview}
                  disabled={!captchaId}>
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {captchaId ? (
                <div className="border rounded-lg p-4 bg-card">
                  <iframe
                    key={previewKey}
                    src={`/widget-preview?id=${captchaId}&theme=${theme}&size=${size}`}
                    className="w-full h-96 border-0"
                    title="Captcha Widget Preview"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Enter a Captcha ID to see the preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Embed Code */}
        {captchaId && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Copy this code and paste it into your website where you want
                  the CAPTCHA to appear:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode)}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Integration Notes:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>
                    • The widget will automatically initialize when the page
                    loads
                  </li>
                  <li>
                    • Use the{' '}
                    <code className="bg-white dark:bg-gray-800 px-1 rounded">
                      onSuccess
                    </code>{' '}
                    callback to get the verification token
                  </li>
                  <li>
                    • Include the verification token in your form submissions
                    for server-side validation
                  </li>
                  <li>
                    • The widget is responsive and adapts to its container
                  </li>
                  <li>• Cross-origin requests are handled automatically</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
