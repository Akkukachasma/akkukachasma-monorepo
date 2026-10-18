import { MAX_EMBED_CODE_LENGTH, parseEmbedCode } from './embed-code.util';

describe('parseEmbedCode', () => {
  it('parses YouTube watch URL', () => {
    const result = parseEmbedCode('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toMatchObject({
      provider: 'youtube',
      iframeSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
  });

  it('parses YouTube iframe snippet', () => {
    const result = parseEmbedCode(
      '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>',
    );
    expect(result).toMatchObject({
      provider: 'youtube',
      iframeSrc: 'https://www.youtube.com/embed/abc123',
    });
  });

  it('parses Instagram blockquote with embed.js script stripped', () => {
    const code = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DS-ywFujLwT/?utm_source=ig_embed&amp;utm_campaign=loading"></blockquote>
<script async src="//www.instagram.com/embed.js"></script>`;
    const result = parseEmbedCode(code);
    expect(result).toMatchObject({
      provider: 'instagram',
      iframeSrc: 'https://www.instagram.com/reel/DS-ywFujLwT/embed',
    });
    expect(result?.storedCode).not.toMatch(/<script/i);
  });

  it('parses Vimeo URL', () => {
    const result = parseEmbedCode('https://vimeo.com/123456789');
    expect(result).toMatchObject({
      provider: 'vimeo',
      iframeSrc: 'https://player.vimeo.com/video/123456789',
    });
  });

  it('rejects empty input', () => {
    expect(parseEmbedCode('')).toBeNull();
    expect(parseEmbedCode('   ')).toBeNull();
  });

  it('rejects overlong input', () => {
    expect(parseEmbedCode('a'.repeat(MAX_EMBED_CODE_LENGTH + 1))).toBeNull();
  });

  it('rejects disallowed hosts', () => {
    expect(parseEmbedCode('https://evil.example.com/video')).toBeNull();
  });

  it('rejects raw script tags outside allowed embed patterns', () => {
    expect(parseEmbedCode('<script>alert(1)</script>')).toBeNull();
  });

  it('rejects both-neither style invalid iframe', () => {
    expect(parseEmbedCode('<iframe></iframe>')).toBeNull();
  });
});
