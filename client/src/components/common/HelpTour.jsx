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
    content: 'Your main navigation controls:\n• Dashboard: View streaks, daily traits, and start quick assessments.\n• Character Attributes: Explore all virtues, or create custom ones.\n• Assessment History: Trace progress charts and past assessment logs.\n• Reflective Journal: Review and search your personal reflection notes.\n• Inspiration: Find daily quotes and wisdom for contemplation.\n• Settings: Adjust streak type, change UI themes, or export data.',
    placement: 'right',
    padding: 0
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

  const getActiveStepData = () => {
    const step = { ...steps[currentStep] };
    const element = document.getElementById(step.target);
    
    // Adapt target, padding and contents if sidebar is requested but hidden on mobile
    if (step.target === 'tour-sidebar' && !element && document.getElementById('tour-mobile-menu')) {
      return {
        ...step,
        placement: 'bottom',
        padding: 8,
        content: 'Tap the Menu Icon to open the Sidebar and navigate between:\n• Dashboard & Streaks\n• Character Attributes (virtues library)\n• Assessment History & Reflective Journal\n• Inspiration & Settings'
      };
    }
    return step;
  };

  const activeStep = getActiveStepData();

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      return;
    }

    const step = getActiveStepData();
    let element = document.getElementById(step.target);

    // Fallback for mobile sidebar target
    if (step.target === 'tour-sidebar' && !element) {
      element = document.getElementById('tour-mobile-menu');
    }

    const updatePosition = () => {
      if (element) {
        const rect = element.getBoundingClientRect();
        const pad = step.padding !== undefined ? step.padding : 12;

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

    // Calculate position immediately to avoid coordinate jump/flicker
    updatePosition();

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
                bgcolor: 'background.paper',
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
                  {activeStep.title}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {activeStep.content}
              </Typography>

              {/* Coming Up Next preview box */}
              {currentStep < steps.length - 1 && (
                <Box sx={{ mb: 3, p: 1.5, bgcolor: 'action.hover', borderRadius: '12px', border: '1px dashed var(--color-border, rgba(0, 0, 0, 0.08))' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#f97316', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                    Coming Up Next
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {steps[currentStep + 1].title}
                  </Typography>
                </Box>
              )}

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

                  {currentStep < steps.length - 1 && (
                    <Button
                      size="small"
                      onClick={onClose}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        color: 'text.secondary',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)', color: '#f97316' }
                      }}
                    >
                      Skip
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
