import { getSiteSetting } from '@/lib/content'
import { DEFAULT_BRAND, derivePalette, paletteToCssBlock } from '@/lib/theme'

export async function ThemeInjector() {
  const configured = await getSiteSetting('theme.brand_color').catch(() => null)
  const hex = configured || DEFAULT_BRAND
  const palette = derivePalette(hex)
  const css = paletteToCssBlock(palette)

  return (
    <style
      // The injected block sets CSS variables that Tailwind's `brand` palette reads.
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
