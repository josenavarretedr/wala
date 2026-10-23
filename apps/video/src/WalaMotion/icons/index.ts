import React from "react";
import { WalaIconProps } from "./types";

// Tipos base
export * from "./types";

// 1. Fila 1
export { WalaClockIcon } from "./WalaClockIcon";
export { WalaCalendarClockIcon } from "./WalaCalendarClockIcon";
export { WalaDocumentPencilIcon } from "./WalaDocumentPencilIcon";
export { WalaTextFrameIcon } from "./WalaTextFrameIcon";

// 2. Fila 2
export { WalaRobotChatIcon } from "./WalaRobotChatIcon";
export { WalaMapLocationIcon } from "./WalaMapLocationIcon";
export { WalaShieldCheckIcon } from "./WalaShieldCheckIcon";
export { WalaSmartwatchIcon } from "./WalaSmartwatchIcon";

// 3. Fila 3
export { WalaFreelancerIcon } from "./WalaFreelancerIcon";
export { WalaDonutChartIcon } from "./WalaDonutChartIcon";
export { WalaMarketingBrowserIcon } from "./WalaMarketingBrowserIcon";
export { WalaCommunityChatIcon } from "./WalaCommunityChatIcon";

// 4. Fila 4
export { WalaBanknoteIcon } from "./WalaBanknoteIcon";
export { WalaDiamondIcon } from "./WalaDiamondIcon";
export { WalaHandCashIcon } from "./WalaHandCashIcon";
export { WalaSignaturePenIcon } from "./WalaSignaturePenIcon";

// 5. Fila 5
export { WalaDiscountCouponsIcon } from "./WalaDiscountCouponsIcon";
export { WalaSaleBadgeIcon } from "./WalaSaleBadgeIcon";
export { WalaShoppingCartIcon } from "./WalaShoppingCartIcon";
export { WalaGiftTagIcon } from "./WalaGiftTagIcon";

// 6. Fila 6
export { WalaNewspaperIcon } from "./WalaNewspaperIcon";
export { WalaGeometricShapesIcon } from "./WalaGeometricShapesIcon";
export { WalaPhotoGalleryIcon } from "./WalaPhotoGalleryIcon";
export { WalaMusicAudioIcon } from "./WalaMusicAudioIcon";

// Alias convenientes cortos sin prefijo Wala
export { WalaClockIcon as ClockIcon } from "./WalaClockIcon";
export { WalaCalendarClockIcon as CalendarClockIcon } from "./WalaCalendarClockIcon";
export { WalaDocumentPencilIcon as DocumentPencilIcon } from "./WalaDocumentPencilIcon";
export { WalaTextFrameIcon as TextFrameIcon } from "./WalaTextFrameIcon";

export { WalaRobotChatIcon as RobotChatIcon } from "./WalaRobotChatIcon";
export { WalaMapLocationIcon as MapLocationIcon } from "./WalaMapLocationIcon";
export { WalaShieldCheckIcon as ShieldCheckIcon } from "./WalaShieldCheckIcon";
export { WalaSmartwatchIcon as SmartwatchIcon } from "./WalaSmartwatchIcon";

export { WalaFreelancerIcon as FreelancerIcon } from "./WalaFreelancerIcon";
export { WalaDonutChartIcon as DonutChartIcon } from "./WalaDonutChartIcon";
export { WalaMarketingBrowserIcon as MarketingBrowserIcon } from "./WalaMarketingBrowserIcon";
export { WalaCommunityChatIcon as CommunityChatIcon } from "./WalaCommunityChatIcon";

export { WalaBanknoteIcon as BanknoteIcon } from "./WalaBanknoteIcon";
export { WalaDiamondIcon as DiamondIcon } from "./WalaDiamondIcon";
export { WalaHandCashIcon as HandCashIcon } from "./WalaHandCashIcon";
export { WalaSignaturePenIcon as SignaturePenIcon } from "./WalaSignaturePenIcon";

export { WalaDiscountCouponsIcon as DiscountCouponsIcon } from "./WalaDiscountCouponsIcon";
export { WalaSaleBadgeIcon as SaleBadgeIcon } from "./WalaSaleBadgeIcon";
export { WalaShoppingCartIcon as ShoppingCartIcon } from "./WalaShoppingCartIcon";
export { WalaGiftTagIcon as GiftTagIcon } from "./WalaGiftTagIcon";

export { WalaNewspaperIcon as NewspaperIcon } from "./WalaNewspaperIcon";
export { WalaGeometricShapesIcon as GeometricShapesIcon } from "./WalaGeometricShapesIcon";
export { WalaPhotoGalleryIcon as PhotoGalleryIcon } from "./WalaPhotoGalleryIcon";
export { WalaMusicAudioIcon as MusicAudioIcon } from "./WalaMusicAudioIcon";

// Importaciones para el mapa / diccionario global de iconos
import { WalaClockIcon } from "./WalaClockIcon";
import { WalaCalendarClockIcon } from "./WalaCalendarClockIcon";
import { WalaDocumentPencilIcon } from "./WalaDocumentPencilIcon";
import { WalaTextFrameIcon } from "./WalaTextFrameIcon";

import { WalaRobotChatIcon } from "./WalaRobotChatIcon";
import { WalaMapLocationIcon } from "./WalaMapLocationIcon";
import { WalaShieldCheckIcon } from "./WalaShieldCheckIcon";
import { WalaSmartwatchIcon } from "./WalaSmartwatchIcon";

import { WalaFreelancerIcon } from "./WalaFreelancerIcon";
import { WalaDonutChartIcon } from "./WalaDonutChartIcon";
import { WalaMarketingBrowserIcon } from "./WalaMarketingBrowserIcon";
import { WalaCommunityChatIcon } from "./WalaCommunityChatIcon";

import { WalaBanknoteIcon } from "./WalaBanknoteIcon";
import { WalaDiamondIcon } from "./WalaDiamondIcon";
import { WalaHandCashIcon } from "./WalaHandCashIcon";
import { WalaSignaturePenIcon } from "./WalaSignaturePenIcon";

import { WalaDiscountCouponsIcon } from "./WalaDiscountCouponsIcon";
import { WalaSaleBadgeIcon } from "./WalaSaleBadgeIcon";
import { WalaShoppingCartIcon } from "./WalaShoppingCartIcon";
import { WalaGiftTagIcon } from "./WalaGiftTagIcon";

import { WalaNewspaperIcon } from "./WalaNewspaperIcon";
import { WalaGeometricShapesIcon } from "./WalaGeometricShapesIcon";
import { WalaPhotoGalleryIcon } from "./WalaPhotoGalleryIcon";
import { WalaMusicAudioIcon } from "./WalaMusicAudioIcon";

/**
 * Diccionario de todos los 24 iconos indexados por nombre canónico (kebab-case)
 */
export const WALA_ICONS = {
  // Fila 1
  "clock": WalaClockIcon,
  "calendar-clock": WalaCalendarClockIcon,
  "document-pencil": WalaDocumentPencilIcon,
  "text-frame": WalaTextFrameIcon,

  // Fila 2
  "robot-chat": WalaRobotChatIcon,
  "map-location": WalaMapLocationIcon,
  "shield-check": WalaShieldCheckIcon,
  "smartwatch": WalaSmartwatchIcon,

  // Fila 3
  "freelancer": WalaFreelancerIcon,
  "donut-chart": WalaDonutChartIcon,
  "marketing-browser": WalaMarketingBrowserIcon,
  "community-chat": WalaCommunityChatIcon,

  // Fila 4
  "banknote": WalaBanknoteIcon,
  "diamond": WalaDiamondIcon,
  "hand-cash": WalaHandCashIcon,
  "signature-pen": WalaSignaturePenIcon,

  // Fila 5
  "discount-coupons": WalaDiscountCouponsIcon,
  "sale-badge": WalaSaleBadgeIcon,
  "shopping-cart": WalaShoppingCartIcon,
  "gift-tag": WalaGiftTagIcon,

  // Fila 6
  "newspaper": WalaNewspaperIcon,
  "geometric-shapes": WalaGeometricShapesIcon,
  "photo-gallery": WalaPhotoGalleryIcon,
  "music-audio": WalaMusicAudioIcon,
} as const;

export type WalaIconName = keyof typeof WALA_ICONS;

export interface WalaDynamicIconProps extends WalaIconProps {
  name: WalaIconName;
}

/**
 * Componente polimórfico dinámico para renderizar cualquier icono WALA por su nombre en string.
 *
 * Ejemplo de uso:
 * ```tsx
 * <WalaIcon name="diamond" size={48} />
 * <WalaIcon name="shopping-cart" accentColor="#FF5C00" />
 * ```
 */
export const WalaIcon: React.FC<WalaDynamicIconProps> = ({ name, ...props }) => {
  const Component = WALA_ICONS[name] as React.FC<WalaIconProps>;
  if (!Component) {
    console.warn(`[WalaIcon] No existe el icono con nombre "${name}".`);
    return null;
  }
  return React.createElement(Component, props);
};

/**
 * Catálogo descriptivo de los 24 iconos con metadatos de cuadrícula original
 */
export const WALA_ICONS_CATALOG: Array<{
  name: WalaIconName;
  componentName: string;
  row: number;
  col: number;
  title: string;
  description: string;
}> = [
  // Fila 1
  { name: "clock", componentName: "WalaClockIcon", row: 1, col: 1, title: "Reloj Analógico", description: "Reloj con marcas horarias y minutero en naranja" },
  { name: "calendar-clock", componentName: "WalaCalendarClockIcon", row: 1, col: 2, title: "Calendario con Reloj", description: "Calendario con anillas y días en naranja y reloj" },
  { name: "document-pencil", componentName: "WalaDocumentPencilIcon", row: 1, col: 3, title: "Documento con Lápiz", description: "Hoja de notas con líneas en naranja y lápiz escribiendo" },
  { name: "text-frame", componentName: "WalaTextFrameIcon", row: 1, col: 4, title: "Caja Tipográfica", description: "Marco con nodos esquineros en naranja y letra T con texto" },

  // Fila 2
  { name: "robot-chat", componentName: "WalaRobotChatIcon", row: 2, col: 1, title: "Robot Chatbot IA", description: "Asistente robot con antena y globo de chat con diálogo en naranja" },
  { name: "map-location", componentName: "WalaMapLocationIcon", row: 2, col: 2, title: "Mapa con Cubo Logístico", description: "Mapa plegado con rutas en naranja y paquete 3D" },
  { name: "shield-check", componentName: "WalaShieldCheckIcon", row: 2, col: 3, title: "Escudo y Verificación", description: "Escudo con silueta de usuario en naranja y sello check" },
  { name: "smartwatch", componentName: "WalaSmartwatchIcon", row: 2, col: 4, title: "Smartwatch con Mensaje", description: "Reloj inteligente con correo y franjas de acento en naranja" },

  // Fila 3
  { name: "freelancer", componentName: "WalaFreelancerIcon", row: 3, col: 1, title: "Freelancer con Laptop", description: "Programador/remoto con símbolos de dinero $$ en naranja" },
  { name: "donut-chart", componentName: "WalaDonutChartIcon", row: 3, col: 2, title: "Gráfico Circular de Métricas", description: "Gráfico de dona de 4 sectores con el sector superior en naranja" },
  { name: "marketing-browser", componentName: "WalaMarketingBrowserIcon", row: 3, col: 3, title: "Navegador y Megáfono", description: "Ventana web con ondas sonoras en naranja y bocina de marketing" },
  { name: "community-chat", componentName: "WalaCommunityChatIcon", row: 3, col: 4, title: "Comunidad y Equipo", description: "Dos personas conversando con diálogo en naranja" },

  // Fila 4
  { name: "banknote", componentName: "WalaBanknoteIcon", row: 4, col: 1, title: "Billete de Dinero", description: "Billete con marco interior y símbolo [$] en naranja" },
  { name: "diamond", componentName: "WalaDiamondIcon", row: 4, col: 2, title: "Diamante de Calidad", description: "Gema tallada con destellos radiales de brillo en naranja" },
  { name: "hand-cash", componentName: "WalaHandCashIcon", row: 4, col: 3, title: "Mano con Efectivo", description: "Mano sujetando fajo de billetes con símbolo $ en naranja" },
  { name: "signature-pen", componentName: "WalaSignaturePenIcon", row: 4, col: 4, title: "Firma y Pluma Fuente", description: "Pluma estilográfica con trazo manuscrito fluido en naranja" },

  // Fila 5
  { name: "discount-coupons", componentName: "WalaDiscountCouponsIcon", row: 5, col: 1, title: "Cupones de Descuento", description: "Tarjetas apiladas con bordes de fondo en naranja y %" },
  { name: "sale-badge", componentName: "WalaSaleBadgeIcon", row: 5, col: 2, title: "Sello de Oferta SALE", description: "Insignia dentada tipo explosión con texto SALE en naranja" },
  { name: "shopping-cart", componentName: "WalaShoppingCartIcon", row: 5, col: 3, title: "Carrito de Compras", description: "Carrito de ecommerce con rejilla interior en naranja" },
  { name: "gift-tag", componentName: "WalaGiftTagIcon", row: 5, col: 4, title: "Regalo con Etiqueta", description: "Caja de regalo con lazo y etiqueta colgante de precio en naranja" },

  // Fila 6
  { name: "newspaper", componentName: "WalaNewspaperIcon", row: 6, col: 1, title: "Periódico Editorial", description: "Prensa doblada con titular y líneas de texto en naranja" },
  { name: "geometric-shapes", componentName: "WalaGeometricShapesIcon", row: 6, col: 2, title: "Formas Geométricas", description: "Triángulo, círculo y cuadrado con estrella destacada en naranja" },
  { name: "photo-gallery", componentName: "WalaPhotoGalleryIcon", row: 6, col: 3, title: "Galería de Fotos", description: "Fotografías apiladas con marco posterior en naranja y paisaje" },
  { name: "music-audio", componentName: "WalaMusicAudioIcon", row: 6, col: 4, title: "Notas Musicales y Audio", description: "Corcheas y notas con destellos (+) en naranja" },
];
