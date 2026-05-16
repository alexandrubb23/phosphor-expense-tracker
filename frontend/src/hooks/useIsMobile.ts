import { useMediaQuery } from "usehooks-ts";

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
