import { estimateArticleReadingTimeMinutes } from './article-reading-time.util';

describe('estimateArticleReadingTimeMinutes', () => {
  it('returns at least 1 for empty input', () => {
    expect(estimateArticleReadingTimeMinutes('')).toBe(1);
  });

  it('does not treat huge base64 data URLs as thousands of words', () => {
    const junk = 'a'.repeat(50_000);
    const html = `<p>Hello world.</p><img src="data:image/png;base64,${junk}" />`;
    const minutes = estimateArticleReadingTimeMinutes(html);
    expect(minutes).toBeLessThan(10);
    expect(minutes).toBeGreaterThanOrEqual(1);
  });

  it('adds time for external images', () => {
    const html =
      '<p>' +
      Array.from({ length: 400 }, () => 'word').join(' ') +
      '</p><img src="https://example.com/a.png" />';
    const minutes = estimateArticleReadingTimeMinutes(html);
    expect(minutes).toBeGreaterThanOrEqual(2);
  });
});
