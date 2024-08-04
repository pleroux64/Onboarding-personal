// hooks/useOnboardingStatus.js
import { useEffect, useState } from 'react';

const useOnboardingStatus = () => {
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  useEffect(() => {
    const cachedOnboardingStatus = localStorage.getItem('needsBoarding');
    if (cachedOnboardingStatus !== null) {
      setOnboardingStatus(cachedOnboardingStatus === 'true');
    }
  }, []);

  return onboardingStatus;
};

export default useOnboardingStatus;
