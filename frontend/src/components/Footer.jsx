import React from "react";
import "../styles/Footer.css"; // make sure this file exists

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} ReferShelf. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
