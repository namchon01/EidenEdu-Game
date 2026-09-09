/**
 * Every field is required on purpose. React Three Fiber patches the existing
 * material instance when these props change, so a key left out of one variant
 * would keep its old value — a part switching from hologram to solid would stay
 * see-through. Listing the full set keeps both variants symmetric.
 */
export interface MatProps {
  color: string
  metalness: number
  roughness: number
  emissive: string
  emissiveIntensity: number
  transparent: boolean
  opacity: number
  depthWrite: boolean
  toneMapped: boolean
  envMapIntensity: number
}

export interface PartProps {
  skin: Skin
  /** 0 keeps a mirrored pair closed, 1 pushes both halves fully apart. */
  spread: number
}

export interface Skin {
  /** Main painted armour shells. */
  primary: MatProps
  /** Bright secondary plating. */
  secondary: MatProps
  /** Structural frame and joints. */
  dark: MatProps
  /** Polished chrome details. */
  metal: MatProps
  /** Energy core and visor. */
  glow: MatProps
  /** Headlights and warning lamps. */
  accent: MatProps
  rubber: MatProps
  /** Recessed panel seams that break up large surfaces. */
  line: MatProps
  ghost: boolean
}

const NORMAL = {
  primary: '#d32a34',
  secondary: '#eef3f8',
  dark: '#29303d',
  metal: '#cfd8e3',
  // Deep blue so energy cores / wings read against the sky hangar bg.
  glow: '#1e3a8a',
  accent: '#ffb020',
}

const COOLING = {
  primary: '#2f6f9e',
  secondary: '#dbeafe',
  dark: '#243247',
  metal: '#b8c7dc',
  glow: '#1e40af',
  accent: '#93c5fd',
}

function mat(props: Partial<MatProps> & { color: string }): MatProps {
  return {
    metalness: 0.5,
    roughness: 0.4,
    emissive: '#000000',
    emissiveIntensity: 0,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    toneMapped: true,
    envMapIntensity: 1,
    ...props,
  }
}

function ghostOf(color: string, emissiveIntensity: number): MatProps {
  return mat({
    color,
    metalness: 0.1,
    roughness: 0.45,
    emissive: color,
    emissiveIntensity,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  })
}

export function buildSkin(cooling: boolean, ghost: boolean): Skin {
  const c = cooling ? COOLING : NORMAL

  if (ghost) {
    const holo = '#67e8f9'
    return {
      primary: ghostOf(holo, 0.5),
      secondary: ghostOf(holo, 0.35),
      dark: ghostOf(holo, 0.25),
      metal: ghostOf(holo, 0.4),
      glow: ghostOf(holo, 0.9),
      accent: ghostOf(holo, 0.6),
      rubber: ghostOf(holo, 0.15),
      line: ghostOf(holo, 0.8),
      ghost: true,
    }
  }

  return {
    primary: mat({ color: c.primary, metalness: 0.68, roughness: 0.26, envMapIntensity: 1.15 }),
    secondary: mat({ color: c.secondary, metalness: 0.5, roughness: 0.22, envMapIntensity: 1.2 }),
    dark: mat({ color: c.dark, metalness: 0.82, roughness: 0.38, envMapIntensity: 0.9 }),
    metal: mat({ color: c.metal, metalness: 1, roughness: 0.16, envMapIntensity: 1.4 }),
    glow: mat({
      color: c.glow,
      metalness: 0.25,
      roughness: 0.28,
      emissive: c.glow,
      emissiveIntensity: 1.35,
      toneMapped: false,
    }),
    accent: mat({
      color: c.accent,
      metalness: 0.35,
      roughness: 0.22,
      emissive: c.accent,
      emissiveIntensity: 0.85,
    }),
    rubber: mat({ color: '#12151c', metalness: 0.08, roughness: 0.92, envMapIntensity: 0.4 }),
    line: mat({ color: '#0a0d14', metalness: 0.4, roughness: 0.85, envMapIntensity: 0.3 }),
    ghost: false,
  }
}
