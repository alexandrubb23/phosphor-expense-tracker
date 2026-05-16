import { forwardRef, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

// ---------------------------------------------------------------------------
// DesktopNav
// ---------------------------------------------------------------------------

export function DesktopNav({ children }: { children: React.ReactNode }) {
  return <div className="max-sm:hidden">{children}</div>;
}

// ---------------------------------------------------------------------------
// BurgerButton (internal — consumed only by MobileMenu)
// ---------------------------------------------------------------------------

interface BurgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const BurgerButton = forwardRef<HTMLButtonElement, BurgerButtonProps>(
  function BurgerButton({ isOpen, onToggle }, ref) {
    return (
      <button
        ref={ref}
        className="sm:hidden flex h-7 w-7 flex-col items-center justify-center gap-[4.5px] border border-hairline-glow bg-transparent transition-colors duration-200 hover:border-cyan"
        onClick={onToggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span
          className={`block h-px w-3.5 origin-center bg-cyan transition-all duration-200 ${
            isOpen ? "translate-y-1.25 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-px w-3.5 bg-cyan transition-all duration-200 ${
            isOpen ? "scale-x-0 opacity-0" : ""
          }`}
        />
        <span
          className={`block h-px w-3.5 origin-center bg-cyan transition-all duration-200 ${
            isOpen ? "-translate-y-1.25 -rotate-45" : ""
          }`}
        />
      </button>
    );
  }
);

// ---------------------------------------------------------------------------
// MobileMenu — owns open state, refs, and click-outside effect
// ---------------------------------------------------------------------------

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    [buttonRef, dropdownRef] as React.RefObject<HTMLElement>[],
    () => setIsOpen(false)
  );

  return (
    <>
      <BurgerButton
        ref={buttonRef}
        isOpen={isOpen}
        onToggle={() => setIsOpen((o) => !o)}
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="sm:hidden absolute top-full left-0 right-0 z-50 border border-t-0 border-hairline bg-surface px-4.5 py-3.5 animate-fade-in"
        >
          {children}
        </div>
      )}
    </>
  );
}
