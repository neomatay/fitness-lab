import { describe, expect, it } from 'vitest';
import { publicAssetUrl } from './publicAsset';

describe('publicAssetUrl', () => {
  it('uses the configured deployment base for public assets', () => {
    expect(publicAssetUrl('/assets/stretch/image10.png', '/fitness-lab/')).toBe(
      '/fitness-lab/assets/stretch/image10.png',
    );
  });

  it('keeps local-development paths rooted at the local server', () => {
    expect(publicAssetUrl('/assets/anatomy/image18.png', '/')).toBe('/assets/anatomy/image18.png');
  });

  it('preserves an empty optional asset', () => {
    expect(publicAssetUrl('', '/fitness-lab/')).toBe('');
  });
});
