import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getRoleHomeRoute, useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const faculties = [
  'Computer Science',
  'Engineering',
  'Business',
  'Science',
  'Arts',
];

const academicYears = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate'];

const Register = () => {
  const { register: registerUser, loginWithGoogle, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const googleClientIdConfigured = Boolean(
    googleClientId && !googleClientId.includes('your-google-client-id')
  );

  if (isAuthenticated) {
    return <Navigate to={getRoleHomeRoute(user?.role)} replace />;
  }

  const onSubmit = async (data) => {
    setSubmitError('');
    setIsLoading(true);

    const payload = {
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      role: 'USER',
      studentId: data.studentId?.trim(),
      faculty: data.faculty,
      academicYear: data.academicYear,
    };

    const result = await registerUser(payload);

    if (result?.success) {
      navigate('/login', {
        replace: true,
        state: { registeredEmail: payload.email },
      });
    } else {
      const message = result?.message || 'Registration failed. Please try again.';
      setSubmitError(message);
      if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'server', message });
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign-in did not return a token');
      return;
    }

    setIsGoogleLoading(true);
    const result = await loginWithGoogle(credentialResponse.credential);
    setIsGoogleLoading(false);

    if (!result?.success) {
      setSubmitError(result?.message || 'Google sign-in failed. Please try again.');
    } else {
      navigate(result.redirectTo || getRoleHomeRoute(result.user?.role), { replace: true });
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-navy-700 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-navy-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-navy-600">
            Register as a student to request bookings and report campus incidents
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-navy-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-700">
                  Full name
                </label>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-700">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="mt-1 input-field"
                  placeholder="Enter email"
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
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className="mt-1 input-field"
                  placeholder="Create password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-navy-700">
                  Student ID
                </label>
                <input
                  {...register('studentId', {
                    validate: (value) => {
                      if (!value?.trim()) {
                        return 'Student ID is required for students';
                      }
                      return true;
                    },
                  })}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter student ID"
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-navy-700">
                  Faculty
                </label>
                <select
                  {...register('faculty', { required: 'Faculty is required' })}
                  className="mt-1 input-field"
                >
                  <option value="">Select faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
                {errors.faculty && (
                  <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-navy-700">
                  Academic year
                </label>
                <select
                  {...register('academicYear', {
                    validate: (value) => {
                      if (!value) {
                        return 'Academic year is required for students';
                      }
                      return true;
                    },
                  })}
                  className="mt-1 input-field"
                >
                  <option value="">Select academic year</option>
                  {academicYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
                )}
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-navy-700">
                  Account type
                </label>
                <div className="mt-1 input-field bg-navy-50 text-navy-700">
                  Student
                </div>
              </div>

            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create user'}
              </button>
            </div>

            {submitError && (
              <p className="text-sm text-red-600 text-center">{submitError}</p>
            )}
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
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-navy-700 hover:text-navy-900">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
