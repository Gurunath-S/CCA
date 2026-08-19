import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Spa as SpaIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

import PrivacyPolicyDialog from '../components/PrivacyPolicyDialog';
import AppInfoDialog from '../components/AppInfoDialog';

const Login = () => {
  const { setRedirectSession, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [loginError, setLoginError] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [videoSrc, setVideoSrc] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setVideoSrc('/background_light_waves_720p.mp4');
    } else {
      setVideoSrc('/background_light_waves.mp4');
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Video autoplay failed or blocked:', err);
        });
      }
    }
  }, [videoSrc]);

  // Handle redirect mode callback tokens from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUser = searchParams.get('isNewUser');
    const redirectError = searchParams.get('error');

    if (redirectError) {
      setLoginError(decodeURIComponent(redirectError));
      navigate('/login', { replace: true });
    } else if (accessToken || isNewUser !== null) {
      navigate('/login', { replace: true });

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
      const btnContainer = document.getElementById("google-signin-button");
      if (window.google && btnContainer) {
        const apiBaseUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
          : 'http://localhost:5000';

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          ux_mode: "redirect",
          login_uri: `${apiBaseUrl}/api/auth/google`
        });
        
        window.google.accounts.id.renderButton(
          btnContainer,
          { 
            theme: "filled_blue", 
            size: "large", 
            width: 220, 
            text: "signin_with", 
            shape: "pill" 
          }
        );
      } else if (window.google && !btnContainer) {
        setTimeout(initializeGoogleSignIn, 100);
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

  if (isLoading) {
    return (
      <Box 
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950"
        style={{
          backgroundImage: `url('/image_optimized.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Crisp Full-Screen Background Video */}
        {videoSrc && (
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            poster="/image_optimized.webp"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        )}

        {/* Subtle Overlay */}
        <Box className="absolute inset-0 bg-slate-950/40 z-0" />

        {/* Beautiful Glassmorphic Loader Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-sm w-full p-8 rounded-[32px] backdrop-blur-xl bg-slate-950/70 border border-white/10 shadow-2xl flex flex-col items-center text-center space-y-6"
        >
          <CircularProgress size={44} style={{ color: '#f97316' }} />
          <Box className="space-y-2">
            <Typography variant="h6" className="font-serif font-semibold text-amber-100 tracking-wide">
              Verifying Session
            </Typography>
            <Typography variant="body2" className="text-slate-300 text-xs leading-relaxed max-w-[240px]">
              Establishing a secure connection to your Character Coach dashboard. Please wait...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

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
      {videoSrc && (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster="/image_optimized.webp"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      )}

      {/* Subtle Overlay to ensure high-contrast readability without blurring the video */}
      <Box className="absolute inset-0 bg-slate-950/25 z-0" />

      {/* Central High-Transparency Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-[32px] backdrop-blur-xl bg-slate-950/70 dark:bg-slate-950/80 border border-white/10 dark:border-white/10 shadow-2xl flex flex-col items-center text-center space-y-6"
      >
        {/* App Logo */}
        <Box className="flex flex-col items-center space-y-2 w-full relative">
          <SpaIcon className="text-5xl drop-shadow-md" style={{ color: '#f97316' }} />
          <Box className="flex items-center justify-center gap-1.5 w-full relative">
            <Typography 
              variant="h4" 
              className="font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-lg pl-6"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Character Coach
            </Typography>
            <IconButton 
              size="small"
              onClick={() => setInfoOpen(true)}
              className="text-slate-400 hover:text-orange-400 transition-colors"
              title="Learn about Character Coach"
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Serene Tagline */}
        <Box className="space-y-1">
          <Typography 
            variant="h6" 
            className="font-serif italic font-semibold text-amber-200 leading-relaxed drop-shadow-md max-w-xs mx-auto text-base sm:text-lg"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            “You have to grow from the inside out.”
          </Typography>
          <Typography 
            variant="body2" 
            className="text-slate-300 text-xs max-w-xs mx-auto leading-relaxed font-light tracking-wide"
          >
            Understand your character. Reflect on your strengths. Grow intentionally.
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
            <>
              {/* Official Google Sign-In Button Container */}
              <div 
                id="google-signin-button" 
                className="min-h-[46px] flex items-center justify-center transition-transform hover:scale-[1.02]"
              />

              {/* Auxiliary Actions */}
              <Box className="flex flex-col items-center mt-6 px-4">
                <Typography 
                  variant="caption" 
                  className="text-slate-400 text-[11px] text-center max-w-[280px] leading-relaxed select-none"
                >
                  By signing in, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 bg-transparent border-0 cursor-pointer p-0 inline transition-colors"
                  >
                    Privacy Policy
                  </button>
                  . We do not collect mandatory personal information.
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <PrivacyPolicyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        <AppInfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />

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
                className="text-slate-200 leading-relaxed font-serif text-[15px] italic font-light drop-shadow-sm"
              >
                Dedicated to <strong className="text-orange-300 font-semibold">N. Lakshminarayana Naidu</strong> for 30+ years of outstanding leadership promoting the message of self-reflection.
              </Typography>
              <a
                href="http://vvym.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors drop-shadow-sm group mt-1"
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
