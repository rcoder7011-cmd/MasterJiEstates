import gsap from 'gsap';

// Check if user has requested reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Fade In animation utility
 */
export const fadeIn = (target, options = {}) => {
  if (prefersReducedMotion() || !target) return;
  return gsap.fromTo(
    target,
    { opacity: 0 },
    {
      opacity: 1,
      duration: options.duration || 0.4,
      ease: options.ease || 'power2.out',
      delay: options.delay || 0,
      ...options,
    }
  );
};

/**
 * Fade Up entrance animation utility
 */
export const fadeUp = (target, options = {}) => {
  if (prefersReducedMotion() || !target) return;
  return gsap.fromTo(
    target,
    { opacity: 0, y: options.y || 24 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.6,
      ease: options.ease || 'power2.out',
      delay: options.delay || 0,
      ...options,
    }
  );
};

/**
 * Slide In animation utility (from left or right)
 */
export const slideIn = (target, direction = 'left', options = {}) => {
  if (prefersReducedMotion() || !target) return;
  const xOffset = direction === 'left' ? -32 : 32;
  return gsap.fromTo(
    target,
    { opacity: 0, x: xOffset },
    {
      opacity: 1,
      x: 0,
      duration: options.duration || 0.5,
      ease: options.ease || 'power2.out',
      delay: options.delay || 0,
      ...options,
    }
  );
};

/**
 * Subtle Scale In animation utility
 */
export const scaleIn = (target, options = {}) => {
  if (prefersReducedMotion() || !target) return;
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration: options.duration || 0.4,
      ease: options.ease || 'back.out(1.4)',
      delay: options.delay || 0,
      ...options,
    }
  );
};

/**
 * Staggered Fade Up for lists, grids, or cards
 */
export const staggerFadeUp = (targets, options = {}) => {
  if (prefersReducedMotion() || !targets) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: options.y || 20 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.5,
      stagger: options.stagger || 0.08,
      ease: options.ease || 'power2.out',
      delay: options.delay || 0,
      ...options,
    }
  );
};

/**
 * Card Hover Enter animation (Subtle lift)
 */
export const cardHoverEnter = (target) => {
  if (prefersReducedMotion() || !target) return;
  return gsap.to(target, {
    y: -4,
    duration: 0.25,
    ease: 'power2.out',
  });
};

/**
 * Card Hover Leave animation (Return to base)
 */
export const cardHoverLeave = (target) => {
  if (prefersReducedMotion() || !target) return;
  return gsap.to(target, {
    y: 0,
    duration: 0.25,
    ease: 'power2.out',
  });
};

