import { describe, expect, it } from 'vitest';
import { precheckCover } from './cover';

const file = (name, size) => ({ name, size });

describe('precheckCover', () => {
  it('허용한 확장자와 크기면 통과한다', () => {
    expect(precheckCover(file('cover.PNG', 1024))).toBeNull();
  });

  it('확장자, 빈 파일, 크기 제한을 검사한다', () => {
    expect(precheckCover(file('cover.gif', 1024))).toContain('jpg, jpeg, png');
    expect(precheckCover(file('cover.jpg', 0))).toBe('빈 파일입니다.');
    expect(precheckCover(file('cover.jpg', 2 * 1024 * 1024 + 1))).toContain('2MB');
  });

  it('이름만 그럴듯한 파일도 통과하므로 최종 검사는 백엔드가 해야 한다', () => {
    // 확장자는 이름일 뿐입니다. 실제 내용 검사는 백엔드(S9-P31)의 몫입니다.
    expect(precheckCover(file('malware.exe.png', 10))).toBeNull();
  });
});
