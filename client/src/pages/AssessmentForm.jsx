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
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  CalendarMonth as DateIcon,
  Spa as SpaIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle as SubmitIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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
  personalNote: z.string().max(1000, 'Note should not exceed 1000 characters').optional()
});

const AssessmentForm = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { characters, fetchCharacters, submitAssessment } = useCharacterStore();
  const [selectedChar, setSelectedChar] = useState(null);
  const [submitError, setSubmitError] = useState('');

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
    setValue
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
    <Box className="space-y-6 max-w-3xl mx-auto">
      {/* Top Navigation Row */}
      <Box className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/characters')}
          startIcon={<ChevronLeftIcon />}
          className="text-slate-500 hover:text-slate-700"
        >
          Back to List
        </Button>
      </Box>

      {/* Header */}
      <Box className="text-center p-6 bg-orange-50/50 dark:bg-orange-950/10 rounded-3xl border border-orange-100/50 dark:border-orange-900/10">
        <SpaIcon className="text-orange-500 text-4xl mb-2 animate-float" />
        <Typography variant="h4" className="font-serif font-bold text-slate-800 dark:text-slate-100">
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

      {submitError && (
        <Alert severity="error" className="rounded-xl">
          {submitError}
        </Alert>
      )}

      {/* Assessment Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl">
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* 1. Date of Assessment */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
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
                    className="bg-white dark:bg-slate-800 max-w-xs"
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />
                )}
              />
            </Box>

            <Divider className="opacity-10" />

            {/* 2. Alignment Slider */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                2. How aligned are you with this character trait in your daily routine?
              </Typography>
              <Typography variant="body2" className="text-slate-400 text-xs">
                (1: Not at all aligned — 5: Fully aligned)
              </Typography>
              <Box className="px-6 pt-6 pb-2">
                <Controller
                  name="alignmentScore"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      {...field}
                      min={1}
                      max={5}
                      step={1}
                      marks={[
                        { value: 1, label: '1 - Disaligned' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3 - Neutral' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5 - Fully Aligned' }
                      ]}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  )}
                />
              </Box>
            </Box>

            <Divider className="opacity-10" />

            {/* 3. Recognition */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                3. Do others recognize this trait in your behavior?
              </Typography>
              <Controller
                name="othersRecognize"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.othersRecognize} component="fieldset" className="w-full">
                    <RadioGroup {...field} className="space-y-1">
                      <FormControlLabel
                        value="Yes - Regularly"
                        control={<Radio />}
                        label="Yes - Regularly"
                        className="text-sm"
                      />
                      <FormControlLabel
                        value="Yes - Sometimes"
                        control={<Radio />}
                        label="Yes - Sometimes"
                        className="text-sm"
                      />
                      <FormControlLabel
                        value="No - Not at all"
                        control={<Radio />}
                        label="No - Not at all"
                        className="text-sm"
                      />
                      <FormControlLabel
                        value="Others remind me for not having this trait"
                        control={<Radio />}
                        label="Others remind me for not having this trait"
                        className="text-sm"
                      />
                    </RadioGroup>
                    {errors.othersRecognize && (
                      <Typography variant="caption" className="text-red-500 ml-3">
                        {errors.othersRecognize.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Divider className="opacity-10" />

            {/* 4. Conscious Effort */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                4. Are you making conscious effort to build/strengthen this character trait?
              </Typography>
              <Controller
                name="consciousEffort"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.consciousEffort} component="fieldset">
                    <RadioGroup {...field} row className="gap-6">
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                    {errors.consciousEffort && (
                      <Typography variant="caption" className="text-red-500">
                        {errors.consciousEffort.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Divider className="opacity-10" />

            {/* 5. Level of Effort */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                5. What level of effort do you put into practicing this trait?
              </Typography>
              <Controller
                name="effortLevel"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.effortLevel} component="fieldset" className="w-full">
                    <RadioGroup {...field} className="space-y-1">
                      <FormControlLabel
                        value="I am aware of this trait in my action but hard to practice"
                        control={<Radio />}
                        label="I am aware of this trait in my action but hard to practice"
                      />
                      <FormControlLabel
                        value="I catch myself for not following this and make effort to correct"
                        control={<Radio />}
                        label="I catch myself for not following this and make effort to correct"
                      />
                      <FormControlLabel
                        value="I am able to practice this without lot of effort"
                        control={<Radio />}
                        label="I am able to practice this without lot of effort"
                      />
                    </RadioGroup>
                    {errors.effortLevel && (
                      <Typography variant="caption" className="text-red-500 ml-3">
                        {errors.effortLevel.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Divider className="opacity-10" />

            {/* 6. Practice Frequency */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                6. How many times did you consciously put in effort for this trait recently?
              </Typography>
              <Controller
                name="practiceFrequency"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.practiceFrequency} component="fieldset" className="w-full">
                    <RadioGroup {...field} className="space-y-1">
                      <FormControlLabel
                        value="Didn’t get to practice this"
                        control={<Radio />}
                        label="Didn’t get to practice this"
                      />
                      <FormControlLabel
                        value="1 - 5 times"
                        control={<Radio />}
                        label="1 - 5 times"
                      />
                      <FormControlLabel
                        value="More than 5 times"
                        control={<Radio />}
                        label="More than 5 times"
                      />
                    </RadioGroup>
                    {errors.practiceFrequency && (
                      <Typography variant="caption" className="text-red-500 ml-3">
                        {errors.practiceFrequency.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Divider className="opacity-10" />

            {/* 7. Personal Note */}
            <Box className="space-y-2">
              <Typography variant="subtitle1" className="font-semibold text-slate-800 dark:text-slate-200">
                7. A note to yourself about this assessment (optional self-reflection)
              </Typography>
              <Controller
                name="personalNote"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={4}
                    placeholder="Reflect on instances when you practiced or missed this trait, why it was difficult/easy, and what you plan to do next..."
                    fullWidth
                    error={!!errors.personalNote}
                    helperText={errors.personalNote?.message}
                    className="bg-white dark:bg-slate-800 rounded-xl"
                    slotProps={{
                      input: { className: 'rounded-xl' }
                    }}
                  />
                )}
              />
            </Box>

            {/* Action Buttons */}
            <Box className="pt-4 flex gap-4">
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon />}
                className="py-3.5 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white rounded-xl font-semibold shadow-md"
              >
                {isSubmitting ? 'Saving Assessment...' : 'Submit Assessment'}
              </Button>
            </Box>

          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default AssessmentForm;
