import React, { useState } from 'react';
import LoginForm from '../components/LoginForm.jsx';
import SignupForm from '../components/SignupForm.jsx';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isLoginView ? 'Welcome Back!' : 'Join Us!'}
          </h1>
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isLoginView ? 'Need to sign up?' : 'Already have an account?'}
          </button>
        </div>

        {isLoginView ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default AuthPage;