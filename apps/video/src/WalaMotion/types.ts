import { z } from "zod";

export const walaAtmHookSchema = z.object({
  layout: z.enum(["FULL_MOTION", "TALKING_HEAD"]).default("FULL_MOTION"),
  videoSource: z.string().optional(),
  tagText: z.string().default("WALA • REGLA DE ORO #1"),
  headlinePart1: z.string().default("¿Conoces esa sensación de que"),
  highlightSalón: z.string().default("tu salón de belleza"),
  headlinePart2: z.string().default("es"),
  highlightCajero: z.string().default("tu cajero personal?"),
  businessType: z.string().default("Salón de Belleza"),
  initialBalance: z.number().default(1250),
  withdrawalAmount: z.number().default(350),
  withdrawalConcept: z.string().default("Gastos Personales (Sin Registrar)"),
  alertMessage: z.string().default("28% de la caja drenado en gastos privados"),
});

export type WalaAtmHookProps = z.infer<typeof walaAtmHookSchema>;

export const defaultWalaAtmHookProps: WalaAtmHookProps = {
  layout: "FULL_MOTION",
  tagText: "WALA • CONSULTORÍA FINANCIERA",
  headlinePart1: "¿Conoces esa sensación de que",
  highlightSalón: "tu salón de belleza",
  headlinePart2: "es",
  highlightCajero: "tu cajero personal?",
  businessType: "Salón de Belleza & Spa",
  initialBalance: 1250,
  withdrawalAmount: 350,
  withdrawalConcept: "Gastos Personales (Sin Registrar)",
  alertMessage: "28% de la caja retirado sin registrar",
};
