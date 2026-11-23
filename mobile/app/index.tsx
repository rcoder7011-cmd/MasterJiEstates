import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root Entry Route — MJ Estates
 * Redirects immediately to customer bottom tabs navigation
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

