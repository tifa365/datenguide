import dynamic from 'next/dynamic'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const SimpleMap = dynamic(
  () => import('@datenguide/explorables').then(({ SimpleMap }) => SimpleMap),
  { ssr: false }
)

export default (props) => (
  <SimpleMap
    {...props}
    mapboxApiAccessToken={publicRuntimeConfig.mapboxToken}
    mapStyle="mapbox://styles/datenguide/cka2hksel3jxf1iobq6rxka0l"
  />
)
