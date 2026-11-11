import { LineWobble } from 'ldrs/react'
import 'ldrs/react/LineWobble.css'
import { useAppStore } from '@/store/appStore'
import BrandMark from './BrandMark'

const AppLoading = () => {
  const isDark = useAppStore((state) => state.isDark)

  return (
    <div className="skald-app-loading" role="status" aria-label="Loading your workspace">
      <BrandMark className="skald-app-loading__brand" />
      <LineWobble
        size="56"
        stroke="4"
        bgOpacity="0.1"
        speed="1.75"
        color={isDark ? '#a095ff' : '#6654e8'}
      />
    </div>
  )
}

export default AppLoading
