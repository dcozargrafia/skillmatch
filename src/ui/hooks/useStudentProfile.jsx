/**
 * Hook: useStudentProfile
 * SDD Phase 3, Task 3.1
 *
 * Carga perfil + skills del estudiante autenticado.
 * Llama a getStudentProfileUseCase, updateStudentProfileUseCase, updateStudentSkillsUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentProfileUseCase } from '../../application/student/getStudentProfileUseCase.js';
import { updateStudentProfileUseCase } from '../../application/student/updateStudentProfileUseCase.js';
import { updateStudentSkillsUseCase } from '../../application/student/updateStudentSkillsUseCase.js';

/**
 * @returns {{
 *   profile: object|null,
 *   allSkills: object[],
 *   availableSkills: object[],
 *   loading: boolean,
 *   error: string|null,
 *   successMessage: string,
 *   handleSave: (data: object) => Promise<void>,
 *   handleAddSkill: (skillId: string, level: string) => Promise<void>,
 *   handleRemoveSkill: (skillId: string) => Promise<void>,
 * }}
 */
export default function useStudentProfile() {
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { profile: p, allSkills: s } = await getStudentProfileUseCase();
      setProfile(p);
      setAllSkills(s);
    } catch {
      setError('Error al cargar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Computed: skills que el estudiante aún no tiene agregados.
   */
  const profileSkillIds = profile?.skills?.map((s) => s.skill_id) ?? [];
  const availableSkills = allSkills.filter((s) => !profileSkillIds.includes(s.id));

  /**
   * handleSave: guarda perfil (disponibilidad + portfolio_url).
   * Re-sincroniza el perfil completo después de guardar.
   */
  const handleSave = useCallback(
    async (data) => {
      setError(null);
      setSuccessMessage('');
      try {
        await updateStudentProfileUseCase(data);
        const { profile: updatedProfile, allSkills: s } = await getStudentProfileUseCase();
        setProfile(updatedProfile);
        setAllSkills(s);
        setSuccessMessage('Perfil actualizado correctamente.');
      } catch {
        setError('Error al actualizar el perfil. Intenta de nuevo.');
      }
    },
    []
  );

  /**
   * handleAddSkill: agrega un skill al perfil del estudiante.
   * Re-sincroniza después de agregar.
   */
  const handleAddSkill = useCallback(
    async (skillId, level) => {
      setError(null);
      setSuccessMessage('');
      try {
        const currentSkills = profile?.skills ?? [];
        const updated = [
          ...currentSkills.map((s) => ({ skill_id: s.skill_id, level: s.level })),
          { skill_id: skillId, level },
        ];
        await updateStudentSkillsUseCase(updated);
        const { profile: updatedProfile, allSkills: s } = await getStudentProfileUseCase();
        setProfile(updatedProfile);
        setAllSkills(s);
        setSuccessMessage('Skill agregada correctamente.');
      } catch {
        setError('Error al agregar el skill. Intenta de nuevo.');
      }
    },
    [profile]
  );

  /**
   * handleRemoveSkill: elimina un skill del perfil del estudiante.
   * Re-sincroniza después de eliminar.
   */
  const handleRemoveSkill = useCallback(
    async (skillId) => {
      setError(null);
      setSuccessMessage('');
      try {
        const currentSkills = profile?.skills ?? [];
        const updated = currentSkills
          .filter((s) => s.skill_id !== skillId)
          .map((s) => ({ skill_id: s.skill_id, level: s.level }));
        await updateStudentSkillsUseCase(updated);
        const { profile: updatedProfile, allSkills: s } = await getStudentProfileUseCase();
        setProfile(updatedProfile);
        setAllSkills(s);
        setSuccessMessage('Skill eliminada correctamente.');
      } catch {
        setError('Error al eliminar el skill. Intenta de nuevo.');
      }
    },
    [profile]
  );

  return {
    profile,
    allSkills,
    availableSkills,
    loading,
    error,
    successMessage,
    handleSave,
    handleAddSkill,
    handleRemoveSkill,
  };
}