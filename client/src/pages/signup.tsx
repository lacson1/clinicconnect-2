import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Heart, Shield, Activity, Stethoscope, Users, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

// Import futuristic gradient background
import backgroundImage from '@assets/particle-lines-futuristic-gradient-background_1760322867271.jpg';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      await signup({
        username,
        password,
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    }
  };

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

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Professional Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">
                  Bluequee
                </h1>
                <p className="text-slate-700 font-medium">
                  Healthcare Management System
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-800">
                Join Our Healthcare Team
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg">
                Create your account to access comprehensive healthcare management tools, patient care workflows, and clinical analytics.
              </p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="healthcare-card p-6 group hover:shadow-lg transition-all bg-white/70 backdrop-blur-md">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">Intelligent diagnostic insights</p>
            </div>

            <div className="healthcare-card p-6 group hover:shadow-lg transition-all bg-white/70 backdrop-blur-md">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Vital Monitoring</h3>
              <p className="text-sm text-muted-foreground">Real-time health tracking</p>
            </div>

            <div className="healthcare-card p-6 group hover:shadow-lg transition-all bg-white/70 backdrop-blur-md">
              <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                <Users className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Patient Care</h3>
              <p className="text-sm text-muted-foreground">Comprehensive patient management</p>
            </div>

            <div className="healthcare-card p-6 group hover:shadow-lg transition-all bg-white/70 backdrop-blur-md">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure Vault</h3>
              <p className="text-sm text-muted-foreground">HIPAA-compliant protection</p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="healthcare-card shadow-2xl bg-transparent backdrop-blur-2xl border-white/20">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-foreground">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-base">
                    Sign up to access your healthcare dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 3 characters, letters, numbers, and underscores only
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <Separator />

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-10"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">
                Bluequee
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">Healthcare Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

