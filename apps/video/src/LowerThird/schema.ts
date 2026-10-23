import { z } from "zod";

export const lowerThirdSchema = z.object({
  channelName: z.string(),
  handle: z.string(),
  subscriberCount: z.string(),
  avatarUrl: z.string(),
  buttonText: z.string(),
  subscribedText: z.string(),
  verified: z.boolean(),
  showCursor: z.boolean(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  transparentBackground: z.boolean(),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const defaultLowerThirdProps: LowerThirdProps = {
  channelName: "Alex Tech",
  handle: "@alextech_oficial",
  subscriberCount: "1.48 M suscriptores",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  buttonText: "Suscribirse",
  subscribedText: "Suscrito",
  verified: true,
  showCursor: true,
  accentColor: "#0f0f0f",
  backgroundColor: "#ffffff",
  transparentBackground: false,
};
