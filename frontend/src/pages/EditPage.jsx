import { useParams, useNavigate } from 'react-router-dom';
import ResourceForm from '../components/ResourceForm';
import '../styles/EditPage.css';

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="edit-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Back to Home
      </button>

      <div className="edit-card">
        <h2>Update Resource</h2>
        <ResourceForm
          resourceId={id}
          isEditing={true}
          buttonLabel="Update Resource"
          onSuccess={() => navigate('/upload')}
        />
      </div>
    </div>
  );
}

export default EditPage;
