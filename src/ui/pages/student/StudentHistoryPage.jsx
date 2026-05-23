import { PageHeader } from '../../components/PageHeader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';

function StudentHistoryPage() {
  return (
    <div>
      <PageHeader title="Historial" />
      <EmptyState message="En desarrollo — esta funcionalidad estará disponible pronto." />
    </div>
  );
}

export default StudentHistoryPage;
