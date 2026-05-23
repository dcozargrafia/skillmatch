/**
 * Hook: useNgoProfile
 * SDD Phase 3, Task 3.4
 *
 * Carga y guarda el perfil de la ONG.
 * Llama a getNgoProfileUseCase y updateNgoProfileUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 *
 * @returns {{
 *   profile: {ngo: object, user: object}|null,
 *   loading: boolean,
 *   error: string|null,
 *   successMessage: string,
 *   handleSave: (data: object) => Promise<void>,
 * }}
 */
import { useState, useEffect, useCallback } from 'react';
import { getNgoProfileUseCase } from '../../application/ngo/getNgoProfileUseCase.js';
import { updateNgoProfileUseCase } from '../../application/ngo/updateNgoProfileUseCase.js';

export default function useNgoProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getNgoProfileUseCase()
      .then(({ ngo, user }) => {
        setProfile({ ngo, user });
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message ?? 'Error al cargar el perfil.');
        setLoading(false);
      });
  }, []);

  /**
   * handleSave: guarda el perfil de la ONG.
   * @param {object} data - campos del formulario { name, email, organization_name, area }
   */
  const handleSave = useCallback(
    async (data) => {
      setError(null);
      setSuccessMessage('');
      try {
        const updated = await updateNgoProfileUseCase(data);
        setProfile(updated);
        setSuccessMessage('Perfil actualizado correctamente.');
      } catch (err) {
        setError(err?.message ?? 'Error al actualizar el perfil. Intenta de nuevo.');
      }
    },
    []
  );

  return { profile, loading, error, successMessage, handleSave };
}