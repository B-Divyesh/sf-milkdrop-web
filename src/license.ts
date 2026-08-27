const SLUG = 'milkdrop-web';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;
const DAY = 86_400_000;

interface CachedVerdict { valid: boolean; checkedAt: number }
interface VerifyResponse { valid: boolean; reason?: string }

export class LicenseManager extends EventTarget {
  token = '';
  unlocked = false;

  constructor() {
    super();
    const url = new URL(location.href);
    const returned = url.searchParams.get('license');
    if (returned) {
      localStorage.setItem(LICENSE_KEY, returned);
      url.searchParams.delete('license');
      history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    this.token = returned || localStorage.getItem(LICENSE_KEY) || '';
    const cached = this.readVerdict();
    this.unlocked = Boolean(this.token && cached?.valid);
  }

  async initialize(): Promise<void> {
    if (!this.token) return;
    const cached = this.readVerdict();
    if (cached && Date.now() - cached.checkedAt < DAY) {
      this.setUnlocked(cached.valid);
      return;
    }
    await this.verify(false);
  }

  async restore(token: string): Promise<boolean> {
    this.token = token.trim();
    if (!this.token) return false;
    localStorage.setItem(LICENSE_KEY, this.token);
    return this.verify(true);
  }

  private async verify(throwOnNetwork: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(this.token)}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('The license service did not respond.');
      const verdict = await response.json() as VerifyResponse;
      localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
      this.setUnlocked(verdict.valid);
      return verdict.valid;
    } catch (error) {
      if (throwOnNetwork) throw error;
      return this.unlocked;
    }
  }

  private readVerdict(): CachedVerdict | null {
    try {
      const value = localStorage.getItem(VERDICT_KEY);
      return value ? JSON.parse(value) as CachedVerdict : null;
    } catch { return null; }
  }

  private setUnlocked(value: boolean): void {
    if (this.unlocked === value) return;
    this.unlocked = value;
    this.dispatchEvent(new CustomEvent('change', { detail: value }));
  }
}
