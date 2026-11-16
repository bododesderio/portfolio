import type { SVGProps } from 'react'
const paths = {
  biography:
    'M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1V5Zm8 1v14M7 9h2m-2 3h2m6-3h2m-2 3h2',
  work: 'M4 8h16v12H4V8Zm4 0V4h8v4M4 12c5 3 11 3 16 0m-8 0v4',
  writing: 'm5 19 3-8L18 3l3 3-8 10-8 3Zm3-8 5 5M3 22h17M15 6l3 3',
  community:
    'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6M2 21v-3c0-3 12-3 12 0v3m3-7c3 0 5 1 5 3v3',
  photographs: 'M3 5h18v15H3V5Zm0 11 5-5 4 4 3-3 6 6M17 8h.01M7 2h10',
  mentions: 'M4 4h16v14h-9l-5 4v-4H4V4Zm4 5h8m-8 4h5',
  interests:
    'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
}
export function PersonalIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
