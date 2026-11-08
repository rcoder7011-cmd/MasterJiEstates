import React from 'react';
import LegalPageLayout from './LegalPageLayout.jsx';

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      pageType="cookie_policy"
      title="Cookie Policy"
      description="Details regarding the essential authentication and CSRF security cookies utilized by MasterJiEstates without third-party tracking pixels."
      canonicalPath="/cookie-policy"
    />
  );
}

