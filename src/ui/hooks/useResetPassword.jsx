/**
 * Hook: useResetPassword
 * SDD Phase 5, Task 5.4
 *
 * Gestiona el formulario de restablecimiento de contraseña.
 * Extrae token de la URL, valida con domain, llama a resetPasswordUseCase.
 * NUNCA importa authApi directamente.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateResetPassword } from '../../domain/user/User.js';
import { resetPasswordUseCase } from '../../application/auth/resetPasswordUseCase.js';

/**
 * @returns {{
 *   password: string,
 *   setPassword: (p: string) => void,
 *   confirmPassword: string,
 *   setConfirmPassword: (p: string) => void,
 *   errors: object,
 *   isLoading: boolean,
 *   isSuccess: boolean,
 *   error: string|null,
 *   handleSubmit: (e: { preventDefault: () => void }) => Promise<void>,
 * }}
 */
export default function useResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateResetPassword({ password, confirmPassword });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await resetPasswordUseCase({ token, password });
      setIsSuccess(true);
    } catch (err) {
      setError(err?.message ?? 'Error al restablecer la contraseña. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    isLoading,
    isSuccess,
    error,
    handleSubmit,
  };
}