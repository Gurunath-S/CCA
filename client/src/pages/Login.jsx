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
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
        backgroundImage: `url('/image_optimized.webp')`,
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
        preload="metadata"
        poster="/image_optimized.webp"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <source src="/bg_video_fast.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Overlay to ensure high-contrast readability without blurring the video */}
      <Box className="absolute inset-0 bg-slate-950/40 z-0" />

      {/* Central High-Transparency Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-[32px] backdrop-blur-xl bg-slate-950/70 dark:bg-slate-950/80 border border-white/10 dark:border-white/10 shadow-2xl flex flex-col items-center text-center space-y-6"
      >
        {/* App Logo */}
        <Box className="flex flex-col items-center space-y-2">
          <SpaIcon className="text-5xl drop-shadow-md animate-pulse" style={{ color: '#f97316' }} />
          <Typography 
            variant="h4" 
            className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-lg"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Character Coach
          </Typography>
        </Box>

        {/* Serene Tagline */}
        <Box className="space-y-2">
          <Typography 
            variant="h6" 
            className="font-serif italic font-semibold text-amber-200 leading-relaxed drop-shadow-md max-w-xs mx-auto text-base sm:text-lg"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            “To be and to make, that is the whole secret.”
          </Typography>
          <Typography 
            variant="body2" 
            className="text-slate-200/90 text-sm max-w-xs mx-auto leading-relaxed font-light tracking-wide drop-shadow-sm"
          >
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

        <Box className="w-full mt-6 pt-12 border-t border-white/10 dark:border-white/15">
          <Box className="flex items-center text-left space-x-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
            <Box className="flex-shrink-0">
              <img
                src="/NLakshminarayanaNaidu_optimized.webp"
                alt="N. Lakshminarayana Naidu"
                className="w-32 h-42 rounded-2xl object-contain bg-slate-950/40 p-1 border-2 border-orange-500/60 dark:border-orange-400/60 shadow-md transition-all duration-300 hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </Box>
            <Box className="flex-grow min-w-0 space-y-1">
              <Typography 
                variant="body2" 
                className="text-slate-200 leading-relaxed font-serif text-[13px] italic font-light drop-shadow-sm"
              >
                Dedicated to <strong className="text-orange-300 font-semibold">N. Lakshminarayana Naidu</strong> for 30+ years of outstanding leadership promoting the message of self-reflection.
              </Typography>
              <a
                href="http://vvym.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors drop-shadow-sm group mt-1"
              >
                <span>vvym.blogspot.com</span>
                <svg 
                  className="w-3.5 h-3.5 ml-1 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;
