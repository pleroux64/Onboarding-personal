import { createContext, useContext, useMemo, useState } from 'react';

const ProgressBarContext = createContext();

export const useProgressBar = () => useContext(ProgressBarContext);

const ProgressBarProvider = ({ children }) => {
  const [steps, setSteps] = useState([
    { label: 'Welcome', status: 'inactive' },
    { label: 'Profile Setup', status: 'inactive' },
    { label: 'System Configurations', status: 'inactive' },
    { label: 'Final Steps', status: 'inactive' },
  ]);

  const updateStepStatus = (newActiveStep) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        if (index < newActiveStep) return { ...step, status: 'completed' };
        if (index === newActiveStep) return { ...step, status: 'active' };
        return { ...step, status: 'inactive' };
      })
    );
  };

  const [activeStep, setActiveStep] = useState(0);

  const handleSetActiveStep = (stepIndex) => {
    setActiveStep(stepIndex);
    updateStepStatus(stepIndex);
  };

  const memoizedValue = useMemo(
    () => ({ steps, activeStep, setActiveStep: handleSetActiveStep }),
    [steps, activeStep]
  );

  return (
    <ProgressBarContext.Provider value={memoizedValue}>
      {children}
    </ProgressBarContext.Provider>
  );
};

export default ProgressBarProvider;
