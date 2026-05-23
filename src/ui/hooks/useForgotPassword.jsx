/**
 * Hook: useForgotPassword
 * SDD Phase 5, Task 5.2
 *
 * Gestiona el estado del formulario de recuperación de contraseña.
 * Llama a forgotPasswordUseCase — NUNCA importa authApi directamente.
 */

import { useState } from 'react';
import { validateEmail } from '../../domain/user/User.js';
import { forgotPasswordUseCase } from '../../application/auth/forgotPasswordUseCase.js';

/**
 * @returns {{
 *   email: string,
 *   setEmail: (email: string) => void,
 *   error: string|null,
 *   isLoading: boolean,
 *   sent: boolean,
 *   handleSubmit: (e: { preventDefault: () => void }) => Promise<void>,
 * }}
 */
export default function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordUseCase(email);
      setSent(true);
    } catch (err) {
      setError(err?.message ?? 'Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, error, isLoading, sent, handleSubmit };
}