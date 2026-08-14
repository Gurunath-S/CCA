import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, IconButton, MobileStepper } from '@mui/material';
import { Close as CloseIcon, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    target: 'tour-welcome-banner',
    title: 'Welcome to Character Coach!',
    content: 'This is your personal growth dashboard. Here you will track your character development progress, get daily insights, and take assessments.',
    placement: 'bottom'
  },
  {
    target: 'tour-sidebar',
    title: 'Navigation Sidebar',
    content: 'Easily navigate between the Dashboard, list of Character Attributes, Assessment History, Reflective Journal, and your Account Settings.',
    placement: 'right'
  },
  {
    target: 'tour-stats-streak',
    title: 'Reflection Streak',
    content: 'Consistency is key to personal growth. Track your daily reflection streak here and see your best performance.',
    placement: 'bottom'
  },
  {
    target: 'tour-daily-insight',
    title: 'Daily Trait Insight',
    content: 'A curated daily character trait from the Yama and Niyama aspects to contemplate and practice today.',
    placement: 'left'
  },
  {
    target: 'tour-quick-start',
    title: 'Quick Start Assessment',
    content: 'Ready for reflection? Choose any character attribute from this dropdown to start a quick self-assessment.',
    placement: 'left'
  }
];

export const HelpTour = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      return;
    }

    const step = steps[currentStep];
    const element = document.getElementById(step.target);

    const updatePosition = () => {
      if (element) {
        const rect = element.getBoundingClientRect();
        const pad = 12;

        setHighlightStyle({
          position: 'fixed',
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          borderRadius: '20px',
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.78)',
          zIndex: 9999,
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        // Calculate Tooltip placement
        const tooltipPad = 18;
        let tTop = 0;
        let tLeft = 0;

        if (step.placement === 'bottom') {
          tTop = rect.bottom + tooltipPad;
          tLeft = rect.left + (rect.width / 2) - 175;
        } else if (step.placement === 'top') {
          tTop = rect.top - 200 - tooltipPad;
          tLeft = rect.left + (rect.width / 2) - 175;
        } else if (step.placement === 'right') {
          tTop = rect.top + (rect.height / 2) - 100;
          tLeft = rect.right + tooltipPad;
        } else if (step.placement === 'left') {
          tTop = rect.top + (rect.height / 2) - 100;
          tLeft = rect.left - 350 - tooltipPad;
        }

        // Bound validation
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        tLeft = Math.max(16, Math.min(tLeft, viewportWidth - 350 - 16));
        tTop = Math.max(16, Math.min(tTop, viewportHeight - 240 - 16));

        setTooltipStyle({
          position: 'fixed',
          top: tTop,
          left: tLeft,
          width: '350px',
          zIndex: 10000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
      } else {
        // Fallback: center screen modal-style tooltip
        setHighlightStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.78)',
          zIndex: 9999,
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          zIndex: 10000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
      }
    };

    // Wait slightly to ensure rendering/animations of underlying elements are complete
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStep, open]);

  if (!open) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
      {/* Spotlight cutout mask */}
      {highlightStyle && (
        <Box 
          sx={{
            ...highlightStyle,
            pointerEvents: 'none',
            border: '2px solid rgba(249, 115, 22, 0.5)',
            boxSizing: 'border-box'
          }} 
        />
      )}

      {/* Interactive overlay block (blocks clicks on elements outside, but lets click through tooltip) */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'auto', bgcolor: 'transparent' }} />

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        {tooltipStyle && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              ...tooltipStyle,
              pointerEvents: 'auto'
            }}
          >
            <Paper
              elevation={24}
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: 'var(--color-bg-paper, #ffffff)',
                color: 'var(--color-text, #0f172a)',
                backgroundImage: 'none',
                border: '1px solid var(--color-border, rgba(0, 0, 0, 0.08))',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}
            >
              {/* Close / Skip button */}
              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  color: 'text.secondary',
                  '&:hover': { color: '#f97316' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <Box sx={{ pr: 2, mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif', color: 'inherit' }}>
                  {steps[currentStep].title}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                {steps[currentStep].content}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <MobileStepper
                  variant="dots"
                  steps={steps.length}
                  position="static"
                  activeStep={currentStep}
                  sx={{ 
                    bgcolor: 'transparent', 
                    p: 0,
                    '& .MuiMobileStepper-dot': {
                      bgcolor: 'var(--color-border, rgba(0,0,0,0.1))',
                      width: 6,
                      height: 6
                    },
                    '& .MuiMobileStepper-dotActive': {
                      bgcolor: '#f97316',
                      width: 16,
                      borderRadius: '4px'
                    }
                  }}
                  backButton={null}
                  nextButton={null}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {currentStep > 0 && (
                    <Button
                      size="small"
                      onClick={handleBack}
                      startIcon={<KeyboardArrowLeft />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        color: 'text.secondary',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    size="small"
                    onClick={handleNext}
                    variant="contained"
                    endIcon={currentStep === steps.length - 1 ? null : <KeyboardArrowRight />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      bgcolor: '#f97316',
                      color: '#ffffff',
                      fontWeight: 600,
                      boxShadow: 'none',
                      px: 2,
                      '&:hover': {
                        bgcolor: '#ea580c',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
