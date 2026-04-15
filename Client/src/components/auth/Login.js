import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getRoleHomeRoute, useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={getRoleHomeRoute(user?.role)} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data);
    setIsLoading(false);

    if (result?.success) {
      navigate(result.redirectTo || getRoleHomeRoute(result.user?.role), { replace: true });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign-in did not return a token');
      return;
    }

    setIsGoogleLoading(true);
    const result = await loginWithGoogle(credentialResponse.credential);
    setIsGoogleLoading(false);

    if (result?.success) {
      navigate(result.redirectTo || getRoleHomeRoute(result.user?.role), { replace: true });
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed');
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const googleClientIdConfigured = Boolean(
    googleClientId && !googleClientId.includes('your-google-client-id')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-navy-700 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-navy-900">
            Smart Campus Hub
          </h2>
          <p className="mt-2 text-center text-sm text-navy-600">
            Sign in to your account
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-navy-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700">
                Email address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="mt-1 input-field"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                className="mt-1 input-field"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {googleClientIdConfigured && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-navy-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="100%"
                    useOneTap
                  />
                  {isGoogleLoading && (
                    <p className="mt-2 text-center text-sm text-navy-600">Signing in with Google...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-navy-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-navy-700 hover:text-navy-900">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-xs text-navy-500">
            <p className="font-semibold mb-2">Account Tip:</p>
            <p>Use an account you created from the Sign up page, then sign in here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
