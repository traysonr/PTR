// data/exercises.ts

import { Exercise } from '../types/exercise';

export const EXERCISES: Exercise[] = [
  // -------- NECK (8) --------
  {
    id: 'chin_tucks_001',
    name: 'Chin Tucks',
    description:
      'Gently retract your chin straight back as if making a double chin, keeping your eyes level. Hold briefly, then relax.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['pain_management', 'posture', 'mobility'],
    equipment: ['none'],
    reps: '10–15 reps',
    holdTime: '3–5 seconds',
    sets: '2–3 sets',
    timeToComplete: '3–5 minutes',
    notes: 'Avoid tilting the head up or down; movement is straight back.'
  },
  {
    id: 'cervical_retraction_towel_001',
    name: 'Cervical Retraction with Towel',
    description:
      'Place a rolled towel behind your neck and gently press the back of your head into it, retracting the chin straight back.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['pain_management', 'posture'],
    equipment: ['chair'],
    reps: '8–12 reps',
    holdTime: '3–5 seconds',
    sets: '2–3 sets',
    timeToComplete: '3–4 minutes'
  },
  {
    id: 'upper_trap_stretch_001',
    name: 'Upper Trapezius Stretch',
    description:
      'Sitting tall, gently bring one ear toward your shoulder while keeping the opposite shoulder relaxed and down.',
    bodyAreas: ['neck', 'upper_back'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets',
    timeToComplete: '3–5 minutes',
    notes: 'Stretch should be gentle, not sharp or tingling.'
  },
  {
    id: 'levator_scap_stretch_001',
    name: 'Levator Scapulae Stretch',
    description:
      'Turn your head 45° away from the side to be stretched, look down toward your armpit, and gently pull the head forward and down.',
    bodyAreas: ['neck', 'upper_back'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets',
    timeToComplete: '3–5 minutes'
  },
  {
    id: 'scalene_stretch_001',
    name: 'Scalene Stretch',
    description:
      'Sitting tall, gently tilt your head away and slightly back from the side being stretched while keeping shoulders relaxed.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'seated_neck_rotation_001',
    name: 'Seated Neck Rotation',
    description:
      'Turn your head slowly to look over one shoulder, pause, then return to center and repeat to the other side.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['mobility'],
    equipment: ['none'],
    reps: '10 reps each direction',
    sets: '2 sets',
    timeToComplete: '3–4 minutes'
  },
  {
    id: 'neck_isometrics_flexion_001',
    name: 'Neck Isometrics – Flexion',
    description:
      'Place your palm on your forehead and gently press your head into your hand without allowing movement.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['strength'],
    equipment: ['none'],
    holdTime: '5 seconds',
    reps: '8–10 reps',
    sets: '2–3 sets',
    timeToComplete: '3–5 minutes'
  },
  {
    id: 'neck_isometrics_extension_001',
    name: 'Neck Isometrics – Extension',
    description:
      'Place your hands behind your head and gently press the back of your head into your hands without moving.',
    bodyAreas: ['neck'],
    intensity: 'low',
    goals: ['strength', 'posture'],
    equipment: ['none'],
    holdTime: '5 seconds',
    reps: '8–10 reps',
    sets: '2–3 sets'
  },

  // -------- UPPER BACK (14) --------
  {
    id: 'wall_angels_001',
    name: 'Wall Angels',
    description:
      'Stand with your back against a wall, arms bent like goalposts, and slowly slide your arms up and down while keeping contact as able.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['posture', 'mobility'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets',
    timeToComplete: '3–6 minutes',
    notes: 'Keep ribs down and avoid excessive arching of the low back.'
  },
  {
    id: 'thoracic_extension_chair_001',
    name: 'Thoracic Extension over Chair',
    description:
      'Sit with the back of a chair at mid-back level, hands behind your head, and gently lean back over the chair edge.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['chair'],
    reps: '10–12 reps',
    sets: '2 sets',
    timeToComplete: '3–4 minutes'
  },
  {
    id: 'foam_roll_thoracic_extension_001',
    name: 'Thoracic Extension on Foam Roll',
    description:
      'Lie with a foam roll across your upper back and gently extend over it, supporting your head and neck.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['foam_roll'],
    reps: '8–10 reps',
    sets: '2 sets'
  },
  {
    id: 'open_book_001',
    name: 'Open Book Thoracic Rotation',
    description:
      'Lying on your side with knees bent, rotate your top arm and chest open toward the opposite side while following with your eyes.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['none'],
    reps: '10 reps each side',
    sets: '2 sets',
    timeToComplete: '3–5 minutes'
  },
  {
    id: 'prone_T_raises_001',
    name: 'Prone T Raises',
    description:
      'Lying face down with arms out to the side in a T, lift your arms slightly off the surface, squeezing shoulder blades together.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'prone_Y_raises_001',
    name: 'Prone Y Raises',
    description:
      'Lying face down with arms overhead in a Y, lift your arms slightly off the surface, focusing on lower trapezius activation.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['none'],
    reps: '8–12 reps',
    sets: '2–3 sets'
  },
  {
    id: 'band_pull_aparts_001',
    name: 'Band Pull-Aparts',
    description:
      'Hold a resistance band at shoulder height and pull it apart by moving your hands outward, squeezing shoulder blades together.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets',
    timeToComplete: '4–6 minutes'
  },
  {
    id: 'resistance_band_row_001',
    name: 'Resistance Band Row',
    description:
      'With a band anchored in front of you, pull the band toward your ribs, squeezing your shoulder blades together, then slowly return.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets',
    timeToComplete: '5–7 minutes',
    notes: 'Keep shoulders down away from ears; avoid shrugging.'
  },
  {
    id: 'scap_squeezes_001',
    name: 'Scapular Squeezes',
    description:
      'Sitting or standing tall, gently squeeze your shoulder blades back and down, then relax.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['posture'],
    equipment: ['none'],
    reps: '10–20 reps',
    sets: '2–3 sets'
  },
  {
    id: 'cat_camel_001',
    name: 'Cat–Camel',
    description:
      'On hands and knees, slowly alternate between rounding your back toward the ceiling and gently arching it toward the floor.',
    bodyAreas: ['upper_back', 'lower_back'],
    intensity: 'low',
    goals: ['mobility'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2 sets',
    timeToComplete: '3–5 minutes',
    notes: 'Move smoothly through a pain-free range.'
  },
  {
    id: 'quadruped_thoracic_rotation_001',
    name: 'Quadruped Thoracic Rotation',
    description:
      'On hands and knees, place one hand behind your head and rotate your elbow up toward the ceiling, then back down.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['none'],
    reps: '8–10 reps each side',
    sets: '2 sets'
  },
  {
    id: 'seated_posture_reset_001',
    name: 'Seated Posture Reset',
    description:
      'From a slouched posture, gently roll your pelvis forward, lift your chest, and gently tuck your chin to find a neutral upright position.',
    bodyAreas: ['upper_back', 'neck'],
    intensity: 'low',
    goals: ['posture', 'pain_management'],
    equipment: ['chair'],
    reps: '10 reps',
    sets: '2 sets',
    timeToComplete: '2–3 minutes'
  },
  {
    id: 'doorway_pec_stretch_001',
    name: 'Doorway Pec Stretch',
    description:
      'Place your forearms on the sides of a doorway and gently lean forward until a stretch is felt in the chest and front of shoulders.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps',
    sets: '1–2 sets'
  },
  {
    id: 'thread_the_needle_001',
    name: 'Thread the Needle',
    description:
      'On hands and knees, slide one arm under your body and across, allowing the torso to rotate, then return and switch sides.',
    bodyAreas: ['upper_back'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '8–10 reps each side',
    sets: '2 sets'
  },

  // -------- LOWER BACK (14) --------
  {
    id: 'pelvic_tilt_001',
    name: 'Supine Pelvic Tilts',
    description:
      'Lying on your back with knees bent, gently flatten your low back into the surface by tightening your abdominal muscles, then relax.',
    bodyAreas: ['lower_back', 'core'],
    intensity: 'low',
    goals: ['pain_management'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets',
    timeToComplete: '3–5 minutes'
  },
  {
    id: 'childs_pose_001',
    name: "Child's Pose",
    description:
      'From hands and knees, sit your hips back toward your heels and reach your arms forward, letting your chest sink toward the floor.',
    bodyAreas: ['lower_back', 'hip'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps',
    sets: '1–2 sets'
  },
  {
    id: 'supine_knee_to_chest_001',
    name: 'Single Knee-to-Chest Stretch',
    description:
      'Lying on your back, bring one knee toward your chest and gently hug it in until a stretch is felt in the low back and hip.',
    bodyAreas: ['lower_back', 'hip'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each leg',
    sets: '1–2 sets'
  },
  {
    id: 'double_knee_to_chest_001',
    name: 'Double Knee-to-Chest Stretch',
    description:
      'Lying on your back, bring both knees toward your chest and gently hug them in, keeping the neck relaxed.',
    bodyAreas: ['lower_back'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps',
    sets: '1–2 sets'
  },
  {
    id: 'lumbar_rotation_supine_001',
    name: 'Supine Lumbar Rotation',
    description:
      'Lying on your back with knees bent together, gently allow your knees to roll to one side, then the other, within a comfortable range.',
    bodyAreas: ['lower_back'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '10 reps each side',
    sets: '2 sets'
  },
  {
    id: 'bridge_001',
    name: 'Glute Bridge',
    description:
      'Lying on your back with knees bent and feet hip-width apart, tighten your core and squeeze your glutes to lift your hips, then slowly lower.',
    bodyAreas: ['hip', 'lower_back', 'core'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets',
    timeToComplete: '3–5 minutes',
    progressions: ['bridge_single_leg_001']
  },
  {
    id: 'bridge_march_001',
    name: 'Marching Bridge',
    description:
      'From a bridge position, alternate lifting one foot a few inches off the ground while keeping hips level.',
    bodyAreas: ['lower_back', 'hip', 'core'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '8–12 reps each side',
    sets: '2–3 sets',
    regressions: ['bridge_001']
  },
  {
    id: 'bird_dog_001',
    name: 'Bird Dog',
    description:
      'On hands and knees, extend one arm and the opposite leg, keeping your trunk stable, then return and switch sides.',
    bodyAreas: ['lower_back', 'core'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'dead_bug_001',
    name: 'Dead Bug',
    description:
      'Lying on your back with hips and knees at 90°, slowly lower the opposite arm and leg toward the floor while maintaining a neutral spine.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'hip_hinge_dowel_001',
    name: 'Hip Hinge with Dowel',
    description:
      'With a dowel or stick along your spine, hinge at the hips while keeping the dowel in contact with the back of the head, upper back, and tailbone.',
    bodyAreas: ['lower_back', 'hip'],
    intensity: 'medium',
    goals: ['posture', 'strength'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'standing_back_extension_001',
    name: 'Standing Back Extensions',
    description:
      'Place your hands on your hips and gently lean backward within a comfortable range, returning to upright.',
    bodyAreas: ['lower_back'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '10 reps',
    sets: '2–3 sets'
  },
  {
    id: 'seated_lumbar_flexion_stretch_001',
    name: 'Seated Lumbar Flexion Stretch',
    description:
      'Sitting on a chair, slowly bend forward to let your hands slide toward the floor, relaxing your low back.',
    bodyAreas: ['lower_back'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['chair'],
    holdTime: '15–20 seconds',
    reps: '3–4 reps',
    sets: '1–2 sets'
  },
  {
    id: 'prone_press_up_001',
    name: 'Prone Press-Ups',
    description:
      'Lying on your stomach with hands under shoulders, gently press your upper body up while keeping hips on the surface.',
    bodyAreas: ['lower_back'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['none'],
    reps: '10 reps',
    sets: '2–3 sets',
    notes: 'Often used in extension-based low back programs as tolerated.'
  },
  {
    id: 'side_plank_knees_001',
    name: 'Side Plank on Knees',
    description:
      'Lying on your side, support yourself on your forearm and knees, lifting your hips to form a straight line from shoulders to knees.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    holdTime: '10–20 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets',
    progressions: ['side_plank_feet_001']
  },

  // -------- SHOULDER (14) --------
  {
    id: 'pendulum_001',
    name: 'Shoulder Pendulums',
    description:
      'Lean forward with one hand supported on a table, let the opposite arm hang, and gently swing it in small circles or back and forth.',
    bodyAreas: ['shoulder'],
    intensity: 'low',
    goals: ['pain_management', 'mobility'],
    equipment: ['chair'],
    timeToComplete: '2–3 minutes'
  },
  {
    id: 'supine_wand_flexion_001',
    name: 'Supine Wand Flexion',
    description:
      'Lying on your back holding a stick or cane with both hands, use the unaffected arm to help lift both arms overhead.',
    bodyAreas: ['shoulder'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'supine_wand_external_rotation_001',
    name: 'Supine Wand External Rotation',
    description:
      'Lying on your back with elbows at your sides, use the unaffected arm and a stick to gently rotate the affected forearm outward.',
    bodyAreas: ['shoulder'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2 sets'
  },
  {
    id: 'wall_slide_flexion_001',
    name: 'Wall Slide Flexion',
    description:
      'Facing a wall, place your hands on it and slide them upward, allowing your shoulder blades to rotate upward.',
    bodyAreas: ['shoulder', 'upper_back'],
    intensity: 'low',
    goals: ['mobility', 'posture'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'serratus_wall_slide_001',
    name: 'Serratus Wall Slide',
    description:
      'With forearms on the wall and a slight forward lean, slide your arms upward while gently pushing your shoulder blades forward and up.',
    bodyAreas: ['shoulder', 'upper_back'],
    intensity: 'medium',
    goals: ['posture'],
    equipment: ['none'],
    reps: '8–12 reps',
    sets: '2–3 sets'
  },
  {
    id: 'sidelying_external_rotation_001',
    name: 'Sidelying External Rotation',
    description:
      'Lying on your side with elbow at your side and bent 90°, rotate your forearm upward, then slowly lower.',
    bodyAreas: ['shoulder'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'band_external_rotation_001',
    name: 'Band External Rotation',
    description:
      'Standing with elbow at your side and bent 90°, hold a band and rotate your forearm outward, then slowly return.',
    bodyAreas: ['shoulder'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'band_internal_rotation_001',
    name: 'Band Internal Rotation',
    description:
      'Standing with elbow at your side and bent 90°, hold a band and pull your forearm toward your body, then slowly return.',
    bodyAreas: ['shoulder'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'scap_plane_elevation_001',
    name: 'Scaption with Light Weights',
    description:
      'Holding light dumbbells, raise your arms in a V shape in the plane of the scapula (about 30° forward of the body) to shoulder height.',
    bodyAreas: ['shoulder', 'upper_back'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['dumbbells'],
    reps: '8–12 reps',
    sets: '2–3 sets'
  },
  {
    id: 'shoulder_isometrics_001',
    name: 'Shoulder Isometrics',
    description:
      'Stand near a wall and gently press your hand into it in different directions (flexion, abduction, internal, external rotation) without movement.',
    bodyAreas: ['shoulder'],
    intensity: 'low',
    goals: ['pain_management'],
    equipment: ['none'],
    holdTime: '5 seconds',
    reps: '5–10 reps each direction',
    sets: '1–2 sets'
  },
  {
    id: 'shoulder_abduction_scaption_001',
    name: 'Standing Shoulder Abduction/Scaption',
    description:
      'Raise your arm out to the side or slightly forward to shoulder height, then slowly lower.',
    bodyAreas: ['shoulder'],
    intensity: 'medium',
    goals: ['strength', 'mobility'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'prone_I_raises_001',
    name: 'Prone I Raises',
    description:
      'Lying face down with arms by your sides, lift your arms toward your feet, squeezing your shoulder blades down and together.',
    bodyAreas: ['upper_back', 'shoulder'],
    intensity: 'medium',
    goals: ['strength', 'posture'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'table_slide_flexion_001',
    name: 'Table Slide Flexion',
    description:
      'Sitting at a table, place your hands on a towel and slide them forward to gently raise your shoulders into flexion.',
    bodyAreas: ['shoulder'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['chair'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'shoulder_cross_body_stretch_001',
    name: 'Cross-Body Shoulder Stretch',
    description:
      'Bring one arm across your chest and gently pull it closer with the opposite hand until a stretch is felt in the back of the shoulder.',
    bodyAreas: ['shoulder', 'upper_back'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each arm',
    sets: '1–2 sets'
  },

  // -------- HIP (14) --------
  {
    id: 'clamshell_001',
    name: 'Clamshell',
    description:
      'Lying on your side with hips and knees bent, keep your feet together and open your top knee like a clamshell, then slowly lower.',
    bodyAreas: ['hip'],
    intensity: 'low',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps each side',
    sets: '2–3 sets',
    notes: 'Avoid rolling your pelvis backward; movement should come from the hip.'
  },
  {
    id: 'side_lying_hip_abduction_001',
    name: 'Side-Lying Hip Abduction',
    description:
      'Lying on your side with bottom leg slightly bent, lift the top leg straight up, then slowly lower.',
    bodyAreas: ['hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'monster_walks_band_001',
    name: 'Monster Walks with Band',
    description:
      'With a resistance band around your thighs or ankles, step diagonally forward and outward, maintaining tension in the band.',
    bodyAreas: ['hip', 'knee'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 steps each direction',
    sets: '2–3 sets'
  },
  {
    id: 'sit_to_stand_001',
    name: 'Sit-to-Stand',
    description:
      'From a chair, stand up using your legs as much as possible, then slowly sit back down.',
    bodyAreas: ['hip', 'knee', 'core'],
    intensity: 'medium',
    goals: ['strength', 'endurance'],
    equipment: ['chair'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'lateral_step_ups_001',
    name: 'Lateral Step-Ups',
    description:
      'Step sideways up onto a step with one leg, then bring the other leg up and step back down.',
    bodyAreas: ['hip', 'knee'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['step'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'half_kneeling_hip_flexor_stretch_001',
    name: 'Half-Kneeling Hip Flexor Stretch',
    description:
      'In a half-kneeling position, gently shift your weight forward until you feel a stretch in the front of the hip on the kneeling leg.',
    bodyAreas: ['hip'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'piriformis_figure4_stretch_001',
    name: 'Figure-4 Piriformis Stretch',
    description:
      'Lying on your back, cross one ankle over the opposite knee and gently pull the uncrossed leg toward your chest.',
    bodyAreas: ['hip'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'hip_external_rotation_stretch_001',
    name: 'Seated Hip External Rotation Stretch',
    description:
      'Sitting on a chair, cross one ankle over the opposite knee and gently press the crossed knee downward.',
    bodyAreas: ['hip'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['chair'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'bridge_single_leg_001',
    name: 'Single-Leg Bridge',
    description:
      'From a bridge position, extend one leg straight while keeping the thighs level, then lift and lower the hips using the support leg.',
    bodyAreas: ['hip', 'lower_back', 'core'],
    intensity: 'high',
    goals: ['strength'],
    equipment: ['none'],
    reps: '8–12 reps each side',
    sets: '2–3 sets',
    regressions: ['bridge_001']
  },
  {
    id: 'hip_air_squats_001',
    name: 'Bodyweight Squats',
    description:
      'With feet shoulder-width apart, sit your hips back and down as if into a chair, then stand back up.',
    bodyAreas: ['hip', 'knee', 'core'],
    intensity: 'medium',
    goals: ['strength', 'endurance'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'hip_hinge_wall_tap_001',
    name: 'Hip Hinge Wall Tap',
    description:
      'Stand facing away from a wall and hinge at the hips to tap your glutes lightly to the wall, then return to standing.',
    bodyAreas: ['hip', 'lower_back'],
    intensity: 'low',
    goals: ['posture', 'strength'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'quadruped_fire_hydrants_001',
    name: 'Quadruped Fire Hydrants',
    description:
      'On hands and knees, lift one knee out to the side while keeping the pelvis level, then lower.',
    bodyAreas: ['hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'standing_hip_extension_band_001',
    name: 'Standing Hip Extension with Band',
    description:
      'With a band around your ankle and attached behind you, extend your leg straight back without arching your low back.',
    bodyAreas: ['hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'standing_hip_abduction_band_001',
    name: 'Standing Hip Abduction with Band',
    description:
      'With a band around your ankles, move one leg out to the side while keeping your trunk upright.',
    bodyAreas: ['hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 reps each side',
    sets: '2–3 sets'
  },

  // -------- CORE (12) --------
  {
    id: 'front_plank_knees_001',
    name: 'Front Plank on Knees',
    description:
      'Support yourself on your forearms and knees, keeping a straight line from shoulders to knees while bracing your core.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    holdTime: '10–20 seconds',
    reps: '2–3 reps',
    sets: '2–3 sets',
    progressions: ['front_plank_feet_001']
  },
  {
    id: 'front_plank_feet_001',
    name: 'Front Plank on Feet',
    description:
      'Support yourself on your forearms and toes, keeping a straight line from head to heels.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'high',
    goals: ['strength', 'endurance'],
    equipment: ['none'],
    holdTime: '15–30 seconds',
    reps: '2–3 reps',
    sets: '2–3 sets',
    regressions: ['front_plank_knees_001']
  },
  {
    id: 'side_plank_feet_001',
    name: 'Side Plank on Feet',
    description:
      'Lying on your side, support yourself on your forearm and feet, lifting your hips to form a straight line.',
    bodyAreas: ['core'],
    intensity: 'high',
    goals: ['strength'],
    equipment: ['none'],
    holdTime: '10–20 seconds',
    reps: '2–3 reps each side',
    sets: '2–3 sets',
    regressions: ['side_plank_knees_001']
  },
  {
    id: 'abdominal_bracing_001',
    name: 'Abdominal Bracing',
    description:
      'Lying on your back with knees bent, gently tighten your abdominal muscles as if preparing for a light poke.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'low',
    goals: ['pain_management'],
    equipment: ['none'],
    holdTime: '5–10 seconds',
    reps: '8–10 reps',
    sets: '2 sets'
  },
  {
    id: 'heel_taps_supine_001',
    name: 'Supine Heel Taps',
    description:
      'Lying on your back with hips and knees bent, gently tap one heel to the floor at a time while maintaining core engagement.',
    bodyAreas: ['core'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–20 reps',
    sets: '2–3 sets'
  },
  {
    id: 'pallof_press_band_001',
    name: 'Pallof Press with Band',
    description:
      'Standing sideways to a band anchor, hold the band at your chest and press it straight out, resisting rotation.',
    bodyAreas: ['core'],
    intensity: 'medium',
    goals: ['posture'],
    equipment: ['resistance_band'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'wall_dead_bug_001',
    name: 'Wall Dead Bug',
    description:
      'Lying on your back with hips and knees at 90°, press your hands into the wall above your head while tapping alternate heels to the floor.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'seated_march_core_001',
    name: 'Seated March for Core',
    description:
      'Sitting tall at the edge of a chair, brace your core and alternately lift each knee.',
    bodyAreas: ['core', 'hip'],
    intensity: 'low',
    goals: ['endurance'],
    equipment: ['chair'],
    reps: '20–30 marches',
    sets: '2–3 sets'
  },
  {
    id: 'standing_anti_rotation_press_001',
    name: 'Standing Anti-Rotation Press',
    description:
      'Similar to a Pallof press, stand and press a band away from your chest, resisting rotation of your trunk.',
    bodyAreas: ['core'],
    intensity: 'medium',
    goals: ['posture'],
    equipment: ['resistance_band'],
    reps: '8–12 reps each side',
    sets: '2–3 sets'
  },
  {
    id: 'farmer_carry_001',
    name: 'Farmer Carry',
    description:
      'Hold a weight in each hand at your sides and walk with an upright posture, keeping your core engaged.',
    bodyAreas: ['core', 'shoulder'],
    intensity: 'medium',
    goals: ['endurance', 'posture'],
    equipment: ['dumbbells'],
    timeToComplete: '1–3 minutes',
    reps: '2–3 walks',
    sets: '1–2 sets'
  },
  {
    id: 'quadruped_hover_001',
    name: 'Quadruped Hover',
    description:
      'On hands and knees, brace your core and lift your knees just off the ground, holding without letting your back arch.',
    bodyAreas: ['core', 'lower_back'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    holdTime: '5–10 seconds',
    reps: '6–10 reps',
    sets: '2–3 sets'
  },
  {
    id: 'standing_core_rotation_band_001',
    name: 'Standing Core Rotation with Band',
    description:
      'Facing a band anchor, hold the band with both hands and rotate your trunk and arms together, then return slowly.',
    bodyAreas: ['core'],
    intensity: 'medium',
    goals: ['mobility'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },

  // -------- KNEE (10) --------
  {
    id: 'quad_sets_001',
    name: 'Quad Sets',
    description:
      'Lying or sitting with the leg straight, tighten the thigh muscle to press the back of the knee toward the surface.',
    bodyAreas: ['knee'],
    intensity: 'low',
    goals: ['strength', 'pain_management'],
    equipment: ['none'],
    holdTime: '3–5 seconds',
    reps: '10–20 reps',
    sets: '2–3 sets'
  },
  {
    id: 'straight_leg_raise_001',
    name: 'Straight Leg Raise',
    description:
      'Lying on your back, one knee bent and the other leg straight, tighten your thigh and core and lift the straight leg, then lower slowly.',
    bodyAreas: ['knee', 'hip', 'core'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['none'],
    reps: '10–15 reps each leg',
    sets: '2–3 sets'
  },
  {
    id: 'short_arc_quad_001',
    name: 'Short-Arc Quad',
    description:
      'With a rolled towel or bolster under your knee, straighten your leg by lifting your heel, then lower slowly.',
    bodyAreas: ['knee'],
    intensity: 'low',
    goals: ['strength', 'posture'],
    equipment: ['chair'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'heel_slides_001',
    name: 'Heel Slides',
    description:
      'Lying on your back, slowly slide your heel toward your buttocks to bend the knee, then slide it back out to straighten.',
    bodyAreas: ['knee'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'wall_sit_001',
    name: 'Wall Sit',
    description:
      'Stand with your back against a wall and slide down into a partial squat, holding with knees aligned over ankles.',
    bodyAreas: ['knee', 'hip', 'core'],
    intensity: 'medium',
    goals: ['strength', 'endurance'],
    equipment: ['none'],
    holdTime: '15–30 seconds',
    reps: '2–3 reps',
    sets: '2–3 sets'
  },
  {
    id: 'step_ups_001',
    name: 'Forward Step-Ups',
    description:
      'Step up onto a step with one leg, then bring the other leg up and step back down with control.',
    bodyAreas: ['knee', 'hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['step'],
    reps: '8–12 reps each leg',
    sets: '2–3 sets'
  },
  {
    id: 'lateral_step_down_001',
    name: 'Lateral Step-Down',
    description:
      'Stand sideways on a step and slowly lower the outside foot toward the floor, then return to the start position.',
    bodyAreas: ['knee', 'hip'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['step'],
    reps: '8–12 reps each leg',
    sets: '2–3 sets'
  },
  {
    id: 'hamstring_stretch_supine_001',
    name: 'Supine Hamstring Stretch',
    description:
      'Lying on your back, loop a strap or towel around your foot and gently straighten your knee toward the ceiling.',
    bodyAreas: ['knee', 'hip'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each leg',
    sets: '1–2 sets'
  },
  {
    id: 'calf_stretch_wall_001',
    name: 'Standing Calf Stretch',
    description:
      'Facing a wall, place one foot back and keep the heel down as you lean forward until a stretch is felt in the calf.',
    bodyAreas: ['knee', 'ankle'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each leg',
    sets: '1–2 sets'
  },
  {
    id: 'terminal_knee_extension_band_001',
    name: 'Terminal Knee Extension with Band',
    description:
      'With a band looped behind your knee, slightly bend the knee then straighten it against the resistance.',
    bodyAreas: ['knee'],
    intensity: 'medium',
    goals: ['strength'],
    equipment: ['resistance_band'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },

  // -------- WRIST (4) --------
  {
    id: 'wrist_flexor_stretch_001',
    name: 'Wrist Flexor Stretch',
    description:
      'With your elbow straight and palm facing up, gently pull your fingers back with the opposite hand.',
    bodyAreas: ['wrist', 'elbow'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'wrist_extensor_stretch_001',
    name: 'Wrist Extensor Stretch',
    description:
      'With your elbow straight and palm facing down, gently flex your wrist and assist with the opposite hand.',
    bodyAreas: ['wrist', 'elbow'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'wrist_isometrics_001',
    name: 'Wrist Isometrics',
    description:
      'Gently press your hand into the opposite hand in different directions (flexion, extension, radial and ulnar deviation) without movement.',
    bodyAreas: ['wrist'],
    intensity: 'low',
    goals: ['pain_management'],
    equipment: ['none'],
    holdTime: '5 seconds',
    reps: '5–8 reps each direction',
    sets: '1–2 sets'
  },
  {
    id: 'grip_squeeze_001',
    name: 'Grip Squeezes',
    description:
      'Squeeze a soft ball or rolled towel, holding briefly before relaxing.',
    bodyAreas: ['wrist'],
    intensity: 'low',
    goals: ['strength', 'endurance'],
    equipment: ['none'],
    reps: '10–20 reps',
    sets: '2–3 sets'
  },

  // -------- ELBOW (4) --------
  {
    id: 'eccentric_wrist_extension_001',
    name: 'Eccentric Wrist Extension',
    description:
      'Holding a light weight, use the opposite hand to lift the wrist into extension and then slowly lower it down.',
    bodyAreas: ['elbow', 'wrist'],
    intensity: 'medium',
    goals: ['strength', 'pain_management'],
    equipment: ['dumbbells'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'pronation_supination_001',
    name: 'Pronation/Supination with Dumbbell',
    description:
      'Holding a light dumbbell like a hammer, rotate your forearm palm up and palm down through a comfortable range.',
    bodyAreas: ['elbow', 'wrist'],
    intensity: 'low',
    goals: ['mobility', 'strength'],
    equipment: ['dumbbells'],
    reps: '10–15 reps',
    sets: '2–3 sets'
  },
  {
    id: 'triceps_stretch_001',
    name: 'Triceps Stretch',
    description:
      'Raise one arm overhead, bend the elbow so the hand reaches down the back, and gently assist with the opposite hand.',
    bodyAreas: ['elbow', 'shoulder'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },
  {
    id: 'biceps_stretch_001',
    name: 'Biceps Stretch',
    description:
      'Stand facing away from a wall and place your palm on it with the elbow straight, gently turning your body away until a stretch is felt.',
    bodyAreas: ['elbow', 'shoulder'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    holdTime: '20–30 seconds',
    reps: '2–3 reps each side',
    sets: '1–2 sets'
  },

  // -------- ANKLE (6) --------
  {
    id: 'ankle_pumps_001',
    name: 'Ankle Pumps',
    description:
      'Lying or sitting with legs supported, repeatedly pull your toes toward you and then point them away.',
    bodyAreas: ['ankle'],
    intensity: 'low',
    goals: ['mobility', 'endurance'],
    equipment: ['none'],
    reps: '20–30 reps',
    sets: '2–3 sets'
  },
  {
    id: 'ankle_circles_001',
    name: 'Ankle Circles',
    description:
      'Rotate your ankle slowly in circles in both directions through a comfortable range.',
    bodyAreas: ['ankle'],
    intensity: 'low',
    goals: ['mobility', 'pain_management'],
    equipment: ['none'],
    reps: '10 circles each direction',
    sets: '2–3 sets'
  },
  {
    id: 'ankle_alphabet_001',
    name: 'Ankle Alphabet',
    description:
      'Trace the letters of the alphabet in the air with your big toe, moving from the ankle.',
    bodyAreas: ['ankle'],
    intensity: 'low',
    goals: ['mobility'],
    equipment: ['none'],
    timeToComplete: '2–3 minutes'
  },
  {
    id: 'calf_raise_double_001',
    name: 'Double-Leg Calf Raises',
    description:
      'Rise up onto the balls of both feet and lower back down slowly.',
    bodyAreas: ['ankle'],
    intensity: 'medium',
    goals: ['strength', 'endurance'],
    equipment: ['none'],
    reps: '10–20 reps',
    sets: '2–3 sets'
  },
  {
    id: 'calf_raise_single_001',
    name: 'Single-Leg Calf Raises',
    description:
      'Standing on one leg, rise up onto the ball of the foot and lower back down slowly while holding onto support as needed.',
    bodyAreas: ['ankle'],
    intensity: 'high',
    goals: ['strength'],
    equipment: ['chair'],
    reps: '8–12 reps each leg',
    sets: '2–3 sets'
  },
  {
    id: 'towel_scrunches_001',
    name: 'Towel Scrunches',
    description:
      'While seated, place a towel under your foot and scrunch it toward you using your toes.',
    bodyAreas: ['ankle'],
    intensity: 'low',
    goals: ['strength', 'endurance'],
    equipment: ['chair'],
    reps: '10–20 scrunches',
    sets: '2–3 sets'
  }
];
