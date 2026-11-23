import { useSyncExternalStore } from 'react';
import { getRecords, subscribe } from './telemetry';

// 바깥 저장소(telemetry.js)의 값을 React 화면과 연결합니다.
export function useTelemetry() {
  return useSyncExternalStore(subscribe, getRecords);
}
