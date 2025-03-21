import { useEffect, useMemo } from 'react'
import animalHash from 'angry-purple-tiger'
import { useAsync } from 'react-async-hooks'
import { useParams } from 'react-router'
import InfoBox from './InfoBox'
import TabNavbar, { TabPane } from '../Nav/TabNavbar'
import StatisticsPane from './HotspotDetails/StatisticsPane'
import ActivityPane from './Common/ActivityPane'
import WitnessesPane from './HotspotDetails/WitnessesPane'
import NearbyHotspotsPane from './HotspotDetails/NearbyHotspotsPane'
import useSelectedHotspot from '../../hooks/useSelectedHotspot'
import CopyableText from '../Common/CopyableText'
import AccountAddress from '../AccountAddress'
import SkeletonList from '../Lists/SkeletonList'
import FlagLocation from '../Common/FlagLocation'
import Gain from '../Hotspots/Gain'
import Elevation from '../Hotspots/Elevation'
import { isDataOnly } from '../Hotspots/utils'
import SkeletonWidgets from './Common/SkeletonWidgets'
import HexIndex from '../Common/HexIndex'
import MakerIcon from '../Icons/MakerIcon'
import { useMaker } from '../../data/makers'
import Skeleton from '../Common/Skeleton'
import { useCallback } from 'react'
import AccountIcon from '../AccountIcon'

const HotspotDetailsRoute = () => {
  const { address } = useParams()

  const { selectedHotspot: hotspot, selectHotspot } = useSelectedHotspot()

  useAsync(async () => {
    if (!hotspot) {
      selectHotspot(address)
    }
  }, [hotspot, address])

  return (
    <HotspotDetailsInfoBox
      address={address}
      isLoading={!hotspot}
      hotspot={hotspot}
    />
  )
}

const HotspotDetailsInfoBox = ({ address, isLoading, hotspot }) => {
  const { clearSelectedHotspot } = useSelectedHotspot()
  const { maker, isLoading: makerLoading } = useMaker(hotspot?.payer)

  const IS_DATA_ONLY = useMemo(() => isDataOnly(hotspot), [hotspot])

  const title = animalHash(address)

  useEffect(() => {
    return () => {
      clearSelectedHotspot()
    }
  }, [clearSelectedHotspot])

  const generateSubtitles = useCallback(
    (hotspot) => {
      if (!hotspot)
        return [
          [
            {
              iconPath: '/images/maker.svg',
              loading: true,
              skeletonClasses: 'w-8',
            },
            {
              iconPath: '/images/gain.svg',
              loading: true,
              skeletonClasses: 'w-10',
            },
            {
              iconPath: '/images/elevation.svg',
              loading: true,
              skeletonClasses: 'w-10',
            },
          ],
          [
            {
              iconPath: '/images/address-symbol.svg',
              loading: true,
              skeletonClasses: 'w-20',
            },
            {
              iconPath: '/images/account-green.svg',
              loading: true,
              skeletonClasses: 'w-20',
            },
          ],
        ]
      return [
        [
          {
            iconPath: '/images/maker.svg',
            title: makerLoading ? <Skeleton /> : <span>{maker?.name}</span>,
            path: `/accounts/${maker?.address}`,
          },
          {
            iconPath: '/images/gain.svg',
            title: <Gain hotspot={hotspot} icon={false} />,
          },
          {
            iconPath: '/images/elevation.svg',
            title: <Elevation hotspot={hotspot} icon={false} />,
          },
        ],
        [
          {
            iconPath: '/images/address-symbol.svg',
            title: <AccountAddress address={address} truncate={7} />,
            textToCopy: address,
          },
          {
            iconPath: '/images/account-green.svg',
            title: (
              <span className="flex items-center justify-start">
                <AccountAddress
                  address={hotspot.owner}
                  truncate={7}
                  showSecondHalf={false}
                />
                <AccountIcon
                  address={hotspot.owner}
                  className="h-2.5 md:h-3.5 w-auto ml-0.5"
                />
              </span>
            ),
            path: `/accounts/${hotspot.owner}`,
          },
        ],
      ]
    },
    [address, maker?.address, maker?.name, makerLoading],
  )

  const generateBreadcrumbs = (hotspot) => {
    if (!hotspot) return [{ title: 'Hotspots', path: '/hotspots' }]
    return [
      { title: 'Hotspots', path: '/hotspots/latest' },
      ...(hotspot.location
        ? // if the hotspot has a location, show breadcrumbs for it
          [
            {
              title: <FlagLocation geocode={hotspot.geocode} condensedView />,
              path: `/hotspots/cities/${hotspot.geocode.cityId}`,
            },
            {
              title: (
                <div className="flex items-center justify-center">
                  <img
                    alt=""
                    src="/images/location-hex.svg"
                    className="h-3.5 w-auto mr-0.5 md:mr-1"
                  />
                  <HexIndex index={hotspot.location} />
                </div>
              ),
              path: `/hotspots/hex/${hotspot.location}`,
            },
          ]
        : []),
    ]
  }

  return (
    <InfoBox
      title={title}
      metaTitle={`Hotspot ${animalHash(address)}`}
      subtitles={generateSubtitles(hotspot)}
      breadcrumbs={generateBreadcrumbs(hotspot)}
    >
      <TabNavbar>
        <TabPane title="Statistics" key="statistics">
          {isLoading ? (
            <SkeletonWidgets />
          ) : (
            <StatisticsPane hotspot={hotspot} isDataOnly={IS_DATA_ONLY} />
          )}
        </TabPane>
        <TabPane title="Activity" path="activity" key="activity">
          {isLoading ? (
            <SkeletonList />
          ) : (
            <ActivityPane context="hotspot" address={hotspot?.address} />
          )}
        </TabPane>
        <TabPane
          title="Witnesses"
          path="witnesses"
          key="witnesses"
          hidden={IS_DATA_ONLY}
        >
          {isLoading ? <SkeletonList /> : <WitnessesPane hotspot={hotspot} />}
        </TabPane>
        <TabPane
          title="Nearby"
          path="nearby"
          key="nearby"
          hidden={IS_DATA_ONLY}
        >
          {isLoading ? (
            <SkeletonList />
          ) : (
            <NearbyHotspotsPane hotspot={hotspot} />
          )}
        </TabPane>
      </TabNavbar>
    </InfoBox>
  )
}

export default HotspotDetailsRoute
