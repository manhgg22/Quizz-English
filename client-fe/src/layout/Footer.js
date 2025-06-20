// src/pages/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ padding: '10px', background: '#f5f5f5', textAlign: 'center' }}>
      <p>© {new Date().getFullYear()} DuckMen và những người bạn. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
