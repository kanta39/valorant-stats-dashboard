import RankCard from './RankCard';
import OverallSummary from './OverallSummary';
import RolesPerformance from './RolesPerformance';

export default function Sidebar({ playerData, overallStats, roleStatsArray, roleIcons, rankImages }) {
  return (
    <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-5">
      {playerData?.rank && (
        <RankCard rank={playerData.rank} rankImages={rankImages} />
      )}
      {overallStats && (
        <OverallSummary overallStats={overallStats} />
      )}
      <RolesPerformance roleStatsArray={roleStatsArray} roleIcons={roleIcons} />
    </div>
  );
}
