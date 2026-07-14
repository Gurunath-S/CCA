import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Spa as SpaIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const { setRedirectSession, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [loginError, setLoginError] = useState(null);

  // Handle redirect mode callback tokens from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUser = searchParams.get('isNewUser');
    const redirectError = searchParams.get('error');

    if (redirectError) {
      setLoginError(decodeURIComponent(redirectError));
      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (accessToken && refreshToken) {
      // Clean query parameters immediately for security
      window.history.replaceState({}, document.title, window.location.pathname);

      const processRedirectLogin = async () => {
        try {
          await setRedirectSession(accessToken, refreshToken);
          if (isNewUser === 'true') {
            navigate('/onboarding');
          } else {
            navigate(from, { replace: true });
          }
        } catch (err) {
          console.error(err);
          setLoginError('Failed to establish session after redirect. Please try again.');
        }
      };

      processRedirectLogin();
    }
  }, [location.search, navigate, from, setRedirectSession]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        const apiBaseUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
          : 'http://localhost:5000';

        window.google.accounts.id.initialize({
          client_id: "403992425264-tp4p2flguojrg091qv2uoob6hph96n2l.apps.googleusercontent.com",
          ux_mode: "redirect",
          login_uri: `${apiBaseUrl}/api/auth/google`
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: "320", 
            text: "signin_with", 
            shape: "pill" 
          }
        );
      }
    };

    // Try initializing immediately
    initializeGoogleSignIn();

    // In case script finishes loading late
    const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (scriptTag) {
      scriptTag.addEventListener('load', initializeGoogleSignIn);
    }

    return () => {
      if (scriptTag) {
        scriptTag.removeEventListener('load', initializeGoogleSignIn);
      }
    };
  }, []);

  return (
    <Box 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `url('/image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Crisp Full-Screen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/image.png"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <source src="/19609-303404131_medium.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Overlay to ensure high-contrast readability without blurring the video */}
      <Box className="absolute inset-0 bg-slate-950/20 z-0" />

      {/* Central High-Transparency Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-[32px] backdrop-blur-xl bg-white/20 dark:bg-slate-950/15 border border-white/40 dark:border-white/10 shadow-2xl flex flex-col items-center text-center space-y-6"
      >
        {/* App Logo */}
        <Box className="flex flex-col items-center space-y-2">
          <SpaIcon className="text-5xl drop-shadow-md animate-pulse" style={{ color: '#f97316' }} />
          <Typography variant="h4" className="font-bold tracking-wider font-serif text-slate-950 dark:text-white drop-shadow-md">
            Character Coach
          </Typography>
        </Box>

        {/* Serene Tagline */}
        <Box className="space-y-2">
          <Typography variant="h6" className="font-serif italic font-semibold text-slate-950 dark:text-white leading-snug drop-shadow-sm">
            "To be and to make, that is the whole secret."
          </Typography>
          <Typography variant="body2" className="text-slate-900 dark:text-slate-100 text-sm max-w-xs mx-auto leading-relaxed font-medium drop-shadow-sm">
            Evaluate, understand, and refine your core character attributes daily.
          </Typography>
        </Box>

        {loginError && (
          <Alert severity="error" className="rounded-xl w-full text-left">
            {loginError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" className="rounded-xl w-full text-left">
            {error}
          </Alert>
        )}

        {/* Login Button Container */}
        <Box className="w-full py-2 flex flex-col items-center justify-center min-h-[60px]">
          {isLoading ? (
            <CircularProgress size={30} style={{ color: '#f97316' }} />
          ) : (
            <div id="google-signin-button" className="shadow-lg rounded-full overflow-hidden transition-transform hover:scale-[1.02]" />
          )}
        </Box>

        {/* Prominent, Non-Repetitive Dedication */}
        <Box className="w-full mt-6 pt-6 border-t border-slate-950/10 dark:border-white/15 text-center">
          <Typography variant="body2" className="text-slate-950 dark:text-slate-100 leading-relaxed font-serif text-sm italic font-medium drop-shadow-sm">
            Dedicated to <strong>N. Lakshminarayana Naidu</strong> for 30+ years of outstanding leadership promoting the message of self-reflection.
          </Typography>
          <a
            href="http://vvym.blogspot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 underline hover:text-orange-700 transition-colors drop-shadow-sm"
          >
            vvym.blogspot.com
          </a>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;
