import { makeAutoObservable, runInAction } from "mobx";
import { authAPI } from "../api/services";

class AuthStore {
  user = null;
  isLoading = false;
  error = null;
  isHydrated = false; // هل جربنا نلود اليوزر من الـ localStorage؟

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
  }

  // ── تحميل اليوزر من الـ localStorage عند بدء التشغيل ────────
  hydrate() {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        this.user = JSON.parse(stored);
      } catch {
        this.user = null;
      }
    }
    this.isHydrated = true;
  }

  get isLoggedIn() {
    return !!this.user && !!localStorage.getItem("access_token");
  }

  // ── Register ──────────────────────────────────────────────
  async register(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await authAPI.register(data);
      const { access, refresh, user } = res.data.data;
      this._setSession(access, refresh, user);
      return { success: true };
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data?.message || "فشل التسجيل.";
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // ── Login ─────────────────────────────────────────────────
  async login(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const res = await authAPI.login(data);
      const { access, refresh, user } = res.data.data;
      this._setSession(access, refresh, user);
      return { success: true };
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data?.message || "بيانات الدخول غير صحيحة.";
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // ── Logout ────────────────────────────────────────────────
  async logout() {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authAPI.logout({ refresh });
    } catch {}
    this._clearSession();
  }

  // ── Update Profile ────────────────────────────────────────
  async updateProfile(data) {
    this.isLoading = true;
    try {
      const res = await authAPI.updateProfile(data);
      runInAction(() => {
        this.user = { ...this.user, ...res.data.data };
        localStorage.setItem("user", JSON.stringify(this.user));
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  _setSession(access, refresh, user) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));
    this.user = user;
  }

  _clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    this.user = null;
  }
}

export default new AuthStore();
