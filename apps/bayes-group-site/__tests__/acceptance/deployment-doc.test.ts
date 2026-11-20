import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const md = fs.readFileSync(path.join(ROOT, 'DEPLOYMENT.md'), 'utf8');
const flat = md.replace(/\s+/g, ' ');

describe('DEPLOYMENT.md static hosting guidance', () => {
  test('says dist/ can be uploaded as it is', () => {
    expect(flat).toMatch(/dist/);
    expect(flat).toMatch(/\bas[- ]is\b|as it is/i);
    expect(flat).toMatch(/upload/i);
  });

  test('says no rewrite rule is needed because every page is its own file', () => {
    expect(flat).toMatch(
      /no (spa )?(rewrite|fallback)|rewrite[^.]{0,60}(not|isn't|is not) (needed|required|necessary)|without (any |a )?(spa )?(rewrite|fallback)|(don't|do not|doesn't|does not) need (a |any )?(spa )?(rewrite|fallback)/i,
    );
    expect(flat).toMatch(/own (html )?file|its own|separate (html )?file/i);
  });

  test('says unknown addresses get 404.html', () => {
    expect(flat).toMatch(
      /(unknown|missing|non-?existent|not found|nonexistent)[^.]{0,120}404\.html|404\.html[^.]{0,120}(unknown|missing|non-?existent|nonexistent)/i,
    );
  });
});
