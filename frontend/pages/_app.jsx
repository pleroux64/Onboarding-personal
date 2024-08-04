import { ThemeProvider } from '@emotion/react';
import { CircularProgress, Grid } from '@mui/material';
import { GoogleAnalytics } from 'nextjs-google-analytics';

import useOnboardingStatus from '@/hooks/useOnboardingStatus';

import firebaseConfig from '@/firebase/config';
import GlobalProvider from '@/providers/GlobalProvider';
import theme from '@/theme/theme';

import '@/styles/globals.css';

const App = ({ Component, pageProps }) => {
  const getLayout = Component.getLayout || ((page) => page);
  const onboardingStatus = useOnboardingStatus();

  const renderLoader = () => (
    <Grid
      container
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress color="secondary" size={25} />
    </Grid>
  );

  if (onboardingStatus === null) {
    return renderLoader();
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalProvider onboardingStatus={onboardingStatus}>
        <GoogleAnalytics
          trackPageViews
          gaMeasurementId={firebaseConfig.measurementId}
        />
        {getLayout(<Component {...pageProps} />)}
      </GlobalProvider>
    </ThemeProvider>
  );
};

export default App;
