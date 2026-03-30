-- Seed : bibliothèque d'exercices globaux
-- ~110 exercices couvrant tous les groupes musculaires et équipements

INSERT INTO public.exercises (nom, groupe_musculaire, equipement, is_global) VALUES

-- ============================================================
-- PECTORAUX
-- ============================================================
('Développé couché barre', 'Pectoraux', 'Barre', true),
('Développé couché haltères', 'Pectoraux', 'Haltères', true),
('Développé incliné barre', 'Pectoraux', 'Barre', true),
('Développé incliné haltères', 'Pectoraux', 'Haltères', true),
('Développé décliné barre', 'Pectoraux', 'Barre', true),
('Développé incliné Smith machine', 'Pectoraux', 'Smith machine', true),
('Écarté haltères couché', 'Pectoraux', 'Haltères', true),
('Écarté poulie croisé', 'Pectoraux', 'Poulie / Câble', true),
('Pec deck (butterfly)', 'Pectoraux', 'Machine', true),
('Dips pectoraux', 'Pectoraux', 'Poids du corps', true),
('Pompes', 'Pectoraux', 'Poids du corps', true),
('Pompes inclinées', 'Pectoraux', 'Poids du corps', true),
('Développé couché prise serrée', 'Pectoraux', 'Barre', true),

-- ============================================================
-- DOS
-- ============================================================
('Tractions pronation large', 'Dos', 'Poids du corps', true),
('Tractions pronation serrée', 'Dos', 'Poids du corps', true),
('Tractions supination', 'Dos', 'Poids du corps', true),
('Rowing barre pronation', 'Dos', 'Barre', true),
('Rowing barre supination', 'Dos', 'Barre', true),
('Rowing haltère unilatéral', 'Dos', 'Haltères', true),
('Tirage poulie haute pronation', 'Dos', 'Poulie / Câble', true),
('Tirage poulie haute supination', 'Dos', 'Poulie / Câble', true),
('Tirage poulie haute prise serrée', 'Dos', 'Poulie / Câble', true),
('Tirage horizontal poulie', 'Dos', 'Poulie / Câble', true),
('Tirage horizontal corde', 'Dos', 'Corde', true),
('Soulevé de terre conventionnel', 'Dos', 'Barre', true),
('Soulevé de terre sumo', 'Dos', 'Barre', true),
('Face pull corde', 'Dos', 'Corde', true),
('Pull-over poulie haute', 'Dos', 'Poulie / Câble', true),
('Pull-over haltère', 'Dos', 'Haltères', true),
('Rowing machine assise', 'Dos', 'Machine', true),
('Tirage poitrine machine', 'Dos', 'Machine', true),
('Shrug barre', 'Dos', 'Barre', true),
('Shrug haltères', 'Dos', 'Haltères', true),
('Hyperextension dos', 'Dos', 'Poids du corps', true),

-- ============================================================
-- ÉPAULES
-- ============================================================
('Développé militaire barre', 'Épaules', 'Barre', true),
('Développé militaire haltères', 'Épaules', 'Haltères', true),
('Développé Arnold', 'Épaules', 'Haltères', true),
('Développé épaules machine', 'Épaules', 'Machine', true),
('Élévation latérale haltères', 'Épaules', 'Haltères', true),
('Élévation latérale poulie basse', 'Épaules', 'Poulie / Câble', true),
('Élévation latérale bande', 'Épaules', 'Bande élastique', true),
('Oiseau haltères', 'Épaules', 'Haltères', true),
('Oiseau poulie haute', 'Épaules', 'Poulie / Câble', true),
('Tirage menton barre', 'Épaules', 'Barre', true),
('Élévation frontale barre', 'Épaules', 'Barre', true),
('Élévation frontale haltères', 'Épaules', 'Haltères', true),
('Élévation frontale câble', 'Épaules', 'Poulie / Câble', true),
('Développé militaire Smith machine', 'Épaules', 'Smith machine', true),

-- ============================================================
-- BICEPS
-- ============================================================
('Curl barre droite', 'Biceps', 'Barre', true),
('Curl barre EZ', 'Biceps', 'Barre', true),
('Curl haltères alternés', 'Biceps', 'Haltères', true),
('Curl haltères simultané', 'Biceps', 'Haltères', true),
('Curl marteau', 'Biceps', 'Haltères', true),
('Curl pupitre barre EZ', 'Biceps', 'Barre', true),
('Curl pupitre haltère', 'Biceps', 'Haltères', true),
('Curl câble poulie basse', 'Biceps', 'Poulie / Câble', true),
('Curl câble barre', 'Biceps', 'Poulie / Câble', true),
('Curl concentration', 'Biceps', 'Haltères', true),
('Curl machine', 'Biceps', 'Machine', true),
('Curl Zottman', 'Biceps', 'Haltères', true),

-- ============================================================
-- TRICEPS
-- ============================================================
('Dips triceps', 'Triceps', 'Poids du corps', true),
('Pompes diamant', 'Triceps', 'Poids du corps', true),
('Extension triceps poulie haute', 'Triceps', 'Poulie / Câble', true),
('Extension triceps corde', 'Triceps', 'Corde', true),
('Pushdown poulie barre', 'Triceps', 'Poulie / Câble', true),
('Skull crusher barre EZ', 'Triceps', 'Barre', true),
('Skull crusher haltères', 'Triceps', 'Haltères', true),
('Extension haltère une main', 'Triceps', 'Haltères', true),
('Extension haltère deux mains', 'Triceps', 'Haltères', true),
('Développé serré', 'Triceps', 'Barre', true),
('Kickback haltère', 'Triceps', 'Haltères', true),
('Extension triceps machine', 'Triceps', 'Machine', true),
('JM press', 'Triceps', 'Barre', true),

-- ============================================================
-- ABDOMINAUX
-- ============================================================
('Crunch', 'Abdominaux', 'Poids du corps', true),
('Crunch inversé', 'Abdominaux', 'Poids du corps', true),
('Crunch oblique', 'Abdominaux', 'Poids du corps', true),
('Planche frontale', 'Abdominaux', 'Poids du corps', true),
('Planche latérale', 'Abdominaux', 'Poids du corps', true),
('Relevé de jambes suspendu', 'Abdominaux', 'Poids du corps', true),
('Crunch poulie haute', 'Abdominaux', 'Poulie / Câble', true),
('Bicycle', 'Abdominaux', 'Poids du corps', true),
('Russian twist', 'Abdominaux', 'Poids du corps', true),
('Ab wheel', 'Abdominaux', 'Poids du corps', true),
('Dragon flag', 'Abdominaux', 'Poids du corps', true),
('Toucher de pieds', 'Abdominaux', 'Poids du corps', true),

-- ============================================================
-- QUADRICEPS
-- ============================================================
('Squat barre', 'Quadriceps', 'Barre', true),
('Squat haltères', 'Quadriceps', 'Haltères', true),
('Squat gobelet kettlebell', 'Quadriceps', 'Kettlebell', true),
('Squat Smith machine', 'Quadriceps', 'Smith machine', true),
('Presse à cuisse', 'Quadriceps', 'Machine', true),
('Presse à cuisse unilatérale', 'Quadriceps', 'Machine', true),
('Leg extension', 'Quadriceps', 'Machine', true),
('Hack squat machine', 'Quadriceps', 'Machine', true),
('Fente avant barre', 'Quadriceps', 'Barre', true),
('Fente avant haltères', 'Quadriceps', 'Haltères', true),
('Fente marchée haltères', 'Quadriceps', 'Haltères', true),
('Fente bulgare haltères', 'Quadriceps', 'Haltères', true),
('Fente bulgare barre', 'Quadriceps', 'Barre', true),
('Step-up haltères', 'Quadriceps', 'Haltères', true),
('Leg press 45°', 'Quadriceps', 'Machine', true),

-- ============================================================
-- ISCHIO-JAMBIERS
-- ============================================================
('Leg curl couché', 'Ischio-jambiers', 'Machine', true),
('Leg curl assis', 'Ischio-jambiers', 'Machine', true),
('Leg curl debout unilatéral', 'Ischio-jambiers', 'Machine', true),
('Soulevé de terre jambes tendues', 'Ischio-jambiers', 'Barre', true),
('Soulevé de terre jambes tendues haltères', 'Ischio-jambiers', 'Haltères', true),
('Good morning', 'Ischio-jambiers', 'Barre', true),
('Nordic curl', 'Ischio-jambiers', 'Poids du corps', true),
('Leg curl bande élastique', 'Ischio-jambiers', 'Bande élastique', true),

-- ============================================================
-- FESSIERS
-- ============================================================
('Hip thrust barre', 'Fessiers', 'Barre', true),
('Hip thrust machine', 'Fessiers', 'Machine', true),
('Hip thrust haltère', 'Fessiers', 'Haltères', true),
('Pont fessier', 'Fessiers', 'Poids du corps', true),
('Kickback câble', 'Fessiers', 'Poulie / Câble', true),
('Abducteur machine', 'Fessiers', 'Machine', true),
('Fente latérale haltères', 'Fessiers', 'Haltères', true),
('Sumo squat haltère', 'Fessiers', 'Haltères', true),
('Donkey kick', 'Fessiers', 'Poids du corps', true),
('Hip abduction bande', 'Fessiers', 'Bande élastique', true),

-- ============================================================
-- MOLLETS
-- ============================================================
('Mollet debout presse', 'Mollets', 'Machine', true),
('Mollet assis machine', 'Mollets', 'Machine', true),
('Mollet debout barre', 'Mollets', 'Barre', true),
('Mollet debout haltères', 'Mollets', 'Haltères', true),
('Mollet unipodal poids du corps', 'Mollets', 'Poids du corps', true),
('Mollet à la presse', 'Mollets', 'Machine', true);
