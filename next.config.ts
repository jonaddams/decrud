import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Exclude @nutrient-sdk/viewer from the bundle since we're using the CDN version
  serverExternalPackages: ['@nutrient-sdk/viewer'],
  
  webpack: (config, { isServer }) => {
    // Only configure webpack externals for client-side bundles
    if (!isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push({
          '@nutrient-sdk/viewer': 'NutrientViewer',
        });
      } else if (typeof config.externals === 'object') {
        config.externals = {
          ...config.externals,
          '@nutrient-sdk/viewer': 'NutrientViewer',
        };
      } else {
        config.externals = {
          '@nutrient-sdk/viewer': 'NutrientViewer',
        };
      }
    }
    return config;
  },
};

export default nextConfig;
