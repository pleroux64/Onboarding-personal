import { useEffect, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Step,
  StepButton,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  useStepContext,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import styles from './styles'; // Import styles

import { useProgressBar } from '@/providers/ProgressBarProvider';

const CustomStepConnector = () => {
  const { active, completed } = useStepContext();
  return <StepConnector {...styles.stpConnector(active, completed)} />;
};

const StepIcon = ({ step, active, completed }) => {
  if (!step) {
    return (
      <Grid {...styles.gridProps}>
        <Grid {...styles.containerProps}>
          {completed ? (
            <Grid {...styles.stepCircleCompleted} />
          ) : (
            <Grid {...styles.getStepCircleStyle(active)} />
          )}
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid {...styles.gridProps}>
      <Grid {...styles.containerProps}>
        {step.status === 'completed' ? (
          <Grid {...styles.stepCircleCompleted} />
        ) : (
          <Grid {...styles.getStepCircleStyle(step.status === 'active')} />
        )}
      </Grid>
    </Grid>
  );
};

const CustomStepper = () => {
  const { activeStep, steps } = useProgressBar();
  return (
    <Stepper
      activeStep={activeStep}
      connector={<CustomStepConnector />}
      {...styles.stepperProps}
    >
      {steps.map((_, index) => (
        <Step key={index}>
          <StepButton>
            <StepLabel StepIconComponent={StepIcon} />
          </StepButton>
        </Step>
      ))}
    </Stepper>
  );
};

const CustomAccordion = (props) => {
  const { expanded, handleChange } = props;
  const { steps } = useProgressBar();
  return (
    <Accordion
      expanded={expanded === 'panel'}
      onChange={handleChange('panel')}
      {...styles.accordionProps}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon {...styles.expandMoreIconProps} />}
        {...styles.accordionSummaryProps}
      >
        <CustomStepper />
      </AccordionSummary>
      <AccordionDetails {...styles.accordionDetailsProps}>
        {steps.map((step, key) => (
          <Grid key={key} {...styles.accordionDetailsGridProps}>
            <StepIcon step={step} />
            <Typography key={key} {...styles.stepLabelProps}>
              {step.label}
            </Typography>
          </Grid>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const ProgressBar = ({ currentStep }) => {
  const { setActiveStep } = useProgressBar();
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    setActiveStep(Number(currentStep));
  }, [currentStep]);

  return (
    <>
      {expanded && <div style={styles.blurredBackground} />}{' '}
      {/* Apply blur effect */}
      <Grid {...styles.mainGridProps}>
        <CustomAccordion expanded={expanded} handleChange={handleChange} />
      </Grid>
    </>
  );
};

export default ProgressBar;
