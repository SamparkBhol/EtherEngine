import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 py-4 text-center">
      <p className="text-sm text-gray-400">
        &copy; {currentYear} Sampark Projects. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;