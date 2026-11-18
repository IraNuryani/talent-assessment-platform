import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'HR_ADMIN';
  phone?: string;
  nik?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('talentassess_token'));
  const user = ref<User | null>(
    localStorage.getItem('talentassess_user')
      ? JSON.parse(localStorage.getItem('talentassess_user')!)
      : null
  );

  const isAuthenticated = computed(() => !!token.value);
  const isHrAdmin = computed(() => user.value?.role === 'HR_ADMIN');
  const isCandidate = computed(() => user.value?.role === 'CANDIDATE');

  function setAuth(newToken: string, newUser: User) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('talentassess_token', newToken);
    localStorage.setItem('talentassess_user', JSON.stringify(newUser));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('talentassess_token');
    localStorage.removeItem('talentassess_user');
  }

  /**
   * One-click switcher feature for Portfolio Demo
   * Allows recruiters/interviewers to seamlessly test both Candidate & Admin views!
   */
  async function switchRole(targetRole: 'CANDIDATE' | 'HR_ADMIN') {
    const email = targetRole === 'HR_ADMIN' ? 'admin@talentassess.com' : 'kandidat@example.com';
    const password = targetRole === 'HR_ADMIN' ? 'admin123' : 'kandidat123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.user);
        return true;
      }
    } catch (e) {
      console.error('Role switch failed', e);
    }
    return false;
  }

  return {
    token,
    user,
    isAuthenticated,
    isHrAdmin,
    isCandidate,
    setAuth,
    logout,
    switchRole,
  };
});
