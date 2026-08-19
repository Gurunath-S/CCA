import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCharacterStore } from '../store/useCharacterStore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Grid,
  Radio
} from '@mui/material';
import {
  Spa as SpaIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle as SubmitIcon,
  ThumbUp as ThumbUpIcon,
  People as PeopleIcon,
  PersonOff as PersonOffIcon,
  NotificationImportant as WarnIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  OfflinePin as PinIcon,
  OfflineBolt as BoltIcon,
  MenuBook as BookIcon,
  CalendarToday as DateRangeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote'],
    ['clean']
  ]
};

const quillFormats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote'
];

// Zod Validation Schema matching form requirements
const assessmentSchema = z.object({
  assessmentDate: z.string().min(1, 'Assessment date is required'),
  alignmentScore: z.number().min(1).max(5),
  othersRecognize: z.string().min(1, 'Please select an option').refine(val => [
    'Yes - Regularly',
    'Yes - Sometimes',
    'No - Not at all',
    'Others remind me for not having this trait'
  ].includes(val), 'Invalid option selected'),
  consciousEffort: z.string().min(1, 'Please select an option').refine(val => ['Yes', 'No'].includes(val), 'Invalid option selected'),
  effortLevel: z.string().min(1, 'Please select an option').refine(val => [
    'I am aware of this trait in my action but hard to practice',
    'I catch myself for not following this and make effort to correct',
    'I am able to practice this without lot of effort'
  ].includes(val), 'Invalid option selected'),
  practiceFrequency: z.string().min(1, 'Please select an option').refine(val => [
    'Didn’t get to practice this',
    '1 - 5 times',
    'More than 5 times'
  ].includes(val), 'Invalid option selected'),
  personalNote: z.string().max(5000, 'Note should not exceed 5000 characters').optional()
});

const alignmentOptions = [
  { value: 1, label: 'Not Aligned', color: '#ef4444', desc: 'I am not practicing this trait at all in my routine.' },
  { value: 2, label: 'Slightly Aligned', color: '#f97316', desc: 'I rarely practice this trait, only when reminded.' },
  { value: 3, label: 'Neutral / Average', color: '#eab308', desc: 'I practice this trait sometimes, with mixed results.' },
  { value: 4, label: 'Aligned', color: '#10b981', desc: 'I practice this trait regularly and feel good about it.' },
  { value: 5, label: 'Fully Aligned', color: '#059669', desc: 'This trait is natural to me and integrated into my day.' }
];

const SelectionCard = ({ selected, onClick, label, description, icon, activeColor = '#f97316' }) => {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Paper
        onClick={onClick}
        elevation={0}
        sx={{
          p: 2.5,
          border: '2px solid',
          borderColor: selected ? activeColor : 'var(--color-border, rgba(0, 0, 0, 0.08))',
          borderRadius: '20px',
          cursor: 'pointer',
          bgcolor: selected ? `${activeColor}06` : 'var(--color-bg-paper, #ffffff)',
          transition: 'all 0.2s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          boxShadow: selected ? `0 10px 15px -3px ${activeColor}08` : 'none',
          '&:hover': {
            borderColor: selected ? activeColor : 'rgba(249, 115, 22, 0.3)',
            bgcolor: selected ? `${activeColor}0a` : 'rgba(0, 0, 0, 0.01)'
          }
        }}
      >
        <Radio
          checked={selected}
          sx={{
            p: 0,
            color: 'var(--color-border, rgba(0,0,0,0.15))',
            '&.Mui-checked': { color: activeColor }
          }}
        />
        {icon && (
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '12px',
            bgcolor: selected ? `${activeColor}15` : 'rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? activeColor : 'text.secondary',
            flexShrink: 0
          }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3, lineHeight: 1.3 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

const slideVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2, ease: 'easeIn' } }
};

const AssessmentForm = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { characters, fetchCharacters, submitAssessment } = useCharacterStore();
  const [selectedChar, setSelectedChar] = useState(null);
  const [submitError, setSubmitError] = useState('');
  
  // Wizard steps state
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Alignment & Timing", description: "Rate your alignment" },
    { title: "Recognition & Intent", description: "Others' perspective" },
    { title: "Effort & Frequency", description: "Recent practices" },
    { title: "Reflection & Submit", description: "Personal notes" }
  ];

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters();
    } else {
      const found = characters.find(c => c.id === characterId);
      if (found) {
        setSelectedChar(found);
      }
    }
  }, [characters, characterId, fetchCharacters]);

  // Set up React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    watch
  } = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().split('T')[0], // yyyy-mm-dd format
      alignmentScore: 3,
      othersRecognize: '',
      consciousEffort: '',
      effortLevel: '',
      practiceFrequency: '',
      personalNote: ''
    }
  });

  // Watch fields for custom interactive state updates
  const alignmentScore = watch('alignmentScore');
  const othersRecognize = watch('othersRecognize');
  const consciousEffort = watch('consciousEffort');
  const effortLevel = watch('effortLevel');
  const practiceFrequency = watch('practiceFrequency');

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['assessmentDate', 'alignmentScore'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['othersRecognize', 'consciousEffort'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['effortLevel', 'practiceFrequency'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      // Map 'Yes'/'No' consciousEffort to Boolean for API
      const payload = {
        characterId,
        ...data,
        consciousEffort: data.consciousEffort === 'Yes'
      };

      await submitAssessment(payload);
      
      // Navigate to aggregate statistics after saving
      navigate(`/aggregate/${characterId}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit assessment. Please check details.');
    }
  };

  if (!selectedChar) {
    return (
      <Box className="flex flex-col items-center justify-center p-12">
        <CircularProgress className="text-orange-500" />
        <Typography className="text-slate-400 mt-3">Loading character details...</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6 max-w-3xl mx-auto px-4 sm:px-0">
      {/* Top Navigation Row */}
      <Box className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/characters')}
          startIcon={<ChevronLeftIcon />}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Back to List
        </Button>
      </Box>

      {/* Header */}
      <Box className="text-center p-6 bg-orange-50/40 dark:bg-orange-950/10 rounded-3xl border border-orange-100/50 dark:border-orange-900/10">
        <SpaIcon className="text-orange-500 text-4xl mb-2 animate-float" />
        <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100" sx={{ fontFamily: '"Playfair Display", serif' }}>
          Character Assessment
        </Typography>
        <Typography variant="h5" className="text-orange-600 dark:text-orange-400 font-semibold mt-1">
          {selectedChar.name}
        </Typography>
        {selectedChar.description && (
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 italic text-sm">
            "{selectedChar.description}"
          </Typography>
        )}
      </Box>

      <Snackbar
        open={Boolean(submitError)}
        autoHideDuration={5000}
        onClose={() => setSubmitError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSubmitError('')} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            bgcolor: 'error.main',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          {submitError}
        </Alert>
      </Snackbar>

      {/* Stepper Progress Bar */}
      <Box className="w-full bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <Box className="flex justify-between items-center mb-2">
          <Typography variant="caption" className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}
          </Typography>
          <Typography variant="body2" className="text-orange-500 font-bold">
            {steps[currentStep].title}
          </Typography>
        </Box>
        <Box className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </Box>
      </Box>

      {/* Assessment Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Step 0: Alignment & Timing */}
                {currentStep === 0 && (
                  <Box className="space-y-6">
                    <Box className="space-y-2">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <DateRangeIcon className="text-orange-500" fontSize="small" />
                        1. Date of Assessment
                      </Typography>
                      <Controller
                        name="assessmentDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            fullWidth
                            error={!!errors.assessmentDate}
                            helperText={errors.assessmentDate?.message}
                            sx={{
                              maxWidth: '240px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                bgcolor: 'var(--color-bg-paper, #ffffff)',
                                '& fieldset': { borderColor: 'var(--color-border, rgba(0,0,0,0.1))' }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>

                    <Divider className="opacity-10 my-4" />

                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200">
                        2. How aligned are you with this character trait in your daily routine?
                      </Typography>
                      <Typography variant="body2" className="text-slate-400 text-xs">
                        Select one of the alignment levels below:
                      </Typography>

                      <Grid container spacing={2} className="pt-2">
                        {alignmentOptions.map((opt) => {
                          const isSelected = alignmentScore === opt.value;
                          return (
                            <Grid item xs={6} sm={2.4} key={opt.value}>
                              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Paper
                                  onClick={() => setValue('alignmentScore', opt.value, { shouldValidate: true })}
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    borderRadius: '24px',
                                    border: '2px solid',
                                    borderColor: isSelected ? opt.color : 'var(--color-border, rgba(0, 0, 0, 0.08))',
                                    bgcolor: isSelected ? `${opt.color}08` : 'var(--color-bg-paper, #ffffff)',
                                    boxShadow: isSelected ? `0 10px 15px -3px ${opt.color}15` : 'none',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      borderColor: isSelected ? opt.color : 'rgba(249, 115, 22, 0.3)',
                                      bgcolor: isSelected ? `${opt.color}10` : 'rgba(0, 0, 0, 0.01)'
                                    }
                                  }}
                                >
                                  <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    bgcolor: isSelected ? opt.color : 'rgba(0, 0, 0, 0.04)',
                                    color: isSelected ? '#ffffff' : 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: 850,
                                    mb: 1.5,
                                    boxShadow: isSelected ? `0 4px 10px ${opt.color}40` : 'none',
                                    transition: 'all 0.2s'
                                  }}>
                                    {opt.value}
                                  </Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                                    {opt.label}
                                  </Typography>
                                </Paper>
                              </motion.div>
                            </Grid>
                          );
                        })}
                      </Grid>

                      {alignmentScore && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          <Box sx={{
                            mt: 3,
                            p: 2.5,
                            borderRadius: '20px',
                            bgcolor: 'rgba(249, 115, 22, 0.03)',
                            border: '1px solid rgba(249, 115, 22, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: alignmentOptions.find(o => o.value === alignmentScore)?.color,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {alignmentScore}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f97316' }}>
                                Selected: {alignmentOptions.find(o => o.value === alignmentScore)?.label}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>
                                {alignmentOptions.find(o => o.value === alignmentScore)?.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Step 1: Recognition & Intent */}
                {currentStep === 1 && (
                  <Box className="space-y-6">
                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200">
                        3. Do others recognize this trait in your behavior?
                      </Typography>
                      <Box className="flex flex-col gap-3">
                        {[
                          {
                            value: 'Yes - Regularly',
                            label: 'Yes - Regularly',
                            desc: 'Others frequently notice and appreciate this trait in my daily interactions.',
                            icon: <ThumbUpIcon fontSize="small" />,
                            color: '#10b981'
                          },
                          {
                            value: 'Yes - Sometimes',
                            label: 'Yes - Sometimes',
                            desc: 'It is recognized occasionally, depending on the situation.',
                            icon: <PeopleIcon fontSize="small" />,
                            color: '#3b82f6'
                          },
                          {
                            value: 'No - Not at all',
                            label: 'No - Not at all',
                            desc: 'This trait is not visible or noticed by others in my actions.',
                            icon: <PersonOffIcon fontSize="small" />,
                            color: '#ef4444'
                          },
                          {
                            value: 'Others remind me for not having this trait',
                            label: 'Others remind me for not having this trait',
                            desc: 'I receive active feedback or reminders about the absence of this trait.',
                            icon: <WarnIcon fontSize="small" />,
                            color: '#eab308'
                          }
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.value}
                            label={opt.label}
                            description={opt.desc}
                            icon={opt.icon}
                            activeColor={opt.color}
                            selected={othersRecognize === opt.value}
                            onClick={() => setValue('othersRecognize', opt.value, { shouldValidate: true })}
                          />
                        ))}
                      </Box>
                      {errors.othersRecognize && (
                        <Typography variant="caption" className="text-red-500 block mt-1 ml-1">
                          {errors.othersRecognize.message}
                        </Typography>
                      )}
                    </Box>

                    <Divider className="opacity-10 my-4" />

                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200">
                        4. Are you making conscious effort to build/strengthen this character trait?
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { value: 'Yes', label: 'Yes, absolutely', desc: 'I am actively trying to practice and improve.', icon: <PinIcon fontSize="small" />, color: '#10b981' },
                          { value: 'No', label: 'No, not right now', desc: 'I am not currently prioritizing this trait.', icon: <PersonOffIcon fontSize="small" />, color: '#ef4444' }
                        ].map((opt) => (
                          <Grid item xs={12} sm={6} key={opt.value}>
                            <SelectionCard
                              label={opt.label}
                              description={opt.desc}
                              icon={opt.icon}
                              activeColor={opt.color}
                              selected={consciousEffort === opt.value}
                              onClick={() => setValue('consciousEffort', opt.value, { shouldValidate: true })}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      {errors.consciousEffort && (
                        <Typography variant="caption" className="text-red-500 block mt-1 ml-1">
                          {errors.consciousEffort.message}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Step 2: Effort & Frequency */}
                {currentStep === 2 && (
                  <Box className="space-y-6">
                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200">
                        5. What level of effort do you put into practicing this trait?
                      </Typography>
                      <Box className="flex flex-col gap-3">
                        {[
                          {
                            value: 'I am aware of this trait in my action but hard to practice',
                            label: 'Aware but hard to practice',
                            desc: 'I know it is important but struggle to actually practice it in the moment.',
                            icon: <BoltIcon fontSize="small" />,
                            color: '#f97316'
                          },
                          {
                            value: 'I catch myself for not following this and make effort to correct',
                            label: 'Catch and correct myself',
                            desc: 'I actively monitor my actions and adjust my behavior when I drift.',
                            icon: <WarnIcon fontSize="small" />,
                            color: '#3b82f6'
                          },
                          {
                            value: 'I am able to practice this without lot of effort',
                            label: 'Practicing naturally with ease',
                            desc: 'This trait comes easily to me and is integrated into my behavior.',
                            icon: <PinIcon fontSize="small" />,
                            color: '#10b981'
                          }
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.value}
                            label={opt.label}
                            description={opt.desc}
                            icon={opt.icon}
                            activeColor={opt.color}
                            selected={effortLevel === opt.value}
                            onClick={() => setValue('effortLevel', opt.value, { shouldValidate: true })}
                          />
                        ))}
                      </Box>
                      {errors.effortLevel && (
                        <Typography variant="caption" className="text-red-500 block mt-1 ml-1">
                          {errors.effortLevel.message}
                        </Typography>
                      )}
                    </Box>

                    <Divider className="opacity-10 my-4" />

                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200">
                        6. How many times did you consciously put in effort for this trait recently?
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { value: 'Didn’t get to practice this', label: '0 Times', desc: 'No opportunities or attempts.', icon: <PersonOffIcon fontSize="small" />, color: '#ef4444' },
                          { value: '1 - 5 times', label: '1 - 5 Times', desc: 'Occasional intentional practices.', icon: <PeopleIcon fontSize="small" />, color: '#eab308' },
                          { value: 'More than 5 times', label: 'More than 5 Times', desc: 'Frequent, regular practices.', icon: <ThumbUpIcon fontSize="small" />, color: '#10b981' }
                        ].map((opt) => (
                          <Grid item xs={12} sm={4} key={opt.value}>
                            <SelectionCard
                              label={opt.label}
                              description={opt.desc}
                              icon={opt.icon}
                              activeColor={opt.color}
                              selected={practiceFrequency === opt.value}
                              onClick={() => setValue('practiceFrequency', opt.value, { shouldValidate: true })}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      {errors.practiceFrequency && (
                        <Typography variant="caption" className="text-red-500 block mt-1 ml-1">
                          {errors.practiceFrequency.message}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Step 3: Reflection & Submit */}
                {currentStep === 3 && (
                  <Box className="space-y-6">
                    <Box className="space-y-3">
                      <Typography variant="subtitle1" className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <BookIcon className="text-orange-500" fontSize="small" />
                        7. A note to yourself about this assessment (optional self-reflection)
                      </Typography>
                      <Typography variant="body2" className="text-slate-400 text-xs">
                        Reflect on instances when you practiced or missed this trait, why it was difficult/easy, and what you plan to do next.
                      </Typography>
                      <Controller
                        name="personalNote"
                        control={control}
                        render={({ field }) => (
                          <Box className="space-y-1">
                            <Box className="bg-white dark:bg-slate-850 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                              <ReactQuill
                                theme="snow"
                                value={field.value || ''}
                                onChange={field.onChange}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Type your reflections here..."
                              />
                            </Box>
                            {errors.personalNote && (
                              <Typography variant="caption" className="text-red-500 block mt-1 ml-1">
                                {errors.personalNote.message}
                              </Typography>
                            )}
                          </Box>
                        )}
                      />
                    </Box>
                  </Box>
                )}

                {/* Bottom Navigation Buttons */}
                <Box className="pt-6 flex justify-between items-center gap-4">
                  <Button
                    disabled={currentStep === 0 || isSubmitting}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: '16px',
                      border: '1.5px solid var(--color-border, rgba(0,0,0,0.1))',
                      color: 'text.secondary',
                      textTransform: 'none',
                      px: 3.5,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'text.primary',
                        bgcolor: 'rgba(0,0,0,0.04)',
                        color: 'text.primary'
                      },
                      '&.Mui-disabled': {
                        borderColor: 'rgba(0,0,0,0.04)',
                        color: 'rgba(0,0,0,0.25)'
                      }
                    }}
                  >
                    Back
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                      variant="contained"
                      sx={{
                        borderRadius: '16px',
                        bgcolor: '#f97316',
                        color: '#ffffff',
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#ea580c',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon />}
                      variant="contained"
                      sx={{
                        borderRadius: '16px',
                        bgcolor: '#10b981',
                        color: '#ffffff',
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#059669',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {isSubmitting ? 'Saving Assessment...' : 'Submit Assessment'}
                    </Button>
                  )}
                </Box>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default AssessmentForm;
