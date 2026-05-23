import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <header className="about-header">
        <button className="back-link" onClick={() => navigate('/home')}>← Back to Home</button>
        <h1>About ReferShelf</h1>
      </header>

      <main className="about-main">
        <section className="about-intro">
          <h2>What is ReferShelf?</h2>
          <p>
            ReferShelf is a comprehensive platform designed for students, educators, and researchers to share and access academic resources seamlessly.
            Whether you're uploading lecture notes, research papers, or external links to valuable content, ReferShelf makes it easy to organize materials by subjects.
          </p>
          <p>
            Our mission is to foster a collaborative learning environment where knowledge is accessible to all. Built with modern web technologies, ReferShelf ensures secure uploads, user authentication, and an intuitive interface for browsing and managing resources.
          </p>
          <p>
            Users can upload profile images to personalize their accounts and enhance their presence on the platform.
          </p>
        </section>

        <section className="about-features">
          <h2>Key Features</h2>
          <ul>
            <li><strong>Resource Upload:</strong> Upload files (PDF, DOCX, PPT, Images) or share external links, categorized by subject.</li>
            <li><strong>Subject Folders:</strong> Browse and organize resources in dedicated folders for each academic subject.</li>
            <li><strong>User Management:</strong> Create profiles, view your uploads, edit or delete resources, and manage downloads.</li>
            <li><strong>Admin Dashboard:</strong> For administrators to create subjects and oversee platform content.</li>
            <li><strong>Secure Authentication:</strong> Login with email/password or Google, with role-based access (User/Admin).</li>
            <li><strong>Search & Explore:</strong> Easily search and discover resources across the platform.</li>
          </ul>
        </section>

        <section className="about-contact">
          <h2>Contact Us</h2>
          <p>If you have questions, feedback, or need support, feel free to reach out:</p>
          <ul className="contact-list">
            <li><strong>Email:</strong> referself8@gmail.com</li>
            <li><strong>Phone:</strong> 9894538632</li>
            <li><strong>Address:</strong> Thoothukudi</li>
          </ul>
          <p>We'd love to hear from you and are committed to improving ReferShelf based on your input!</p>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
