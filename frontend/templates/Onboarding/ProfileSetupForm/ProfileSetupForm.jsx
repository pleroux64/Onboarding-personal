import React, { useState } from 'react';

import { Button, Grid, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';

const ProfileSetupForm = ({ onNext, tempData }) => {
  const [formData, setFormData] = useState({
    name: tempData.name || '',
    email: tempData.email || '',
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log(`Updated ${name}:`, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onNext(formData); // Pass form data to OnboardingPage
    router.push('/onboarding/2'); // Navigate to the next step
  };

  return (
    <Grid sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile Setup
      </Typography>
      <Typography>Get started by setting up your profile</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleInputChange}
        />
        <TextField
          name="email"
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleInputChange}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Next
        </Button>
      </form>
    </Grid>
  );
};

export default ProfileSetupForm;
