import dayjs from 'dayjs';

/**
 * Aggregates daily alignment score data points into weekly or monthly averages
 * based on the total time span of the data to avoid chart overcrowding.
 * 
 * @param {Array} dataList - Raw list of history/assessment items.
 * @returns {Array} Formatted and aggregated chart data.
 */
export const aggregateChartData = (dataList) => {
  if (!dataList || dataList.length === 0) return [];

  // Sort dataList oldest to newest to measure chronological span
  const sorted = [...dataList].sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));
  
  const firstDate = dayjs(sorted[0].assessmentDate);
  const lastDate = dayjs(sorted[sorted.length - 1].assessmentDate);
  const daySpan = lastDate.diff(firstDate, 'day');

  // If the total span of dates is <= 35 days, show daily points
  if (daySpan <= 35) {
    return sorted.map(item => ({
      date: dayjs(item.assessmentDate).format('MMM DD'),
      score: item.alignmentScore,
      character: item.character.name.split(' (')[0]
    }));
  }

  // If the total span is extremely large (e.g. > 365 days), group by month to keep it clean
  const useMonthly = daySpan > 365;
  const groups = {};

  sorted.forEach(item => {
    const periodKey = useMonthly 
      ? dayjs(item.assessmentDate).startOf('month').format('YYYY-MM-DD')
      : dayjs(item.assessmentDate).startOf('week').format('YYYY-MM-DD');
      
    if (!groups[periodKey]) {
      groups[periodKey] = {
        totalScore: 0,
        count: 0,
        traits: []
      };
    }
    groups[periodKey].totalScore += item.alignmentScore;
    groups[periodKey].count += 1;
    groups[periodKey].traits.push(item.character.name.split(' (')[0]);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(periodKey => {
      const avgScore = parseFloat((groups[periodKey].totalScore / groups[periodKey].count).toFixed(2));
      const uniqueTraits = [...new Set(groups[periodKey].traits)];
      const characterLabel = uniqueTraits.length > 2 
        ? `${uniqueTraits.slice(0, 2).join(', ')}...` 
        : uniqueTraits.join(', ');

      return {
        date: dayjs(periodKey).format(useMonthly ? 'MMM YYYY' : 'MMM DD'),
        score: avgScore,
        character: characterLabel
      };
    });
};
