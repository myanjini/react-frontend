import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { Link } from 'react-router';
import { listMyLoans, returnLoan } from '../api/loans';
import ErrorMessage from '../components/ErrorMessage';

// 백엔드는 UTC로 저장합니다. 화면에서는 사용자의 시간대로 보여 줍니다.
// 시간대 표시(Z 또는 +09:00)가 없는 문자열은 브라우저가 현지 시각으로 해석하므로
// UTC임을 나타내는 Z를 붙여 줍니다.
const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
function formatDate(iso) {
  if (!iso) return '-';
  const hasZone = /(Z|[+-]\d{2}:\d{2})$/.test(iso);
  return dateFormat.format(new Date(hasZone ? iso : `${iso}Z`));
}

export default function MyLoansPage() {
  const { data: loans = [], error: loadError, reload } = useAsync((signal) => listMyLoans(signal), []);
  const [error, setError] = useState(null);

  async function handleReturn(loanId) {
    setError(null);
    try {
      await returnLoan(loanId);
      reload();
    } catch (err) {
      setError(err);
    }
  }

  const active = loans.filter((loan) => !loan.returned_at);

  return (
    <section>
      <h1>내 대여</h1>
      <p className="muted">현재 대여 중 {active.length}권 / 최대 3권</p>
      <ErrorMessage error={loadError ?? error} />
      <table className="table">
        <thead>
          <tr>
            <th>도서</th>
            <th>대여 시각</th>
            <th>반납 시각</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>
                <Link to={`/books/${loan.book.id}`}>{loan.book.title}</Link>
              </td>
              <td>{formatDate(loan.loaned_at)}</td>
              <td>{formatDate(loan.returned_at)}</td>
              <td>{!loan.returned_at && <button onClick={() => handleReturn(loan.id)}>반납</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
