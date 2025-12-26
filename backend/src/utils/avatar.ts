/**
 * Calculate avatar level based on acquired skills count
 *
 * Level thresholds:
 * - Level 1: 0-2 skills (base avatar)
 * - Level 2: 3-5 skills (+ accessory 1)
 * - Level 3: 6-10 skills (+ accessory 2)
 * - Level 4: 11-15 skills (+ special color)
 * - Level 5: 16+ skills (complete avatar)
 */
export function calculateAvatarLevel(acquiredSkillsCount: number): number {
  if (acquiredSkillsCount >= 16) return 5;
  if (acquiredSkillsCount >= 11) return 4;
  if (acquiredSkillsCount >= 6) return 3;
  if (acquiredSkillsCount >= 3) return 2;
  return 1;
}
