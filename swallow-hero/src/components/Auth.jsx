import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signInWithPhone, 
  signUpWithEmail,
  signInWithEmail,
  logOut 
} from '../config/firebase';

const Auth = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const recaptchaContainerRef = useRef(null);
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleAuthSuccess = () => {
    onClose();
  };

  useEffect(() => {
    // Cleanup previous reCAPTCHA instance
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    // Reset states when changing auth method
    setVerificationId('');
    setVerificationCode('');
    setError('');
    setSuccessMessage('');
  }, [authMethod]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters except +
    let cleaned = input.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    // Format US numbers specially
    if (cleaned.startsWith('+1') && cleaned.length > 2) {
      const match = cleaned.match(/^\+1(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const [, area, prefix, line] = match;
        let formatted = '+1';
        if (area) formatted += ` (${area}`;
        if (prefix) formatted += `) ${prefix}`;
        if (line) formatted += `-${line}`;
        return formatted;
      }
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone) => {
    // Remove formatting for validation
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Basic international phone format: + followed by 7-15 digits
    const re = /^\+\d{7,15}$/;
    return re.test(cleaned);
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier && recaptchaContainerRef.current) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'normal',
          callback: () => {
            setError('');
            setSuccessMessage('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });
        return window.recaptchaVerifier.render();
      }
      return window.recaptchaVerifier;
    } catch (err) {
      console.error('reCAPTCHA setup error:', err);
      setError('Error setting up verification. Please try again.');
      return null;
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setSuccessMessage('Account created successfully! You can now sign in.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSignUp(false);
      } else {
        await signInWithEmail(email, password);
        handleAuthSuccess();
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    setLoading(true);

    try {
      if (!verificationId) {
        const verifier = setupRecaptcha();
        if (!verifier) {
          throw new Error('Failed to set up verification');
        }
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        const confirmationResult = await signInWithPhone(formattedPhone, verifier);
        setVerificationId(confirmationResult.verificationId);
        setSuccessMessage('Verification code sent successfully!');
      } else {
        if (!verificationCode || verificationCode.length < 6) {
          setError('Please enter a valid verification code');
          return;
        }
        const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        await auth.signInWithCredential(credential);
        handleAuthSuccess();
      }
    } catch (err) {
      console.error('Phone auth error:', err);
      setError(err.message.replace('Firebase:', '').trim() || 'Failed to authenticate. Please try again.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await signInWithGoogle();
      handleAuthSuccess();
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 space-y-8 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold hero-gradient mx-auto inline-block">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Auth Method Selector */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                authMethod === 'email' 
                  ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('phone')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                authMethod === 'phone' 
                  ? 'bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Email/Password Form */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 hover:from-sky-600 hover:via-teal-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Phone Auth Form */}
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneAuth} className="mt-8 space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="+1 (555) 555-5555"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your full phone number including country code (e.g., +1 for US)
                </p>
              </div>

              {verificationId && (
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => {
                      // Only allow digits and limit to 6 characters
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(cleaned);
                    }}
                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="\d{6}"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
              )}

              {/* reCAPTCHA container */}
              <div ref={recaptchaContainerRef} className="flex justify-center py-2"></div>

              <div>
                <button
                  type="submit"
                  disabled={loading || (verificationId && verificationCode.length !== 6)}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 hover:from-sky-600 hover:via-teal-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading 
                    ? 'Processing...' 
                    : verificationId 
                      ? 'Verify Code' 
                      : 'Send Verification Code'}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div>
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 