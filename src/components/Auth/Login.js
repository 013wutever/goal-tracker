import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import CryptoJS from 'crypto-js';
import googleSheetsService from '../../services/googleSheets';
import { getTranslation } from '../../utils/translations';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

const Login = ({ language = 'el', onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const translations = {
    el: {
      title: 'Καλώς ήρθατε στο Goal Tracker',
      titleRegister: 'Δημιουργία Λογαριασμού',
      email: 'Email',
      password: 'Κωδικός',
      login: 'Σύνδεση',
      register: 'Εγγραφή',
      switchToRegister: 'Δεν έχετε λογαριασμό; Εγγραφείτε',
      switchToLogin: 'Έχετε ήδη λογαριασμό; Συνδεθείτε',
      error: {
        invalidEmail: 'Παρακαλώ εισάγετε έγκυρο email',
        passwordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
        generic: 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.'
      },
      welcomeText: 'Διαχειριστείτε τους στόχους σας με ευκολία και παρακολουθήστε την πρόοδό σας'
    },
    en: {
      title: 'Welcome to Goal Tracker',
      titleRegister: 'Create Account',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      register: 'Register',
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Sign in',
      error: {
        invalidEmail: 'Please enter a valid email',
        passwordLength: 'Password must be at least 6 characters long',
        generic: 'Something went wrong. Please try again.'
      },
      welcomeText: 'Manage your goals with ease and track your progress'
    }
  };

  const t = (key) => {
    const translation = key.split('.').reduce((obj, k) => obj?.[k], translations[language]);
    return translation || key;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError(t('error.invalidEmail'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('error.passwordLength'));
      return;
    }

    setIsLoading(true);
    const hashedPassword = hashPassword(password);

    try {
      if (isNewUser) {
        const result = await googleSheetsService.addUser(email, hashedPassword);
        if (result.success) {
          onLogin(email);
        } else {
          setError(result.error || t('error.generic'));
        }
      } else {
        const result = await googleSheetsService.verifyUser(email, hashedPassword);
        if (result.success) {
          onLogin(email);
        } else {
          setError(result.error || t('error.generic'));
        }
      }
    } catch (error) {
      setError(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassmorphicContainer className="w-full max-w-md rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            {isNewUser ? t('titleRegister') : t('title')}
          </h1>
          <p className="text-white/70">{t('welcomeText')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glassmorphic bg-white/5 rounded-xl 
                          focus:ring-2 focus:ring-white/20 focus:outline-none
                          placeholder-white/50"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glassmorphic bg-white/5 rounded-xl
                          focus:ring-2 focus:ring-white/20 focus:outline-none
                          placeholder-white/50"
                placeholder="••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-pink-300 text-sm text-center">
              {error}
            </p>
          )}

          <GlassmorphicContainer
            as="button"
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-xl flex items-center justify-center"
            hover={true}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              isNewUser ? t('register') : t('login')
            )}
          </GlassmorphicContainer>

          <button
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="w-full text-sm text-white/70 hover:text-white transition-colors"
          >
            {isNewUser ? t('switchToLogin') : t('switchToRegister')}
          </button>
        </form>
      </GlassmorphicContainer>
    </div>
  );
};

export default Login;
