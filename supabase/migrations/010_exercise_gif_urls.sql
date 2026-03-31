-- Migration 010 : Ajout des GIF animés (ExerciseDB) aux exercices
-- Ajoute la colonne gif_url, met à jour les exercices existants, et ajoute ~80 nouveaux exercices

-- ============================================================
-- PARTIE 1 : Ajout de la colonne gif_url
-- ============================================================
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- ============================================================
-- PARTIE 2 : Mise à jour des exercices existants avec les GIF URLs
-- Format : https://static.exercisedb.dev/media/{exerciseId}.gif
-- ============================================================

-- ---------- PECTORAUX ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/EIeI8Vf.gif' WHERE nom = 'Développé couché barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/SpYC0Kp.gif' WHERE nom = 'Développé couché haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/3TZduzM.gif' WHERE nom = 'Développé incliné barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ns0SIbU.gif' WHERE nom = 'Développé incliné haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/GrO65fd.gif' WHERE nom = 'Développé décliné barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/5v7KYld.gif' WHERE nom = 'Développé incliné Smith machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/yz9nUhF.gif' WHERE nom = 'Écarté haltères couché' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/UKWTJWR.gif' WHERE nom = 'Écarté poulie croisé' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/v3xmPAR.gif' WHERE nom = 'Pec deck (butterfly)' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/9WTm7dq.gif' WHERE nom = 'Dips pectoraux' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/I4hDWkc.gif' WHERE nom = 'Pompes' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/B1EVP9F.gif' WHERE nom = 'Pompes inclinées' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/J6Dx1Mu.gif' WHERE nom = 'Développé couché prise serrée' AND is_global = true;

-- ---------- DOS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Qqi7bko.gif' WHERE nom = 'Tractions pronation large' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/vrhHa6D.gif' WHERE nom = 'Tractions pronation serrée' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/T2mxWqc.gif' WHERE nom = 'Tractions supination' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/eZyBC3j.gif' WHERE nom = 'Rowing barre pronation' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/SzX3uzM.gif' WHERE nom = 'Rowing barre supination' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/BJ0Hz5L.gif' WHERE nom = 'Rowing haltère unilatéral' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/LEprlgG.gif' WHERE nom = 'Tirage poulie haute pronation' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/xBYcQHj.gif' WHERE nom = 'Tirage poulie haute supination' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/rkg41Fb.gif' WHERE nom = 'Tirage poulie haute prise serrée' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/fUBheHs.gif' WHERE nom = 'Tirage horizontal poulie' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/SJqRxOt.gif' WHERE nom = 'Tirage horizontal corde' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ila4NZS.gif' WHERE nom = 'Soulevé de terre conventionnel' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/KgI0tqW.gif' WHERE nom = 'Soulevé de terre sumo' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ZfyAGhK.gif' WHERE nom = 'Face pull corde' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Q2Eu1Ax.gif' WHERE nom = 'Pull-over poulie haute' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/9XjtHvS.gif' WHERE nom = 'Pull-over haltère' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/7I6LNUG.gif' WHERE nom = 'Rowing machine assise' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ky8FLU8.gif' WHERE nom = 'Tirage poitrine machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/dG7tG5y.gif' WHERE nom = 'Shrug barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/NJzBsGJ.gif' WHERE nom = 'Shrug haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/zhMwOwE.gif' WHERE nom = 'Hyperextension dos' AND is_global = true;

-- ---------- ÉPAULES ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/kTbSH9h.gif' WHERE nom = 'Développé militaire barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/znQUdHY.gif' WHERE nom = 'Développé militaire haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Xy4jlWA.gif' WHERE nom = 'Développé Arnold' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/67n3r98.gif' WHERE nom = 'Développé épaules machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/DsgkuIt.gif' WHERE nom = 'Élévation latérale haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/goJ6ezq.gif' WHERE nom = 'Élévation latérale poulie basse' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/sTg7iys.gif' WHERE nom = 'Élévation latérale bande' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/EAs3xL9.gif' WHERE nom = 'Oiseau haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/P5p0j8B.gif' WHERE nom = 'Oiseau poulie haute' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/UDlhcO8.gif' WHERE nom = 'Tirage menton barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/b2Uoz54.gif' WHERE nom = 'Élévation frontale barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/3eGE2JC.gif' WHERE nom = 'Élévation frontale haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/u2X71Np.gif' WHERE nom = 'Élévation frontale câble' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/903mzG8.gif' WHERE nom = 'Développé militaire Smith machine' AND is_global = true;

-- ---------- BICEPS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/25GPyDY.gif' WHERE nom = 'Curl barre droite' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/6TG6x2w.gif' WHERE nom = 'Curl barre EZ' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/BU15nH4.gif' WHERE nom = 'Curl haltères alternés' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/NbVPDMW.gif' WHERE nom = 'Curl haltères simultané' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/slDvUAU.gif' WHERE nom = 'Curl marteau' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/hacCyUv.gif' WHERE nom = 'Curl pupitre barre EZ' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/jivWf8n.gif' WHERE nom = 'Curl pupitre haltère' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/G08RZcQ.gif' WHERE nom = 'Curl câble poulie basse' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/G08RZcQ.gif' WHERE nom = 'Curl câble barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/gvsWLQw.gif' WHERE nom = 'Curl concentration' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/b6hQYMb.gif' WHERE nom = 'Curl machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/kXaIn5A.gif' WHERE nom = 'Curl Zottman' AND is_global = true;

-- ---------- TRICEPS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/X6C6i5Y.gif' WHERE nom = 'Dips triceps' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/soIB2rj.gif' WHERE nom = 'Pompes diamant' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/3ZflifB.gif' WHERE nom = 'Extension triceps poulie haute' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/dU605di.gif' WHERE nom = 'Extension triceps corde' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/gAwDzB3.gif' WHERE nom = 'Pushdown poulie barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/h8LFzo9.gif' WHERE nom = 'Skull crusher barre EZ' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/mpKZGWz.gif' WHERE nom = 'Skull crusher haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/nAuHPcD.gif' WHERE nom = 'Extension haltère une main' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/PdmaD0N.gif' WHERE nom = 'Extension haltère deux mains' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/J6Dx1Mu.gif' WHERE nom = 'Développé serré' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/W6PxUkg.gif' WHERE nom = 'Kickback haltère' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Ser9eQp.gif' WHERE nom = 'Extension triceps machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ZsiqXYa.gif' WHERE nom = 'JM press' AND is_global = true;

-- ---------- ABDOMINAUX ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/BMMolZ3.gif' WHERE nom = 'Crunch' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/nCU1Ekp.gif' WHERE nom = 'Crunch inversé' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/QUDd8WS.gif' WHERE nom = 'Crunch oblique' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/VBAWRPG.gif' WHERE nom = 'Planche frontale' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/5VXmnV5.gif' WHERE nom = 'Planche latérale' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/I3tsCnC.gif' WHERE nom = 'Relevé de jambes suspendu' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/WW95auq.gif' WHERE nom = 'Crunch poulie haute' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/1ZFqTDN.gif' WHERE nom = 'Bicycle' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/XVDdcoj.gif' WHERE nom = 'Russian twist' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/NAgVB3t.gif' WHERE nom = 'Ab wheel' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/I3tsCnC.gif' WHERE nom = 'Dragon flag' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/BbfB8Gb.gif' WHERE nom = 'Toucher de pieds' AND is_global = true;

-- ---------- QUADRICEPS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/qXTaZnJ.gif' WHERE nom = 'Squat barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/HsvHqgf.gif' WHERE nom = 'Squat haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ZA8b5hc.gif' WHERE nom = 'Squat gobelet kettlebell' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/jFtipLl.gif' WHERE nom = 'Squat Smith machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/10Z2DXU.gif' WHERE nom = 'Presse à cuisse' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/WWD6FzI.gif' WHERE nom = 'Presse à cuisse unilatérale' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/my33uHU.gif' WHERE nom = 'Leg extension' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Qa55kX1.gif' WHERE nom = 'Hack squat machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/t8iSghb.gif' WHERE nom = 'Fente avant barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/RRWFUcw.gif' WHERE nom = 'Fente avant haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/IZVHb27.gif' WHERE nom = 'Fente marchée haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/qx4fgX7.gif' WHERE nom = 'Fente bulgare haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/gGNQmVt.gif' WHERE nom = 'Fente bulgare barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/aXtJhlg.gif' WHERE nom = 'Step-up haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/2Qh2J1e.gif' WHERE nom = 'Leg press 45°' AND is_global = true;

-- ---------- ISCHIO-JAMBIERS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/17lJ1kr.gif' WHERE nom = 'Leg curl couché' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Zg3XY7P.gif' WHERE nom = 'Leg curl assis' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/C5jncD2.gif' WHERE nom = 'Leg curl debout unilatéral' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/wQ2c4XD.gif' WHERE nom = 'Soulevé de terre jambes tendues' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/5eLRITT.gif' WHERE nom = 'Soulevé de terre jambes tendues haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/XlZ4lAC.gif' WHERE nom = 'Good morning' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Pjbc0Kt.gif' WHERE nom = 'Nordic curl' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/17lJ1kr.gif' WHERE nom = 'Leg curl bande élastique' AND is_global = true;

-- ---------- FESSIERS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/qKBpF7I.gif' WHERE nom = 'Hip thrust barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/Pjbc0Kt.gif' WHERE nom = 'Hip thrust machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/qKBpF7I.gif' WHERE nom = 'Hip thrust haltère' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/u0cNiij.gif' WHERE nom = 'Pont fessier' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/HEJ6DIX.gif' WHERE nom = 'Kickback câble' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/CHpahtl.gif' WHERE nom = 'Abducteur machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/py1HSzx.gif' WHERE nom = 'Fente latérale haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/dzz6BiV.gif' WHERE nom = 'Sumo squat haltère' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/UVo2Qs2.gif' WHERE nom = 'Donkey kick' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/CHpahtl.gif' WHERE nom = 'Hip abduction bande' AND is_global = true;

-- ---------- MOLLETS ----------
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ykUOVze.gif' WHERE nom = 'Mollet debout presse' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/bOOdeyc.gif' WHERE nom = 'Mollet assis machine' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/8ozhUIZ.gif' WHERE nom = 'Mollet debout barre' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/dPmaUaU.gif' WHERE nom = 'Mollet debout haltères' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/1kB3Wmk.gif' WHERE nom = 'Mollet unipodal poids du corps' AND is_global = true;
UPDATE public.exercises SET gif_url = 'https://static.exercisedb.dev/media/ykHcWme.gif' WHERE nom = 'Mollet à la presse' AND is_global = true;


-- ============================================================
-- PARTIE 3 : Ajout de nouveaux exercices (~80 exercices)
-- ============================================================

INSERT INTO public.exercises (nom, groupe_musculaire, equipement, is_global, gif_url) VALUES

-- ============================================================
-- PECTORAUX (nouveaux)
-- ============================================================
('Pompes déclinées', 'Pectoraux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/i5cEhka.gif'),
('Écarté incliné haltères', 'Pectoraux', 'Haltères', true, 'https://static.exercisedb.dev/media/1PLE8e9.gif'),
('Écarté décliné haltères', 'Pectoraux', 'Haltères', true, 'https://static.exercisedb.dev/media/xXm4nYq.gif'),
('Écarté poulie basse (low cable fly)', 'Pectoraux', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/FVmZVhk.gif'),
('Écarté poulie haute (high cable fly)', 'Pectoraux', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/7saC5zz.gif'),
('Développé couché machine (chest press)', 'Pectoraux', 'Machine', true, 'https://static.exercisedb.dev/media/v3xmPAR.gif'),
('Développé décliné Smith machine', 'Pectoraux', 'Smith machine', true, 'https://static.exercisedb.dev/media/ETZfAbZ.gif'),
('Développé couché Smith machine', 'Pectoraux', 'Smith machine', true, 'https://static.exercisedb.dev/media/trqKQv2.gif'),

-- ============================================================
-- DOS (nouveaux)
-- ============================================================
('Rowing T-bar', 'Dos', 'Barre', true, 'https://static.exercisedb.dev/media/FVM1AUZ.gif'),
('Tirage vertical bras tendus (straight arm pulldown)', 'Dos', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/x69MAlq.gif'),
('Rowing inversé (inverted row)', 'Dos', 'Poids du corps', true, 'https://static.exercisedb.dev/media/bZGHsAZ.gif'),
('Shrug câble', 'Dos', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/Eg98Ft9.gif'),
('Rowing haltère unilatéral (un bras)', 'Dos', 'Haltères', true, 'https://static.exercisedb.dev/media/C0MA9bC.gif'),
('Tirage poulie haute unilatéral', 'Dos', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/U5INZY6.gif'),
('Tirage vertical corde (rope pulldown)', 'Dos', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/DT14T9T.gif'),
('Soulevé de terre roumain barre', 'Dos', 'Barre', true, 'https://static.exercisedb.dev/media/wQ2c4XD.gif'),
('Shrug bande élastique', 'Dos', 'Bande élastique', true, 'https://static.exercisedb.dev/media/trmte8s.gif'),

-- ============================================================
-- ÉPAULES (nouveaux)
-- ============================================================
('Développé épaules haltères assis', 'Épaules', 'Haltères', true, 'https://static.exercisedb.dev/media/znQUdHY.gif'),
('Développé épaules un bras haltère', 'Épaules', 'Haltères', true, 'https://static.exercisedb.dev/media/84RyJf8.gif'),
('Élévation latérale machine', 'Épaules', 'Machine', true, 'https://static.exercisedb.dev/media/dRTfGZT.gif'),
('Tirage menton haltères', 'Épaules', 'Haltères', true, 'https://static.exercisedb.dev/media/6cKQC5E.gif'),
('Développé épaules câble', 'Épaules', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/PzQanLE.gif'),
('Oiseau incliné haltères (rear delt raise)', 'Épaules', 'Haltères', true, 'https://static.exercisedb.dev/media/mu5Guxt.gif'),
('Élévation latérale Smith machine', 'Épaules', 'Smith machine', true, 'https://static.exercisedb.dev/media/ayAHcEm.gif'),
('Face pull câble (rear delt row corde)', 'Épaules', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/wqNPGCg.gif'),
('Développé épaules bande élastique', 'Épaules', 'Bande élastique', true, 'https://static.exercisedb.dev/media/peAeMR3.gif'),
('Landmine press (élévation latérale)', 'Épaules', 'Barre', true, 'https://static.exercisedb.dev/media/eXMFHww.gif'),

-- ============================================================
-- BICEPS (nouveaux)
-- ============================================================
('Curl incliné haltères', 'Biceps', 'Haltères', true, 'https://static.exercisedb.dev/media/F3xgbjF.gif'),
('Curl spider barre EZ', 'Biceps', 'Barre', true, 'https://static.exercisedb.dev/media/2kattbR.gif'),
('Curl drag barre', 'Biceps', 'Barre', true, 'https://static.exercisedb.dev/media/IENzBdA.gif'),
('Curl drag câble', 'Biceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/dXz8zjF.gif'),
('Curl inversé barre (reverse curl)', 'Biceps', 'Barre', true, 'https://static.exercisedb.dev/media/xNrS20v.gif'),
('Curl inversé câble (reverse curl)', 'Biceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/eOG0r6v.gif'),
('Curl pupitre machine', 'Biceps', 'Machine', true, 'https://static.exercisedb.dev/media/ye84CTU.gif'),
('Curl overhead câble (cable overhead curl)', 'Biceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/wDUqY2u.gif'),
('Curl assis câble', 'Biceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/8oYqOt9.gif'),
('Curl pupitre barre droite', 'Biceps', 'Barre', true, 'https://static.exercisedb.dev/media/qOgPVf6.gif'),

-- ============================================================
-- TRICEPS (nouveaux)
-- ============================================================
('Extension triceps overhead câble corde', 'Triceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/2IxROQ1.gif'),
('Dips sur banc (bench dip)', 'Triceps', 'Poids du corps', true, 'https://static.exercisedb.dev/media/RrLske5.gif'),
('Extension triceps barre EZ assis', 'Triceps', 'Barre', true, 'https://static.exercisedb.dev/media/iaapw0g.gif'),
('Extension triceps barre debout', 'Triceps', 'Barre', true, 'https://static.exercisedb.dev/media/dZl9Q27.gif'),
('Extension triceps décliné haltères', 'Triceps', 'Haltères', true, 'https://static.exercisedb.dev/media/OTgkHwR.gif'),
('Extension triceps incliné haltères', 'Triceps', 'Haltères', true, 'https://static.exercisedb.dev/media/OVIKwsd.gif'),
('Extension triceps câble un bras', 'Triceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/sYCcnon.gif'),
('Pushdown inversé câble (reverse grip)', 'Triceps', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/VjYliFZ.gif'),

-- ============================================================
-- ABDOMINAUX (nouveaux)
-- ============================================================
('Mountain climber', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/RJgzwny.gif'),
('Relevé de jambes couché', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/WhuFnR7.gif'),
('Sit-up', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/6ZCiYWQ.gif'),
('Jackknife sit-up', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/mbkgB44.gif'),
('Flutter kicks', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/UVo2Qs2.gif'),
('Dead bug', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/iny3m5y.gif'),
('Crunch câble debout', 'Abdominaux', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/jpgqxiS.gif'),
('Crunch câble inversé', 'Abdominaux', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/RqOtqD7.gif'),
('Landmine 180 (rotation)', 'Abdominaux', 'Barre', true, 'https://static.exercisedb.dev/media/QYysSLV.gif'),
('Planche avec rotation (front plank twist)', 'Abdominaux', 'Poids du corps', true, 'https://static.exercisedb.dev/media/CosupLu.gif'),

-- ============================================================
-- QUADRICEPS (nouveaux)
-- ============================================================
('Squat avant barre (front squat)', 'Quadriceps', 'Barre', true, 'https://static.exercisedb.dev/media/zG0zs85.gif'),
('Sissy squat', 'Quadriceps', 'Poids du corps', true, 'https://static.exercisedb.dev/media/xdYPUtE.gif'),
('Pistol squat', 'Quadriceps', 'Poids du corps', true, 'https://static.exercisedb.dev/media/nqs5HGV.gif'),
('Fente marchée poids du corps', 'Quadriceps', 'Poids du corps', true, 'https://static.exercisedb.dev/media/IZVHb27.gif'),
('Split squat haltères', 'Quadriceps', 'Haltères', true, 'https://static.exercisedb.dev/media/qx4fgX7.gif'),
('Squat avant Smith machine', 'Quadriceps', 'Smith machine', true, 'https://static.exercisedb.dev/media/lFhb2Rw.gif'),
('Hack squat Smith machine', 'Quadriceps', 'Smith machine', true, 'https://static.exercisedb.dev/media/ZuPXtCK.gif'),
('Squat kettlebell pistol', 'Quadriceps', 'Kettlebell', true, 'https://static.exercisedb.dev/media/5bpPTHv.gif'),
('Split squat barre', 'Quadriceps', 'Barre', true, 'https://static.exercisedb.dev/media/gGNQmVt.gif'),

-- ============================================================
-- ISCHIO-JAMBIERS (nouveaux)
-- ============================================================
('Soulevé de terre roumain haltère unipodal', 'Ischio-jambiers', 'Haltères', true, 'https://static.exercisedb.dev/media/gKozT8X.gif'),
('Soulevé de terre roumain barre unipodal', 'Ischio-jambiers', 'Barre', true, 'https://static.exercisedb.dev/media/gEyURal.gif'),
('Good morning stiff leg barre', 'Ischio-jambiers', 'Barre', true, 'https://static.exercisedb.dev/media/JrOHAZc.gif'),

-- ============================================================
-- FESSIERS (nouveaux)
-- ============================================================
('Pont fessier barre (barbell glute bridge)', 'Fessiers', 'Barre', true, 'https://static.exercisedb.dev/media/qKBpF7I.gif'),
('Cable pull-through (corde)', 'Fessiers', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/OM46QHm.gif'),
('Adducteur machine', 'Fessiers', 'Machine', true, 'https://static.exercisedb.dev/media/oHsrypV.gif'),
('Fente latérale barre', 'Fessiers', 'Barre', true, 'https://static.exercisedb.dev/media/py1HSzx.gif'),
('Abduction hanche debout (side hip abduction)', 'Fessiers', 'Poids du corps', true, 'https://static.exercisedb.dev/media/7WaDzyL.gif'),
('Band pull-through', 'Fessiers', 'Bande élastique', true, 'https://static.exercisedb.dev/media/VtTbiP3.gif'),
('Hip thrust bande élastique', 'Fessiers', 'Bande élastique', true, 'https://static.exercisedb.dev/media/Pjbc0Kt.gif'),

-- ============================================================
-- MOLLETS (nouveaux)
-- ============================================================
('Mollet donkey (donkey calf raise)', 'Mollets', 'Poids du corps', true, 'https://static.exercisedb.dev/media/u5ESqzH.gif'),
('Mollet donkey machine', 'Mollets', 'Machine', true, 'https://static.exercisedb.dev/media/C9LuR4A.gif'),
('Mollet presse à cuisse (sled calf press)', 'Mollets', 'Machine', true, 'https://static.exercisedb.dev/media/ykHcWme.gif'),

-- ============================================================
-- AVANT-BRAS (nouveau groupe musculaire)
-- ============================================================
('Curl poignet barre (wrist curl)', 'Avant-bras', 'Barre', true, 'https://static.exercisedb.dev/media/82LxxkW.gif'),
('Curl poignet inversé barre (reverse wrist curl)', 'Avant-bras', 'Barre', true, 'https://static.exercisedb.dev/media/LsZkfU6.gif'),
('Curl poignet haltère', 'Avant-bras', 'Haltères', true, 'https://static.exercisedb.dev/media/YtaCTYl.gif'),
('Curl poignet inversé haltère', 'Avant-bras', 'Haltères', true, 'https://static.exercisedb.dev/media/BwSNDGt.gif'),
('Curl poignet inversé câble', 'Avant-bras', 'Poulie / Câble', true, 'https://static.exercisedb.dev/media/eYmsEPR.gif'),
('Farmer walk (marche du fermier)', 'Avant-bras', 'Haltères', true, 'https://static.exercisedb.dev/media/qPEzJjA.gif'),
('Curl inversé barre EZ', 'Avant-bras', 'Barre', true, 'https://static.exercisedb.dev/media/xNrS20v.gif');
