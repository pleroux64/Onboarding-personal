import { useEffect } from 'react';

import { applyActionCode } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { AUTH_MODES } from '@/constants/auth';
import ALERT_COLORS from '@/constants/notification';
import ROUTES from '@/constants/routes';

import { setEmailVerified, setLoading } from '@/redux/slices/authSlice';
import { auth } from '@/redux/store';
import fetchUserData from '@/redux/thunks/user';

const redirectRegex = /\/redirect.*/;

const useRedirect = (
  firestore,
  functions,
  handleOpenSnackBar,
  onboardingFlag
) => {
  console.log('onboardingFlag', onboardingFlag);
  const router = useRouter();
  const dispatch = useDispatch();

  const { route, asPath, query } = router;
  const { data: authData, loading } = useSelector((state) => state.auth);

  const fetchUserRelatedData = async (id) => {
    console.log('Fetching user related data');
    await dispatch(fetchUserData({ firestore, id }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('useRedirect useEffect - Initial Check');

    // Check if the current route is an authentication route
    const isAuthUrl = [
      ROUTES.SIGNIN,
      ROUTES.SIGNUP,
      ROUTES.PRIVACY,
      ROUTES.TERMS,
      ROUTES.PASSWORD_RESET,
    ].includes(route);

    const isRedirectRoute = redirectRegex.test(asPath);
    const isAuthRoute = isAuthUrl || isRedirectRoute;

    // If a authUser is authed, set the currentUser in the store and redirect to home if on an auth route
    if (auth.currentUser) {
      console.log('User is authenticated');

      if (isRedirectRoute) {
        console.log('Redirect route detected');
        dispatch(setLoading(false));
        return;
      }

      // If email is not verified, redirect to sign in
      if (!auth.currentUser.emailVerified) {
        console.log('Email not verified');
        if (!isAuthUrl) {
          router.push(ROUTES.SIGNIN);
          return;
        }
        return;
      }

      fetchUserRelatedData(auth.currentUser.uid);

      if (route === ROUTES.CREATE_AVATAR || route === ROUTES.PASSWORD_RESET) {
        console.log('Special routes for create avatar or password reset');
        return;
      }

      if (onboardingFlag) {
        console.log('User needs onboarding');
        router.replace(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
      } else if (isAuthUrl) {
        console.log('Routing to home as user does not need onboarding');
        router.push(ROUTES.HOME);
      }

      return;
    }

    console.log('Checking if not auth route and not loading');
    if (!isAuthRoute && !loading) router.push(ROUTES.SIGNIN);
  }, [authData]);

  useEffect(() => {
    const isRedirectRoute = redirectRegex.test(asPath);

    console.log('useRedirect useEffect - Checking redirect routes');
    if (isRedirectRoute) {
      const handleVerifyEmail = async () => {
        try {
          const { oobCode } = query;

          await applyActionCode(auth, oobCode);

          dispatch(setEmailVerified(true));
          router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
        } catch (error) {
          handleOpenSnackBar(ALERT_COLORS.ERROR, 'Unable to verify email');
          router.push(`${ROUTES.SIGNUP}`);
          throw new Error(error);
        }
      };

      const { mode, oobCode } = query;

      if (mode === AUTH_MODES.PASSWORD_RESET) {
        router.push(`${ROUTES.PASSWORD_RESET}?oobCode=${oobCode}`);
        return;
      }

      if (mode === AUTH_MODES.VERIFY_EMAIL) {
        if (auth.currentUser?.emailVerified) {
          router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
          return;
        }

        handleVerifyEmail();
      }
    }
  }, [query]);
};

export default useRedirect;
