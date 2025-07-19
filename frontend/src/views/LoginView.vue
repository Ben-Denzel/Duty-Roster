<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="min-h-screen flex">
      <!-- Left side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <div class="relative z-10 flex flex-col justify-center px-12 text-white">
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold">DutyRoster</h1>
            </div>
            <h2 class="text-4xl font-bold leading-tight mb-4">
              Professional Duty Management
            </h2>
            <p class="text-xl text-blue-100 leading-relaxed">
              Streamline your workforce scheduling with our comprehensive enterprise-grade duty roster management system.
            </p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span class="text-blue-100">Multi-enterprise support</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span class="text-blue-100">Role-based access control</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
              <span class="text-blue-100">Advanced scheduling tools</span>
            </div>
          </div>
        </div>
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
      </div>

      <!-- Right side - Login Form -->
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          <div class="text-center lg:text-left">
            <div class="flex items-center justify-center lg:justify-start mb-6 lg:hidden">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">DutyRoster</h1>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p class="text-gray-600 mb-8">
              Sign in to your account to continue
            </p>
          </div>
          <form class="space-y-6" @submit.prevent="handleLogin">
            <div class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div v-if="authStore.error" class="rounded-lg bg-red-50 border border-red-200 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    {{ authStore.error }}
                  </h3>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="authStore.loading"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg hover:shadow-xl"
              >
                <span v-if="authStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-gray-600">
                Need access? Contact your system administrator or enterprise admin to get an account.
              </p>
              <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p class="text-xs text-blue-800 font-medium">Demo Credentials:</p>
                <p class="text-xs text-blue-700">Email: admin@dutyroster.com</p>
                <p class="text-xs text-blue-700">Password: admin123</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.login(form.value)
    router.push('/dashboard')
  } catch (error) {
    // Error is handled by the store
  }
}

onMounted(() => {
  authStore.clearError()

  // Redirect if already authenticated
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>
