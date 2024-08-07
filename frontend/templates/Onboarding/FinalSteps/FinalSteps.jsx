import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import { Button, Divider, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

import styles from './styles';

const StyledCheckCircleIcon = styled(CheckCircleIcon)(styles.checkbox);
const StyledRadioButtonUncheckedOutlinedIcon = styled(
  RadioButtonUncheckedOutlinedIcon
)(styles.uncheckBox);

const FinalSteps = () => {
  const router = useRouter();

  const handleFinish = () => {
    router.push('/onboarding/4');
  };

  const renderTitle = () => (
    <Grid {...styles.titleGrid}>
      <Typography {...styles.titleProps}>Final Steps</Typography>
      <Typography {...styles.descriptionProps}>
        We need some permissions to get you started
      </Typography>
    </Grid>
  );

  const renderButton = () => (
    <Button onClick={handleFinish} {...styles.continueButton}>
      Continue
    </Button>
  );

  const renderSection = (
    IconComponent,
    text,
    gridStyle,
    iconStyle,
    showDivider = true
  ) => (
    <>
      <Grid {...gridStyle}>
        <IconComponent style={iconStyle} />
        <Typography {...styles.labelProps}>{text}</Typography>
      </Grid>
      {showDivider && <Divider {...styles.divider} />}
    </>
  );

  return (
    <Grid>
      {renderTitle()}
      {renderSection(
        StyledCheckCircleIcon,
        'Welcome',
        styles.topGrid,
        styles.checkbox
      )}
      {renderSection(
        StyledCheckCircleIcon,
        'Profile Setup',
        styles.topGrid,
        styles.checkbox
      )}
      {renderSection(
        StyledCheckCircleIcon,
        'System Configurations',
        styles.topGrid,
        styles.checkbox
      )}
      {renderSection(
        StyledRadioButtonUncheckedOutlinedIcon,
        'Final Steps',
        styles.bottomGrid,
        styles.uncheckBox,
        false
      )}
      {renderButton()}
    </Grid>
  );
};

export default FinalSteps;
