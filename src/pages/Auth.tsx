import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

type VerificationMode = 'none' | 'login' | 'signup';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationMode, setVerificationMode] = useState<VerificationMode>('none');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setVerificationMode('login');
        toast.success('Verification code sent to your email.');
      }

      setLoading(false);
      return;
    }

    if (!username.trim()) {
      toast.error('Username is required');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, username);
    if (error) {
      toast.error(error.message);
    } else {
      setVerificationMode('signup');
      toast.success('Verification code sent to your email.');
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: verificationMode === 'signup' ? 'signup' : 'email',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Verification successful. Welcome!');
      navigate('/');
    }

    setLoading(false);
  };

  if (verificationMode !== 'none') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Card className="w-full max-w-md bg-card horror-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground text-sm">
              Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>
            </p>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button onClick={handleVerifyOtp} className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <button
              onClick={() => {
                setVerificationMode('none');
                setOtp('');
              }}
              className="block w-full text-center text-sm text-muted-foreground hover:underline"
            >
              Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <Card className="w-full max-w-md bg-card horror-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted border-border"
                required
              />
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted border-border"
              required
            />

            {!isLogin && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border"
                required
                minLength={6}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Send Login Code' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setOtp('');
                setVerificationMode('none');
              }}
              className="text-primary hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
