import { BeeMascot } from "../brand/BeeMascot";

/**
 * Marketing mascot alias — same bee-home-2 artwork as BeeMascot / learn-path.
 * Kept so DuoHomeVariants and older imports stay on the brand bee.
 */
export function HomeMascot({
  className = "",
  size = 280,
}: {
  className?: string;
  size?: number;
}) {
  return <BeeMascot className={className} size={size} title="" />;
}
