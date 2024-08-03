import { createContext, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { onAuthStateChanged } from 'firebase/auth';
import { Provider, useDispatch } from 'react-redux';

import useRedirect from '@/hooks/useRedirect';

import SnackBar from '@/components/SnackBar';

import { setLoading, setUser } from '@/redux/slices/authSlice';
import { setUserData } from '@/redux/slices/userSlice';
import store, { auth, firestore, functions } from '@/redux/store';
import { fetchUserData } from '@/redux/thunks/user';

const AuthContext = createContext();

const AuthProvider = (props) => {
  const { children } = props;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [message, setMessage] = useState('Default Message');
  const [onboardingFlag, setOnboardingFlag] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const handleOpenSnackBar = (newSeverity, newMessage) => {
    setSeverity(newSeverity);
    setMessage(newMessage);
    setOpen(true);
  };

  const memoizedValue = useMemo(() => {
    return {
      handleOpenSnackBar,
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get auth user claims
        const { claims } = await user.getIdTokenResult(true);
        const cachedOnboardingStatus = localStorage.getItem('needsBoarding');

        if (cachedOnboardingStatus !== null) {
          setOnboardingFlag(cachedOnboardingStatus);
        } else {
          const userData = await dispatch(
            fetchUserData({ firestore, id: user.uid })
          ).unwrap();
          localStorage.setItem('needsBoarding', userData.needsBoarding);
          setOnboardingFlag(userData.needsBoarding);
        }

        dispatch(setUser({ ...user.toJSON(), claims }));
      } else {
        dispatch(setUser(false));
        dispatch(setUserData(false));
      }
      dispatch(setLoading(false));
      setAuthChecked(true);
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useRedirect(firestore, functions, handleOpenSnackBar, onboardingFlag);

  const handleClose = () => {
    setOpen(false);
  };

  if (!authChecked) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
      <SnackBar
        open={open}
        severity={severity}
        message={message}
        handleClose={handleClose}
      />
    </AuthContext.Provider>
  );
};

const GlobalProvider = (props) => {
  const { children } = props;
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};

export { AuthContext };

export default GlobalProvider;
