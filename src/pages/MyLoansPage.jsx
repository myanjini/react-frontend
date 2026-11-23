import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { listMyLoans, returnLoan } from '../api/loans';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/date';

export default function MyLoansPage() {
  const queryClient = useQueryClient();
  const { data: loans = [], error: loadError } = useQuery({
    queryKey: ['loans', 'me'],
    queryFn: ({ signal }) => listMyLoans(signal),
  });

  // 반납에 성공하면 내 대여 목록을 다시 불러오도록 캐시를 무효화합니다.
  const giveBack = useMutation({
    mutationFn: (loanId) => returnLoan(loanId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  const active = loans.filter((loan) => !loan.returned_at);

  return (
    <section>
      <h1>내 대여</h1>
      <p className="muted">현재 대여 중 {active.length}권 / 최대 3권</p>
      <ErrorMessage error={loadError ?? giveBack.error} />
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
              <td>{!loan.returned_at && <button onClick={() => giveBack.mutate(loan.id)} disabled={giveBack.isPending}>반납</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
