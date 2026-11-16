export type ReaderSize = 'small' | 'standard' | 'large'
export type ReaderWidth = 'standard' | 'wide'
export const PREFERENCE_KEY = 'bodo-reading-preferences'
export function readAppearance(raw: string | null): {
  size: ReaderSize
  width: ReaderWidth
} {
  try {
    const value: unknown = JSON.parse(raw || '{}')
    const saved =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {}
    return {
      size:
        saved.size === 'small' || saved.size === 'large'
          ? saved.size
          : 'standard',
      width: saved.width === 'wide' ? 'wide' : 'standard',
    }
  } catch {
    return { size: 'standard', width: 'standard' }
  }
}
export const preferenceBootScript = `(function(){try{var p=JSON.parse(localStorage.getItem('bodo-reading-preferences')||'{}');if(p&&['small','standard','large'].indexOf(p.size)>-1)document.documentElement.dataset.readingSize=p.size;if(p&&p.width==='wide')document.documentElement.dataset.readingWidth='wide'}catch(e){}})()`
