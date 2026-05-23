import ResourceCard from './ResourceCard';

function MyUploads({ resources, onEdit, onDelete, onOpen }) {
  return (
    <div className="my-uploads">
      <section className="resource-section">
        <h3>My Uploaded Resources</h3>
        <div className="resource-grid">
          {resources.length > 0 ? (
            resources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                onEdit={() => onEdit(res._id)}
                onDelete={() => onDelete(res._id)}
                onOpen={onOpen ? () => onOpen(res) : undefined}
              />
            ))
          ) : (
            <p>No resources uploaded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyUploads;
