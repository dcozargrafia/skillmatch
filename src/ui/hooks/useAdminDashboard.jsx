/**
 * Hook: useAdminDashboard
 * SDD Phase 6, Task 6.2
 *
 * Orquestra el dashboard de administración: skills CRUD y verificación de ONGs.
 * Usa use cases — NUNCA importa adminApi o skillsApi directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSkillsUseCase } from '../../application/skill/getSkillsUseCase.js';
import { createSkillUseCase } from '../../application/admin/createSkillUseCase.js';
import { deleteSkillUseCase } from '../../application/admin/deleteSkillUseCase.js';
import { verifyNgoUseCase } from '../../application/admin/verifyNgoUseCase.js';
import { getUnverifiedNgosUseCase } from '../../application/admin/getUnverifiedNgosUseCase.js';

/**
 * @returns {{
 *   skills: object[],
 *   ngos: object[],
 *   isLoading: boolean,
 *   error: string|null,
 *   skillToDelete: number|null,
 *   confirmVerification: number|null,
 *   skillError: string|null,
 *   newSkillName: string,
 *   newSkillCategory: string,
 *   setNewSkillName: (name: string) => void,
 *   setNewSkillCategory: (category: string) => void,
 *   handleCreateSkill: (data: { name: string, category: string }) => Promise<void>,
 *   handleDeleteSkill: (skillId: number) => void,
 *   handleConfirmDelete: () => Promise<void>,
 *   cancelDelete: () => void,
 *   handleVerifyNgo: (userId: number) => Promise<void>,
 * }}
 */
export default function useAdminDashboard() {
  const [skills, setSkills] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [confirmVerification, setConfirmVerification] = useState(null);
  const [skillError, setSkillError] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [skillsData, ngosData] = await Promise.all([
        getSkillsUseCase(),
        getUnverifiedNgosUseCase(),
      ]);
      setSkills(skillsData);
      setNgos(ngosData);
    } catch {
      setError('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSkill = useCallback(
    async ({ name, category }) => {
      setSkillError(null);
      try {
        await createSkillUseCase({ name, category });
        const updatedSkills = await getSkillsUseCase();
        setSkills(updatedSkills);
        setNewSkillName('');
        setNewSkillCategory('');
      } catch {
        setSkillError('Error al crear la habilidad');
      }
    },
    []
  );

  const handleDeleteSkill = useCallback((skillId) => {
    setSkillToDelete(skillId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (skillToDelete === null) return;
    try {
      await deleteSkillUseCase(skillToDelete);
      const updatedSkills = await getSkillsUseCase();
      setSkills(updatedSkills);
    } catch {
      setError('Error al eliminar la habilidad');
    } finally {
      setSkillToDelete(null);
    }
  }, [skillToDelete]);

  const cancelDelete = useCallback(() => {
    setSkillToDelete(null);
  }, []);

  const handleVerifyNgo = useCallback(async (userId) => {
    setConfirmVerification(userId);
    try {
      await verifyNgoUseCase(userId);
      const updatedNgos = await getUnverifiedNgosUseCase();
      setNgos(updatedNgos);
    } catch {
      setError('Error al verificar la ONG');
    } finally {
      setConfirmVerification(null);
    }
  }, []);

  return {
    skills,
    ngos,
    isLoading,
    error,
    skillToDelete,
    confirmVerification,
    skillError,
    newSkillName,
    newSkillCategory,
    setNewSkillName,
    setNewSkillCategory,
    handleCreateSkill,
    handleDeleteSkill,
    handleConfirmDelete,
    cancelDelete,
    handleVerifyNgo,
  };
}