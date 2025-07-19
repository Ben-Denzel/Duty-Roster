<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="min-h-screen flex">
      <!-- Left side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <div class="relative z-10 flex flex-col justify-center px-12 text-white">
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h1 class="text-3xl font-bold">DutyRoster</h1>
            </div>
            <h2 class="text-4xl font-bold leading-tight mb-4">
              Join Our Platform
            </h2>
            <p class="text-xl text-indigo-100 leading-relaxed">
              Create your account and start managing your workforce efficiently with our advanced scheduling tools.
            </p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span class="text-indigo-100">Quick setup process</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span class="text-indigo-100">Secure and reliable</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-indigo-300 rounded-full mr-3"></div>
              <span class="text-indigo-100">24/7 support available</span>
            </div>
          </div>
        </div>
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
      </div>

      <!-- Right side - Register Form -->
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">

        <div class="mx-auto w-full max-w-sm lg:w-96">
          <div class="text-center lg:text-left">
            <div class="flex items-center justify-center lg:justify-start mb-6 lg:hidden">
              <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">DutyRoster</h1>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p class="text-gray-600 mb-8">
              Get started with your duty management journey
            </p>
          </div>

          <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
            <div class="space-y-4">
              <div>
                <label for="full_name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="full_name"
                  v-model="form.full_name"
                  name="full_name"
                  type="text"
                  required
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  v-model="form.role"
                  name="role"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a role</option>
                  <option value="systemAdmin">System Administrator</option>
                  <option value="enterpriseAdmin">Enterprise Administrator</option>
                  <option value="manager">Department Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700">Gender (Optional)</label>
                <select
                  id="gender"
                  v-model="form.gender"
                  name="gender"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
              <div class="flex">
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
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="authStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ authStore.loading ? 'Creating account...' : 'Create account' }}
              </button>
            </div>

            <div class="text-center">
              <router-link
                to="/login"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                Already have an account? Sign in
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
<!-- </div> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  full_name: '',
  email: '',
  password: '',
  role: '' as 'systemAdmin' | 'enterpriseAdmin' | 'manager' | 'employee' | '',
  gender: ''
})

const handleRegister = async () => {
  try {
    const registerData = {
      ...form.value,
      role: form.value.role as 'systemAdmin' | 'enterpriseAdmin' | 'manager' | 'employee'
    }

    if (!registerData.gender) {
      delete (registerData as any).gender
    }

    await authStore.register(registerData)
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
