import { CustomFareLeg, FareSegment, StoredFareOverride } from '../types/travel';

export interface StationOption {
  id: string;
  label: string;
  group: string;
}

export const ORIGIN_STATIONS: StationOption[] = [
  { id: 'taitung', label: '臺東站（市區／縣府）', group: '臺東主站' },
  { id: 'chenggong', label: '成功鎮（東海岸線）', group: '臺東鄉鎮' },
  { id: 'guanshan', label: '關山／池上（縱谷線）', group: '臺東鄉鎮' },
  { id: 'dawu', label: '大武／太麻里（南迴線）', group: '臺東鄉鎮' },
  { id: 'yuli', label: '玉里站（北上轉乘）', group: '轉乘樞紐' },
  { id: 'fugang', label: '富岡漁港（離島港口）', group: '轉乘樞紐' },
];

export const DESTINATION_STATIONS: StationOption[] = [
  { id: 'kaohsiung', label: '高雄站', group: '南台灣' },
  { id: 'tainan', label: '台南站', group: '南台灣' },
  { id: 'pingtung', label: '屏東站', group: '南台灣' },
  { id: 'taichung', label: '台中站', group: '中台灣' },
  { id: 'chiayi', label: '嘉義站', group: '中台灣' },
  { id: 'taipei', label: '台北站', group: '北台灣' },
  { id: 'yilan', label: '宜蘭站', group: '東／北台灣' },
  { id: 'hualien', label: '花蓮站', group: '東台灣' },
  { id: 'green_island', label: '綠島（南寮漁港）', group: '臺東離島' },
  { id: 'lanyu', label: '蘭嶼（開元港）', group: '臺東離島' },
  { id: 'fugang', label: '富岡漁港', group: '臺東縣內' },
  { id: 'yuli', label: '玉里站', group: '轉乘站' },
];

export const FARE_MODE_LABELS: Record<FareSegment['mode'], string> = {
  bus: '公車／客運',
  train: '臺鐵火車',
  hsr: '台灣高鐵',
  ferry: '交通船',
  flight: '國內班機',
  other: '其他接駁',
};

// V121 預設核心票價表（標註 confirmed: true 者皆為規範明定「已確認」標準）
export const BASE_SEGMENTS: Record<string, Omit<FareSegment, 'modeLabel'>> = {
  // V121 六筆核心已確認票價
  'bus:chenggong->fugang': {
    id: 'bus:chenggong->fugang',
    from: '成功',
    to: '富岡漁港',
    mode: 'bus',
    price: 148,
    confirmed: true,
    note: '鼎東客運海線公車（V121 核心已確認票價）',
  },
  'train:taitung->kaohsiung': {
    id: 'train:taitung->kaohsiung',
    from: '台東',
    to: '高雄',
    mode: 'train',
    price: 485,
    confirmed: true,
    note: '臺鐵自強號（V121 核心已確認票價）',
  },
  'train:taitung->tainan': {
    id: 'train:taitung->tainan',
    from: '台東',
    to: '台南',
    mode: 'train',
    price: 614,
    confirmed: true,
    note: '臺鐵自強號（V121 核心已確認票價）',
  },
  'train:taitung->taichung': {
    id: 'train:taitung->taichung',
    from: '台東',
    to: '台中',
    mode: 'train',
    price: 982,
    confirmed: true,
    note: '臺鐵自強號（V121 核心已確認票價）',
  },
  'train:yuli->yilan': {
    id: 'train:yuli->yilan',
    from: '玉里',
    to: '宜蘭',
    mode: 'train',
    price: 547,
    confirmed: true,
    note: '臺鐵自強號（V121 核心已確認票價）',
  },
  'train:yuli->taipei': {
    id: 'train:yuli->taipei',
    from: '玉里',
    to: '台北',
    mode: 'train',
    price: 783,
    confirmed: true,
    note: '臺鐵自強號（V121 核心已確認票價）',
  },

  // 輔助分段與參考票價（可由使用者依實際票根核對並切換為已確認）
  'bus:chenggong->yuli': {
    id: 'bus:chenggong->yuli',
    from: '成功',
    to: '玉里',
    mode: 'bus',
    price: 125,
    confirmed: false,
    note: '玉長公路客運轉乘（依實際票根微調）',
  },
  'bus:chenggong->taitung': {
    id: 'bus:chenggong->taitung',
    from: '成功',
    to: '台東站',
    mode: 'bus',
    price: 170,
    confirmed: false,
    note: '東海岸線公車至臺東轉運站／火車站',
  },
  'bus:taitung->fugang': {
    id: 'bus:taitung->fugang',
    from: '台東站',
    to: '富岡漁港',
    mode: 'bus',
    price: 25,
    confirmed: false,
    note: '市區公車／陸海空快線',
  },
  'ferry:fugang->green_island': {
    id: 'ferry:fugang->green_island',
    from: '富岡漁港',
    to: '綠島',
    mode: 'ferry',
    price: 560,
    confirmed: false,
    note: '單程客輪全票（實際以購票憑證為準）',
  },
  'ferry:fugang->lanyu': {
    id: 'ferry:fugang->lanyu',
    from: '富岡漁港',
    to: '蘭嶼',
    mode: 'ferry',
    price: 1200,
    confirmed: false,
    note: '單程客輪全票（實際以購票憑證為準）',
  },
  'train:taitung->hualien': {
    id: 'train:taitung->hualien',
    from: '台東',
    to: '花蓮',
    mode: 'train',
    price: 343,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:taitung->yilan': {
    id: 'train:taitung->yilan',
    from: '台東',
    to: '宜蘭',
    mode: 'train',
    price: 598,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:taitung->taipei': {
    id: 'train:taitung->taipei',
    from: '台東',
    to: '台北',
    mode: 'train',
    price: 783,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:taitung->pingtung': {
    id: 'train:taitung->pingtung',
    from: '台東',
    to: '屏東',
    mode: 'train',
    price: 415,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:taitung->chiayi': {
    id: 'train:taitung->chiayi',
    from: '台東',
    to: '嘉義',
    mode: 'train',
    price: 745,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:taitung->yuli': {
    id: 'train:taitung->yuli',
    from: '台東',
    to: '玉里',
    mode: 'train',
    price: 187,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:yuli->hualien': {
    id: 'train:yuli->hualien',
    from: '玉里',
    to: '花蓮',
    mode: 'train',
    price: 193,
    confirmed: false,
    note: '臺鐵自強號參考票價',
  },
  'train:guanshan->taitung': {
    id: 'train:guanshan->taitung',
    from: '關山／池上',
    to: '台東',
    mode: 'train',
    price: 97,
    confirmed: false,
    note: '花東線區間／自強轉乘',
  },
  'train:guanshan->yuli': {
    id: 'train:guanshan->yuli',
    from: '關山／池上',
    to: '玉里',
    mode: 'train',
    price: 89,
    confirmed: false,
    note: '花東線北上轉乘',
  },
  'train:dawu->taitung': {
    id: 'train:dawu->taitung',
    from: '大武／太麻里',
    to: '台東',
    mode: 'train',
    price: 112,
    confirmed: false,
    note: '南迴線北上至台東轉乘',
  },
  'train:dawu->kaohsiung': {
    id: 'train:dawu->kaohsiung',
    from: '大武／太麻里',
    to: '高雄',
    mode: 'train',
    price: 373,
    confirmed: false,
    note: '南迴線自強號參考票價',
  },
  'hsr:zuoying->taichung': {
    id: 'hsr:zuoying->taichung',
    from: '高鐵左營',
    to: '高鐵台中',
    mode: 'hsr',
    price: 790,
    confirmed: false,
    note: '標準車廂對號座參考票價',
  },
  'hsr:zuoying->taipei': {
    id: 'hsr:zuoying->taipei',
    from: '高鐵左營',
    to: '高鐵台北',
    mode: 'hsr',
    price: 1490,
    confirmed: false,
    note: '標準車廂對號座參考票價',
  },
};

function resolveSegment(
  key: string,
  overrides: Record<string, StoredFareOverride>
): FareSegment {
  const base = BASE_SEGMENTS[key];
  if (!base) {
    return {
      id: key,
      from: '起點',
      to: '迄點',
      mode: 'other',
      modeLabel: FARE_MODE_LABELS.other,
      price: 0,
      confirmed: false,
    };
  }
  const ov = overrides[key];
  return {
    ...base,
    modeLabel: FARE_MODE_LABELS[base.mode],
    price: ov ? ov.price : base.price,
    confirmed: ov ? ov.confirmed : base.confirmed,
  };
}

export function getRouteKey(originId: string, destId: string, useHsrTransfer: boolean): string {
  return `${originId}->${destId}${useHsrTransfer ? ':hsr' : ''}`;
}

export function buildRouteSegments(
  originId: string,
  destId: string,
  useHsrTransfer: boolean,
  overrides: Record<string, StoredFareOverride>,
  customLegs: CustomFareLeg[]
): { segments: FareSegment[]; routeSummary: string } {
  const keys: string[] = [];
  let routeSummary = '';

  if (originId === destId) {
    return { segments: [], routeSummary: '起訖站相同，請選擇不同迄點或新增自訂區段。' };
  }

  // 1. 成功鎮出發的自動智慧拆解 (V121 規範核心案例)
  if (originId === 'chenggong') {
    if (destId === 'taipei') {
      keys.push('bus:chenggong->yuli', 'train:yuli->taipei');
      routeSummary = '自動拆解北上路徑：成功 ➔ 玉里（公車）＋ 玉里 ➔ 台北（火車）';
    } else if (destId === 'yilan') {
      keys.push('bus:chenggong->yuli', 'train:yuli->yilan');
      routeSummary = '自動拆解北上路徑：成功 ➔ 玉里（公車）＋ 玉里 ➔ 宜蘭（火車）';
    } else if (destId === 'hualien') {
      keys.push('bus:chenggong->yuli', 'train:yuli->hualien');
      routeSummary = '自動拆解北上路徑：成功 ➔ 玉里（公車）＋ 玉里 ➔ 花蓮（火車）';
    } else if (destId === 'yuli') {
      keys.push('bus:chenggong->yuli');
      routeSummary = '玉長公路客運直達玉里站';
    } else if (destId === 'fugang') {
      keys.push('bus:chenggong->fugang');
      routeSummary = '東海岸線公車直達富岡漁港';
    } else if (destId === 'green_island') {
      keys.push('bus:chenggong->fugang', 'ferry:fugang->green_island');
      routeSummary = '自動拆解離島路徑：成功 ➔ 富岡漁港（公車）＋ 富岡漁港 ➔ 綠島（交通船）';
    } else if (destId === 'lanyu') {
      keys.push('bus:chenggong->fugang', 'ferry:fugang->lanyu');
      routeSummary = '自動拆解離島路徑：成功 ➔ 富岡漁港（公車）＋ 富岡漁港 ➔ 蘭嶼（交通船）';
    } else {
      // 南下／西部幹線：先公車到台東站，再轉火車（或高鐵）
      keys.push('bus:chenggong->taitung');
      if (useHsrTransfer && (destId === 'taichung' || destId === 'taipei')) {
        keys.push('train:taitung->kaohsiung', `hsr:zuoying->${destId}`);
        routeSummary = '自動拆解海線南下高鐵轉乘：成功 ➔ 台東 ➔ 高雄／左營 ➔ 高鐵迄點';
      } else {
        const directKey = `train:taitung->${destId}`;
        if (BASE_SEGMENTS[directKey]) keys.push(directKey);
        routeSummary = '自動拆解海線轉乘路徑：成功 ➔ 台東站（公車）＋ 台東 ➔ 迄點（火車）';
      }
    }
  }
  // 2. 臺東站出發
  else if (originId === 'taitung') {
    if (destId === 'green_island') {
      keys.push('bus:taitung->fugang', 'ferry:fugang->green_island');
      routeSummary = '自動拆解離島路徑：台東站 ➔ 富岡漁港（公車）＋ 富岡漁港 ➔ 綠島（交通船）';
    } else if (destId === 'lanyu') {
      keys.push('bus:taitung->fugang', 'ferry:fugang->lanyu');
      routeSummary = '自動拆解離島路徑：台東站 ➔ 富岡漁港（公車）＋ 富岡漁港 ➔ 蘭嶼（交通船）';
    } else if (destId === 'fugang') {
      keys.push('bus:taitung->fugang');
      routeSummary = '市區公車直達富岡漁港';
    } else if (useHsrTransfer && (destId === 'taichung' || destId === 'taipei')) {
      keys.push('train:taitung->kaohsiung', `hsr:zuoying->${destId}`);
      routeSummary = '南迴轉乘高鐵路徑：台東 ➔ 高雄／左營（火車）＋ 左營 ➔ 迄點（高鐵）';
    } else {
      const directKey = `train:taitung->${destId}`;
      if (BASE_SEGMENTS[directKey]) {
        keys.push(directKey);
        routeSummary = '臺東站臺鐵幹線直達';
      }
    }
  }
  // 3. 玉里站出發
  else if (originId === 'yuli') {
    if (destId === 'taipei') {
      keys.push('train:yuli->taipei');
      routeSummary = '玉里站北上臺鐵直達台北';
    } else if (destId === 'yilan') {
      keys.push('train:yuli->yilan');
      routeSummary = '玉里站北上臺鐵直達宜蘭';
    } else if (destId === 'hualien') {
      keys.push('train:yuli->hualien');
      routeSummary = '玉里站北上臺鐵直達花蓮';
    } else if (destId === 'green_island' || destId === 'lanyu') {
      keys.push('train:taitung->yuli', 'bus:taitung->fugang', `ferry:fugang->${destId}`);
      routeSummary = '南下台東站轉乘富岡漁港搭船';
    } else {
      keys.push('train:taitung->yuli');
      const nextKey = `train:taitung->${destId}`;
      if (BASE_SEGMENTS[nextKey]) keys.push(nextKey);
      routeSummary = '玉里 ➔ 台東轉乘南迴幹線';
    }
  }
  // 4. 富岡漁港出發
  else if (originId === 'fugang') {
    if (destId === 'green_island' || destId === 'lanyu') {
      keys.push(`ferry:fugang->${destId}`);
      routeSummary = '富岡漁港客輪直航';
    } else {
      keys.push('bus:taitung->fugang');
      const nextKey = `train:taitung->${destId}`;
      if (BASE_SEGMENTS[nextKey]) keys.push(nextKey);
      routeSummary = '富岡漁港接駁至台東站轉乘臺鐵';
    }
  }
  // 5. 關山 / 池上出發
  else if (originId === 'guanshan') {
    if (destId === 'taipei' || destId === 'yilan' || destId === 'hualien') {
      keys.push('train:guanshan->yuli', `train:yuli->${destId}`);
      routeSummary = '縱谷線北上經玉里轉乘臺鐵幹線';
    } else if (destId === 'green_island' || destId === 'lanyu') {
      keys.push('train:guanshan->taitung', 'bus:taitung->fugang', `ferry:fugang->${destId}`);
      routeSummary = '縱谷線至台東轉富岡漁港搭船';
    } else {
      keys.push('train:guanshan->taitung');
      const nextKey = `train:taitung->${destId}`;
      if (BASE_SEGMENTS[nextKey]) keys.push(nextKey);
      routeSummary = '縱谷線至台東站轉乘南迴幹線';
    }
  }
  // 6. 大武 / 太麻里出發
  else if (originId === 'dawu') {
    if (destId === 'kaohsiung') {
      keys.push('train:dawu->kaohsiung');
      routeSummary = '南迴線直達高雄站';
    } else if (destId === 'green_island' || destId === 'lanyu') {
      keys.push('train:dawu->taitung', 'bus:taitung->fugang', `ferry:fugang->${destId}`);
      routeSummary = '南迴線至台東轉富岡漁港搭船';
    } else {
      keys.push('train:dawu->taitung');
      const nextKey = `train:taitung->${destId}`;
      if (BASE_SEGMENTS[nextKey]) keys.push(nextKey);
      routeSummary = '南迴線至台東轉乘幹線';
    }
  }

  const resolvedBase = keys.map((k) => resolveSegment(k, overrides));
  const routeKey = getRouteKey(originId, destId, useHsrTransfer);
  const matchedCustom: FareSegment[] = customLegs
    .filter((leg) => leg.routeKey === routeKey)
    .map((leg) => ({
      id: leg.id,
      from: leg.from,
      to: leg.to,
      mode: leg.mode,
      modeLabel: FARE_MODE_LABELS[leg.mode],
      price: leg.price,
      confirmed: leg.confirmed,
      note: '使用者自訂接駁區段',
      isCustom: true,
    }));

  return {
    segments: [...resolvedBase, ...matchedCustom],
    routeSummary: routeSummary || '標準分段路徑試算',
  };
}
