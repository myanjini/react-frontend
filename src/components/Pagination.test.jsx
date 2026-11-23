import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('현재 페이지와 전체 권수를 보여 준다', () => {
    render(<Pagination total={23} skip={10} limit={10} onChange={() => {}} />);
    expect(screen.getByText('2 / 3 페이지 (전체 23권)')).toBeInTheDocument();
  });

  it('첫 페이지에서는 이전 버튼이 비활성화된다', () => {
    render(<Pagination total={23} skip={0} limit={10} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '이전' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
  });

  it('다음 버튼을 누르면 다음 페이지의 skip 값을 알려 준다', async () => {
    const onChange = vi.fn(); // 호출 여부와 인자를 기록하는 가짜 함수
    render(<Pagination total={23} skip={10} limit={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(onChange).toHaveBeenCalledWith(20);
  });
});
