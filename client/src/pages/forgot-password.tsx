import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Import futuristic gradient background
import backgroundImage from '@assets/particle-lines-futuristic-gradient-background_1760322867271.jpg';

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Determine if input is email or username
      const isEmail = usernameOrEmail.includes('@');
      const payload = isEmail 
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail };

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      // Show success message
      setSuccess(true);
      
      // In development, show reset URL if provided
      if (data.data?.resetUrl) {
        setResetUrl(data.data.resetUrl);
      }

      toast({
        title: "Reset Link Sent",
        description: data.message || "If an account exists, a password reset link has been sent.",
        duration: 5000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-[float_20s_ease-in-out_infinite]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '120%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-white/30" />

        <div className="relative z-10 w-full max-w-md">
          <Card className="healthcare-card shadow-2xl bg-transparent backdrop-blur-2xl border-white/20">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-green-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-foreground">
                    Check Your Email
                  </CardTitle>
                  <CardDescription className="text-base">
                    Password reset instructions have been sent
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  If an account exists with that username or email, a password reset link has been sent.
                  Please check your email and click the link to reset your password.
                </AlertDescription>
              </Alert>

              {resetUrl && process.env.NODE_ENV === 'development' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="space-y-2">
                    <p className="font-semibold">Development Mode:</p>
                    <p className="text-sm break-all">{resetUrl}</p>
                    <Link href={resetUrl}>
                      <Button className="w-full mt-2">
                        Open Reset Link
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Futuristic Gradient Background */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-[float_20s_ease-in-out_infinite]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '120%'
        }}
      />

      {/* Gradient Blend Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-white/30" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="healthcare-card shadow-2xl bg-transparent backdrop-blur-2xl border-white/20">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-foreground">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-base">
                  Enter your username or email to receive a password reset link
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail">Username or Email</Label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !usernameOrEmail}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

