import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import StatusDistribution from './StatusDistribution';

describe('StatusDistribution', () => {
  it('표로 보기를 누르면 같은 데이터를 표로 보여 준다', async () => {
    render(<StatusDistribution records={[{ status: 200 }, { status: 500 }]} title="분포" />);
    expect(screen.getByRole('img', { name: /분포: 2xx 1건/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '표로 보기' }));
    expect(screen.getByRole('cell', { name: '5xx' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '차트로 보기' })).toHaveAttribute('aria-pressed', 'true');
  });
});
