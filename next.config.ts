import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Exclude @nutrient-sdk/viewer from the bundle since we're using the CDN version
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
    return config;
  },
};

export default nextConfig;
