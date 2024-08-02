import React, { forwardRef } from 'react';

import { Controller, TextFieldElement } from 'react-hook-form-mui';

import styles from './styles';

/**
 * Renders a profile text field component integrates with react-hook-form-mui
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the form field.
 * @param {Control<any>} props.control - The control object from React Hook Form.
 * @param {Object} [props.rules] - Validation rules for the form field.
 * @param {React.ElementType} [props.icon] - Optional icon component to be displayed inside the input.
 * @param {Object} [props.error] - Error object containing error details.
 * @param {Object} [props.otherProps] - Additional props to be passed to the `TextFieldElement`.
 *
 * @returns {React.Element} The rendered `TextFieldElement` wrapped with `Controller`.
 */
const ProfileTextField = forwardRef((props, ref) => {
  const { name, control, rules, icon: Icon, error, ...otherProps } = props;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextFieldElement
          {...styles.input}
          {...otherProps}
          {...field}
          ref={ref}
          InputProps={
            Icon
              ? {
                  startAdornment: (
                    <>
                      <Icon />
                      <span>|</span>
                    </>
                  ),
                }
              : {}
          }
          error={!!error}
          helperText={error ? error.message : undefined}
        />
      )}
    />
  );
});

export default ProfileTextField;
