<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Welcome back, {{ authStore.user?.full_name }}!</h1>
        <p class="mt-2 text-gray-600">Here's what's happening in your workspace today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Loading State -->
        <div v-if="dashboardLoading" class="col-span-full flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>

        <!-- Stats Cards Content -->
        <template v-else>
        <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers || 0 }}</p>
                <p class="text-xs text-gray-400">{{ stats.activeUsers || 0 }} active</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Departments</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalDepartments || 0 }}</p>
                <p class="text-xs text-gray-400">{{ stats.departmentsWithManagers || 0 }} with managers</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Managers</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalManagers || 0 }}</p>
                <p class="text-xs text-gray-400">{{ stats.totalEmployees || 0 }} employees</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Activity Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.userActivityRate || 0 }}%</p>
                <p class="text-xs text-gray-400">{{ stats.unassignedUsers || 0 }} unassigned</p>
              </div>
            </div>
          </div>
        </div>
        </template>
      </div>

      <!-- Quick Actions (Enterprise Admin) -->
      <div v-if="authStore.isEnterpriseAdmin && !dashboardLoading" class="mb-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Quick Summary</h3>
              <p class="text-sm text-gray-600">Your enterprise at a glance</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Department Coverage</p>
                  <p class="text-xl font-bold text-green-600">{{ stats.departmentCoverage || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">User Activity</p>
                  <p class="text-xl font-bold text-blue-600">{{ stats.userActivityRate || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Need Attention</p>
                  <p class="text-xl font-bold text-orange-600">{{ (stats.departmentsWithoutManagers || 0) + (stats.unassignedUsers || 0) }}</p>
                </div>
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enterprise Overview (System Admin only) -->
      <div v-if="authStore.isSystemAdmin" class="mb-8">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Enterprise Overview</h3>
                <p class="text-sm text-gray-600">System-wide enterprise statistics</p>
              </div>
              <router-link
                to="/enterprises"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
              >
                Manage Enterprises
              </router-link>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ enterpriseStats.total_enterprises || 0 }}</div>
                <div class="text-sm text-gray-600">Total Enterprises</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ enterpriseStats.total_users || 0 }}</div>
                <div class="text-sm text-gray-600">Total Users</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ enterpriseStats.total_departments || 0 }}</div>
                <div class="text-sm text-gray-600">Total Departments</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ enterpriseStats.total_admins || 0 }}</div>
                <div class="text-sm text-gray-600">Enterprise Admins</div>
              </div>
            </div>

            <div v-if="enterpriseStats.enterprise_breakdown && enterpriseStats.enterprise_breakdown.length > 0" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-900">Enterprise Breakdown</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="enterprise in enterpriseStats.enterprise_breakdown"
                  :key="enterprise.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ enterprise.name }}</div>
                    <div class="text-xs text-gray-500">
                      Created: {{ formatDate(enterprise.created_at) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">{{ enterprise.user_count || 0 }} users</div>
                    <div class="text-xs text-gray-500">
                      {{ enterprise.department_count || 0 }} departments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Analytics (Enterprise Admin only) -->
      <div v-if="authStore.isEnterpriseAdmin" class="mb-8">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Department Overview</h3>
                <p class="text-sm text-gray-600">Organizational structure and statistics</p>
              </div>
              <router-link
                to="/departments"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
              >
                Manage Departments
              </router-link>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ departmentStats.total_departments || 0 }}</div>
                <div class="text-sm text-gray-600">Total Departments</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ departmentStats.departments_with_managers || 0 }}</div>
                <div class="text-sm text-gray-600">With Managers</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ departmentStats.departments_without_managers || 0 }}</div>
                <div class="text-sm text-gray-600">Need Managers</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ departmentStats.total_users || 0 }}</div>
                <div class="text-sm text-gray-600">Total Users</div>
              </div>
            </div>

            <div v-if="departmentStats.department_breakdown && departmentStats.department_breakdown.length > 0" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-900">Department Breakdown</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="dept in departmentStats.department_breakdown"
                  :key="dept.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ dept.name }}</div>
                    <div class="text-xs text-gray-500">
                      Manager: {{ dept.manager || 'Not assigned' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">{{ dept.user_count }} users</div>
                    <div class="text-xs text-gray-500">
                      {{ dept.manager_count }}M / {{ dept.employee_count }}E
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow-lg rounded-xl border border-gray-100">
            <div class="px-6 py-5 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p class="text-sm text-gray-600">Common tasks for your role</p>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- System Admin Actions -->
                <template v-if="authStore.isSystemAdmin">
                  <router-link
                    to="/enterprises"
                    class="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition duration-200"
                  >
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-700">Manage Enterprises</h4>
                        <p class="text-sm text-gray-600">Create and manage enterprises</p>
                      </div>
                    </div>
                  </router-link>

                  <div class="group p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition duration-200 cursor-pointer">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-green-700">System Settings</h4>
                        <p class="text-sm text-gray-600">Configure system preferences</p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Enterprise Admin Actions -->
                <template v-if="authStore.isEnterpriseAdmin">
                  <router-link
                    to="/users"
                    class="group p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition duration-200"
                  >
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-purple-700">Manage Users</h4>
                        <p class="text-sm text-gray-600">Add and manage staff</p>
                      </div>
                    </div>
                  </router-link>

                  <div class="group p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-red-100 transition duration-200 cursor-pointer">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-orange-700">Create Roster</h4>
                        <p class="text-sm text-gray-600">Build duty schedules</p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Manager Actions -->
                <template v-if="authStore.isManager">
                  <div class="group p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition duration-200 cursor-pointer">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-yellow-700">Review Rosters</h4>
                        <p class="text-sm text-gray-600">Approve pending schedules</p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Employee Actions -->
                <template v-if="authStore.isEmployee">
                  <div class="group p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 hover:from-teal-100 hover:to-cyan-100 transition duration-200 cursor-pointer">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-4">
                        <h4 class="text-lg font-semibold text-gray-900 group-hover:text-teal-700">View Schedule</h4>
                        <p class="text-sm text-gray-600">Check your duty roster</p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p class="text-sm text-gray-600">Latest updates and notifications</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Welcome to DutyRoster!</p>
                  <p class="text-sm text-gray-600">Your account has been successfully created.</p>
                  <p class="text-xs text-gray-400 mt-1">Just now</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">System Status</p>
                  <p class="text-sm text-gray-600">All systems are operational.</p>
                  <p class="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Feature Update</p>
                  <p class="text-sm text-gray-600">New dashboard features are now available.</p>
                  <p class="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            <div class="mt-6">
              <router-link
                to="/notifications"
                class="w-full text-center block text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-200"
              >
                View all activity
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { departmentAPI, dashboardAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()

// Real stats data
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalDepartments: 0,
  departmentsWithManagers: 0,
  departmentsWithoutManagers: 0,
  totalManagers: 0,
  totalEmployees: 0,
  unassignedUsers: 0,
  userActivityRate: 0,
  departmentCoverage: 0
})

// Department analytics data
const departmentStats = ref({})

// Enterprise analytics data (for system admin)
const enterpriseStats = ref({})

// Loading states
const dashboardLoading = ref(false)
const departmentLoading = ref(false)
const enterpriseLoading = ref(false)

const roleDisplay = computed(() => {
  switch (authStore.user?.role) {
    case 'systemAdmin':
      return 'System Administrator'
    case 'enterpriseAdmin':
      return 'Enterprise Administrator'
    case 'manager':
      return 'Department Manager'
    case 'employee':
      return 'Employee'
    default:
      return 'Unknown'
  }
})

const fetchDashboardAnalytics = async () => {
  if (authStore.isEnterpriseAdmin) {
    try {
      dashboardLoading.value = true
      const response = await dashboardAPI.getEnterpriseAnalytics()
      stats.value = response.analytics || {}
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error)
    } finally {
      dashboardLoading.value = false
    }
  }
}

const fetchDepartmentAnalytics = async () => {
  if (!authStore.user?.enterprise_id || !authStore.isEnterpriseAdmin) return

  try {
    const response = await departmentAPI.getAnalytics(authStore.user.enterprise_id)
    departmentStats.value = response.analytics || {}
  } catch (error) {
    console.error('Failed to fetch department analytics:', error)
  }
}

const fetchEnterpriseAnalytics = async () => {
  if (!authStore.isSystemAdmin) return

  try {
    const response = await dashboardAPI.getSystemAnalytics()
    enterpriseStats.value = response.analytics || {}
  } catch (error) {
    console.error('Failed to fetch enterprise analytics:', error)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  if (authStore.isSystemAdmin) {
    fetchEnterpriseAnalytics()
  } else if (authStore.isEnterpriseAdmin) {
    fetchDashboardAnalytics()
    fetchDepartmentAnalytics()
  }
})
</script>
