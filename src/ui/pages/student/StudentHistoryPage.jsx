import { PageHeader } from '../../components/PageHeader.jsx';

function StudentHistoryPage() {
  return (
    <div>
      <PageHeader title="Historial" />
      <div className="empty-state">
        <p className="empty-state__text">En desarrollo — esta funcionalidad estará disponible pronto.</p>
      </div>
    </div>
  );
}

export default StudentHistoryPage;
