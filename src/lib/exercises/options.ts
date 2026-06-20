export const exerciseMuscleGroupOptions = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Glúteos",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Abdomen",
  "Core",
  "Full body",
  "Cardio",
  "Otro",
] as const;

export const exerciseCategoryOptions = [
  "Fuerza",
  "Hipertrofia",
  "Resistencia",
  "Movilidad",
  "Cardio",
  "Técnica",
  "Calentamiento",
  "Estiramiento",
  "Rehabilitación",
  "Otro",
] as const;

export const exerciseTypeOptions = [
  "Peso corporal",
  "Máquina",
  "Mancuernas",
  "Barra",
  "Banda elástica",
  "Polea",
  "Kettlebell",
  "Cardio",
  "Funcional",
  "Otro",
] as const;

function normalizeOption(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

export function resolveExerciseOption(
  value: string,
  options: readonly string[],
) {
  const normalizedValue = normalizeOption(value);

  return (
    options.find(
      (option) => normalizeOption(option) === normalizedValue,
    ) ?? value
  );
}

export function getExerciseSelectOptions(
  options: readonly string[],
  currentValue: string,
) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}
