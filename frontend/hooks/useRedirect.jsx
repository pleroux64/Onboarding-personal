import { useEffect } from 'react';

import { applyActionCode } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { AUTH_MODES } from '@/constants/auth';
import ALERT_COLORS from '@/constants/notification';
import ROUTES from '@/constants/routes';

import { setEmailVerified, setLoading } from '@/redux/slices/authSlice';
import { setCompleted } from '@/redux/slices/userSlice';
import { auth } from '@/redux/store';
import fetchUserData from '@/redux/thunks/user';

const redirectRegex = /\/redirect.*/;

const useRedirect = (firestore, functions, handleOpenSnackBar) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { route, asPath, query } = router;
  const { data: authData, loading } = useSelector((state) => state.auth);
  const onboarding = useSelector((state) => state.onboarding.completed);

  const fetchUserRelatedData = async (id) => {
    const userData = await dispatch(fetchUserData({ firestore, id }));
    return userData;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
    const cachedOnboardingStatus = localStorage.getItem('needsBoarding');

    // If a authUser is authed, set the currentUser in the store and redirect based on onboarding status
    if (auth.currentUser) {
      if (isRedirectRoute) {
        dispatch(setLoading(false));
        return;
      }

      // If email is not verified, redirect to sign in
      if (!auth.currentUser.emailVerified) {
        if (!isAuthUrl) {
          router.push(ROUTES.SIGNIN);
          return;
        }
        return;
      }
      // If already logged in and onboarding is required, redirect to onboarding
      if (cachedOnboardingStatus) {
        console.log('onboarding check', cachedOnboardingStatus);

        router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));

        return;

        // fetchUserRelatedData(auth.currentUser.uid);

        // fetchUserRelatedData(auth.currentUser.uid);
      }
      // if in the process of logging in, and onboarding is required, redirect to onboarding
      if (cachedOnboardingStatus == null) {
        const onboardingStatus = fetchUserData(firestore, auth.currentUser);
        localStorage.setItem('needsBoarding', onboardingStatus);
        if (onboardingStatus) {
          router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
          return;
        }

        // if (onboardingStatus === true) {
        //   router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
        //   return;
        // }
      }

      fetchUserRelatedData(auth.currentUser.uid);
      if (route === ROUTES.CREATE_AVATAR || route === ROUTES.PASSWORD_RESET) {
        return;
      }

      if (isAuthUrl) {
        router.push(ROUTES.HOME);
        return;
      }
      return;
    }

    if (!isAuthRoute && !loading) router.push(ROUTES.SIGNIN);
  }, [authData]);

  useEffect(() => {
    const isRedirectRoute = redirectRegex.test(asPath);

    if (isRedirectRoute) {
      const handleVerifyEmail = async () => {
        try {
          const { oobCode } = query;

          await applyActionCode(auth, oobCode);

          dispatch(setEmailVerified(true));
          router.push(`${ROUTES.HOME}`);
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
          router.push(ROUTES.HOME);
          return;
        }

        handleVerifyEmail();
      }
    }
  }, [query]);
};

export default useRedirect;
