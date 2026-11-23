import { DestinationConfig, TransportMode } from '../types/travel';

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  train: '火車',
  hsr: '高鐵',
  car: '汽車',
  flight: '飛機',
  ferry: '船班',
};

export const DESTINATIONS: DestinationConfig[] = [
  // 縣內
  {
    id: 'taitung_county',
    name: '臺東縣內（所屬鄉鎮）',
    shortName: '臺東縣內',
    group: 'in_county',
    groupLabel: '縣內出差',
    supportedTransports: ['car', 'train'],
    defaultTransport: 'car',
    defaultHoursByTransport: { car: 1.0, train: 1.0 },
    allowanceByTransport: {
      car: { halfDay: 1.0, fullDay: 1.0 },
      train: { halfDay: 1.0, fullDay: 1.0 },
    },
    defaultFareDestinationId: 'fugang',
    note: '縣內出差以 1.0 天當日往返為原則。',
  },

  // 離島與外島
  {
    id: 'green_island',
    name: '綠島地區（離島）',
    shortName: '綠島',
    group: 'islands',
    groupLabel: '離島與外島（覈實申報）',
    supportedTransports: ['ferry', 'flight'],
    defaultTransport: 'ferry',
    defaultHoursByTransport: { ferry: 2.0, flight: 1.5 },
    allowanceByTransport: {
      ferry: { halfDay: 1.0, fullDay: 1.5, actualClaim: true },
      flight: { halfDay: 1.0, fullDay: 1.5, actualClaim: true },
    },
    defaultFareDestinationId: 'green_island',
    note: '離島地區依實際船班／航班時間覈實申報。',
  },
  {
    id: 'lanyu',
    name: '蘭嶼地區（離島）',
    shortName: '蘭嶼',
    group: 'islands',
    groupLabel: '離島與外島（覈實申報）',
    supportedTransports: ['ferry', 'flight'],
    defaultTransport: 'ferry',
    defaultHoursByTransport: { ferry: 3.5, flight: 1.5 },
    allowanceByTransport: {
      ferry: { halfDay: 1.5, fullDay: 2.0, actualClaim: true },
      flight: { halfDay: 1.0, fullDay: 1.5, actualClaim: true },
    },
    defaultFareDestinationId: 'lanyu',
    note: '離島地區依實際船班／航班時間覈實申報。',
  },
  {
    id: 'outer_islands',
    name: '外島地區（金門／馬祖／澎湖）',
    shortName: '金馬澎外島',
    group: 'islands',
    groupLabel: '離島與外島（覈實申報）',
    supportedTransports: ['flight', 'ferry'],
    defaultTransport: 'flight',
    defaultHoursByTransport: { flight: 6.0, ferry: 8.0 },
    allowanceByTransport: {
      flight: { halfDay: 2.0, fullDay: 3.0, actualClaim: true },
      ferry: { halfDay: 2.0, fullDay: 3.0, actualClaim: true },
    },
    defaultFareDestinationId: 'kaohsiung',
    note: '外島地區依實際航班／船班銜接時間覈實申報。',
  },

  // 花蓮、宜蘭、高雄、屏東 (半天 1.0 / 整天 1.5)
  {
    id: 'hualien',
    name: '花蓮地區',
    shortName: '花蓮',
    group: 'east_south',
    groupLabel: '花宜高屏（半日 1.0 / 全日 1.5 天）',
    supportedTransports: ['train', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 3.0, car: 3.0 },
    allowanceByTransport: {
      train: { halfDay: 1.0, fullDay: 1.5 },
      car: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'hualien',
  },
  {
    id: 'yilan',
    name: '宜蘭地區',
    shortName: '宜蘭',
    group: 'east_south',
    groupLabel: '花宜高屏（半日 1.0 / 全日 1.5 天）',
    supportedTransports: ['train', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 4.0, car: 4.5 },
    allowanceByTransport: {
      train: { halfDay: 1.0, fullDay: 1.5 },
      car: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'yilan',
  },
  {
    id: 'kaohsiung',
    name: '高雄地區',
    shortName: '高雄',
    group: 'east_south',
    groupLabel: '花宜高屏（半日 1.0 / 全日 1.5 天）',
    supportedTransports: ['train', 'car', 'hsr'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 4.0, car: 4.0, hsr: 4.0 },
    allowanceByTransport: {
      train: { halfDay: 1.0, fullDay: 1.5 },
      car: { halfDay: 1.0, fullDay: 1.5 },
      hsr: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'kaohsiung',
  },
  {
    id: 'pingtung',
    name: '屏東地區',
    shortName: '屏東',
    group: 'east_south',
    groupLabel: '花宜高屏（半日 1.0 / 全日 1.5 天）',
    supportedTransports: ['train', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 3.5, car: 3.5 },
    allowanceByTransport: {
      train: { halfDay: 1.0, fullDay: 1.5 },
      car: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'pingtung',
  },

  // 台北、桃園、新竹、苗栗、基隆、台南 (汽火車/高鐵 半天 1.5 / 整天 2.0；北桃基飛機 半天 1.0 / 整天 1.5)
  {
    id: 'taipei',
    name: '台北地區（含新北）',
    shortName: '台北',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car', 'flight'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.0, hsr: 5.0, car: 6.0, flight: 1.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
      flight: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'taipei',
  },
  {
    id: 'keelung',
    name: '基隆地區',
    shortName: '基隆',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car', 'flight'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.5, hsr: 5.5, car: 6.5, flight: 2.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
      flight: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'taipei',
  },
  {
    id: 'taoyuan',
    name: '桃園地區',
    shortName: '桃園',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car', 'flight'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.5, hsr: 5.0, car: 6.5, flight: 2.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
      flight: { halfDay: 1.0, fullDay: 1.5 },
    },
    defaultFareDestinationId: 'taipei',
  },
  {
    id: 'hsinchu',
    name: '新竹地區',
    shortName: '新竹',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.5, hsr: 5.0, car: 6.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'taipei',
  },
  {
    id: 'miaoli',
    name: '苗栗地區',
    shortName: '苗栗',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 6.0, hsr: 5.0, car: 6.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'taichung',
  },
  {
    id: 'tainan',
    name: '台南地區',
    shortName: '台南',
    group: 'north_tainan',
    groupLabel: '北桃竹苗基南（半日 1.5 / 全日 2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 4.5, hsr: 4.0, car: 4.5 },
    allowanceByTransport: {
      train: { halfDay: 1.5, fullDay: 2.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
      car: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'tainan',
  },

  // 台中、彰化、南投、雲林、嘉義 (高鐵 半天 1.5 / 整天 2.0；汽火車 半天 2.0 / 整天 3.0)
  {
    id: 'taichung',
    name: '台中地區',
    shortName: '台中',
    group: 'central',
    groupLabel: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 6.0, hsr: 4.5, car: 6.0 },
    allowanceByTransport: {
      train: { halfDay: 2.0, fullDay: 3.0 },
      car: { halfDay: 2.0, fullDay: 3.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'taichung',
  },
  {
    id: 'changhua',
    name: '彰化地區',
    shortName: '彰化',
    group: 'central',
    groupLabel: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 6.0, hsr: 4.5, car: 6.0 },
    allowanceByTransport: {
      train: { halfDay: 2.0, fullDay: 3.0 },
      car: { halfDay: 2.0, fullDay: 3.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'taichung',
  },
  {
    id: 'nantou',
    name: '南投地區',
    shortName: '南投',
    group: 'central',
    groupLabel: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 6.5, hsr: 5.0, car: 6.5 },
    allowanceByTransport: {
      train: { halfDay: 2.0, fullDay: 3.0 },
      car: { halfDay: 2.0, fullDay: 3.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'taichung',
  },
  {
    id: 'yunlin',
    name: '雲林地區',
    shortName: '雲林',
    group: 'central',
    groupLabel: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.5, hsr: 4.5, car: 5.5 },
    allowanceByTransport: {
      train: { halfDay: 2.0, fullDay: 3.0 },
      car: { halfDay: 2.0, fullDay: 3.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'chiayi',
  },
  {
    id: 'chiayi',
    name: '嘉義地區',
    shortName: '嘉義',
    group: 'central',
    groupLabel: '中彰投雲嘉（汽火車 2.0/3.0 天；高鐵 1.5/2.0 天）',
    supportedTransports: ['train', 'hsr', 'car'],
    defaultTransport: 'train',
    defaultHoursByTransport: { train: 5.0, hsr: 4.0, car: 5.0 },
    allowanceByTransport: {
      train: { halfDay: 2.0, fullDay: 3.0 },
      car: { halfDay: 2.0, fullDay: 3.0 },
      hsr: { halfDay: 1.5, fullDay: 2.0 },
    },
    defaultFareDestinationId: 'chiayi',
  },
];

export function getDestinationById(id: string): DestinationConfig {
  return DESTINATIONS.find((d) => d.id === id) ?? DESTINATIONS[0];
}

export function getDefaultTravelHours(
  destination: DestinationConfig,
  transport: TransportMode
): number {
  return destination.defaultHoursByTransport[transport] ?? 4.0;
}

export function getTravelHoursKey(destinationId: string, transport: TransportMode): string {
  return `${destinationId}:${transport}`;
}
