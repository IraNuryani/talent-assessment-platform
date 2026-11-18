import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import JobDetailView from '../views/JobDetailView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CandidateDashboard from '../views/CandidateDashboard.vue';
import AssessmentRoomView from '../views/AssessmentRoomView.vue';
import OnboardingWizardView from '../views/OnboardingWizardView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/jobs/:id', name: 'job-detail', component: JobDetailView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/my-applications', name: 'my-applications', component: CandidateDashboard },
  { path: '/assessment/:applicationId', name: 'assessment-room', component: AssessmentRoomView },
  { path: '/onboarding/:applicationId', name: 'onboarding-wizard', component: OnboardingWizardView },
  { path: '/admin', name: 'admin-dashboard', component: AdminDashboardView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
