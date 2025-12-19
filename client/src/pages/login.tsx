import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Heart, Shield, Activity, Stethoscope, Users, Eye, EyeOff, CheckCircle, UserPlus, Lock } from 'lucide-react';
import { SiGoogle, SiGithub, SiX, SiApple } from 'react-icons/si';
import { Link } from 'wouter';

// Background image is optional - using CSS gradient as primary with optional image overlay

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setError('');
    setUsername(demoUsername);
    setPassword(demoPassword);

    try {
      await login(demoUsername, demoPassword);
    } catch (error) {
      setError('Invalid demo credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Futuristic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-pulse" />

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
                Professional Clinical Management
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg">
                Comprehensive healthcare platform with intelligent analytics, real-time monitoring, and streamlined patient care workflows.
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

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="healthcare-card shadow-2xl bg-transparent backdrop-blur-2xl border-white/20">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-foreground">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-base">
                    Access your healthcare dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* OAuth Login - Currently Disabled */}
              <div className="space-y-3">
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                  <p className="text-sm text-muted-foreground text-center">
                    OAuth login (Google, GitHub, etc.) is not yet available. Please use username/password login above.
                  </p>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  <Lock className="inline mr-1 h-3 w-3" />
                  Forgot password?
                </Link>
              </div>

              {/* Signup Link */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Demo Accounts */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Quick Demo Login
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleDemoLogin('superadmin', 'super123')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 justify-start"
                  >
                    <Shield className="w-4 h-4 mr-2 text-destructive" />
                    Super Admin
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('admin', 'admin123')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 justify-start"
                  >
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    Admin
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('ade', 'doctor123')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 justify-start"
                  >
                    <Stethoscope className="w-4 h-4 mr-2 text-info" />
                    Doctor (Ade)
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('syb', 'nurse123')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 justify-start"
                  >
                    <Heart className="w-4 h-4 mr-2 text-success" />
                    Nurse (Syb)
                  </Button>

                  <Button
                    onClick={() => handleDemoLogin('receptionist', 'receptionist123')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10 justify-start"
                  >
                    <Activity className="w-4 h-4 mr-2 text-accent" />
                    Receptionist
                  </Button>
                </div>
              </div>
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
