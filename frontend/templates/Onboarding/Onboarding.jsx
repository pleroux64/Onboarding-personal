import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import Complete from './Complete';
import FinalSteps from './FinalSteps';
import ProfileSetupForm from './ProfileSetupForm';
import SystemConfigs from './SystemConfigs/SystemsConfig';
import Welcome from './Welcome';

import {
  setCompleted,
  setStep,
  setTempData,
} from '@/redux/slices/onboardingSlice';
import { firestore } from '@/redux/store';
import { updateUserData } from '@/redux/thunks/user';

const onboardingComponents = {
  0: Welcome,
  1: ProfileSetupForm,
  2: SystemConfigs,
  3: FinalSteps,
  4: Complete,
};

const OnboardingPage = ({ onboardingData }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { step, tempData } = useSelector((state) => state.onboarding);

  useEffect(() => {
    if (onboardingData.id !== step) {
      dispatch(setStep(onboardingData.id)); // Ensure the Redux state is in sync with the URL
    }
  }, [dispatch, onboardingData.id, step]);

  const handleNext = (formData = {}) => {
    if (onboardingComponents[onboardingData.id] === ProfileSetupForm) {
      dispatch(setTempData(formData)); // Store form data in Redux
    }

    if (onboardingComponents[onboardingData.id] === Complete) {
      localStorage.setItem('needsBoarding', false);
      dispatch(
        updateUserData({
          firestore,
          data: { ...tempData, needsBoarding: false },
        })
      );
      dispatch(setCompleted(true));
    }

    if (onboardingComponents[onboardingData.id] === Complete) {
      router.push('/');
    } else {
      dispatch(setStep(onboardingData.id + 1)); // Update the step in Redux
      router.push(`/onboarding/${onboardingData.id + 1}`);
    }
  };

  const SpecificOnboardingScreen =
    onboardingComponents[onboardingData.id] || Welcome;

  return <SpecificOnboardingScreen onNext={handleNext} tempData={tempData} />;
};

export default OnboardingPage;
