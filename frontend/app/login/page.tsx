"use client";

import Head from 'next/head';
import React, { FormEvent, useState } from 'react';
// Assuming 'supabase' is correctly exported from this path:
import supabase from '../createClient'; 
import { useRouter } from 'next/navigation';

// Define the component's props interface (optional)
interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
  // --- States for form data, UI feedback, and navigation ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // --- Form Submission Handler ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Call Supabase sign-in method
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // 2. Handle Supabase error
      if (error) {
        // You can customize the error message based on the error code/message here
        setError(error.message || 'An unknown error occurred during sign-in.');
        console.error('Supabase Sign-in Error:', error);
      } else {
        // 3. Success: Redirect the user (e.g., to the dashboard page)
        console.log('User signed in successfully.');
        router.push('/home'); // Change '/dashboard' to your main protected route
      }
    } catch (err) {
      // Handle network or unexpected errors
      setError('A critical error occurred. Please try again.');
      console.error('Login Catch Error:', err);
    } finally {
      // 4. Reset loading state
      setLoading(false);
    }
  };

  // --- Component Render ---
  return (
    <>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          rel="stylesheet"
        />
      </Head>
      
      <div style={{background:"#00ff7f"}} className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            SideDuit
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-700">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Error Display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}
              
              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email} // Controlled input
                    onChange={(e) => setEmail(e.target.value)} // Update state
                    disabled={loading} // Disable while loading
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password} // Controlled input
                    onChange={(e) => setPassword(e.target.value)} // Update state
                    disabled={loading} // Disable while loading
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              {/* Sign In Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading} // Disable button when loading
                  style={{background : '#00002a'}}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    // Simple loading spinner using Tailwind classes (you may need to install/adjust your spinner)
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6">
              <p className="mt-2 text-center text-sm text-gray-600">
                Or new user? {' '}
                <a 
                  href="/register" 
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign Up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;