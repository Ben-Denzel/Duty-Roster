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
        <!-- System Admin Stats -->
        <template v-if="authStore.isSystemAdmin">
          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Enterprises</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalEnterprises || 0 }}</p>
                  <p class="text-xs text-gray-400">Platform wide</p>
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
                  <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Departments</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalDepartments || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.departmentsWithManagers || 0 }} managed</p>
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
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">System Health</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.systemHealth?.userActivityRate || 0 }}%</p>
                  <p class="text-xs text-gray-400">User activity rate</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Rosters</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalRosters || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.recentActivity?.newRosters || 0 }} recent</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Issues</p>
                  <p class="text-2xl font-bold text-gray-900">{{ (stats.departmentsWithoutManagers || 0) + (stats.pendingSwapRequests || 0) }}</p>
                  <p class="text-xs text-gray-400">Need attention</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Enterprise Admin Stats -->
        <template v-else-if="authStore.isEnterpriseAdmin">
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

          <!-- <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
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
          </div> -->

          <!-- <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
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
          </div> -->
        </template>

        <!-- Manager Stats -->
        <template v-else-if="authStore.isManager">
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
                  <p class="text-sm font-medium text-gray-500">Team Members</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalTeamMembers || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.activeTeamMembers || 0 }} active</p>
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
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Rosters</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalRosters || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.publishedRosters || 0 }} published</p>
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
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Coverage Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.shiftCoverageRate || 0 }}%</p>
                  <p class="text-xs text-gray-400">Last 30 days</p>
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
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Swap Requests</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalSwapRequests || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.pendingSwapRequests || 0 }} pending</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Employee Stats -->
        <template v-else-if="authStore.isEmployee">
          <div class="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Upcoming Shifts</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.upcomingShiftsCount || 0 }}</p>
                  <p class="text-xs text-gray-400">Next 7 days</p>
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
                      <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Hours Worked</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.totalHours || 0 }}h</p>
                  <p class="text-xs text-gray-400">Last 30 days</p>
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
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Acceptance Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.shiftAcceptanceRate || 0 }}%</p>
                  <p class="text-xs text-gray-400">{{ stats.confirmedShifts || 0 }} confirmed</p>
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
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Swap Requests</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.swapRequestsMade || 0 }}</p>
                  <p class="text-xs text-gray-400">{{ stats.pendingSwapRequests || 0 }} pending</p>
                </div>
              </div>
            </div>
          </div>
        </template>

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

      <!-- Role-Specific Quick Summary -->
      <div v-if="!dashboardLoading" class="mb-8">
        <!-- System Admin Summary -->
        <div v-if="authStore.isSystemAdmin" class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">System Overview</h3>
              <p class="text-sm text-gray-600">Platform-wide health and performance metrics</p>
            </div>
            <div class="flex space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="(stats.systemHealth?.userActivityRate || 0) >= 80 ? 'bg-green-100 text-green-800' :
                           (stats.systemHealth?.userActivityRate || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                           'bg-red-100 text-red-800'">
                {{ (stats.systemHealth?.userActivityRate || 0) >= 80 ? 'Healthy' :
                   (stats.systemHealth?.userActivityRate || 0) >= 60 ? 'Warning' : 'Critical' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">User Activity</p>
                  <p class="text-xl font-bold text-blue-600">{{ stats.systemHealth?.userActivityRate || 0 }}%</p>
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
                  <p class="text-sm text-gray-600">Dept Coverage</p>
                  <p class="text-xl font-bold text-green-600">{{ stats.systemHealth?.departmentCoverage || 0 }}%</p>
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
                  <p class="text-sm text-gray-600">Shift Coverage</p>
                  <p class="text-xl font-bold text-purple-600">{{ stats.systemHealth?.shiftCoverageRate || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Issues</p>
                  <p class="text-xl font-bold text-orange-600">{{ (stats.departmentsWithoutManagers || 0) + (stats.pendingSwapRequests || 0) }}</p>
                </div>
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- System Insights -->
          <div v-if="stats.insights && stats.insights.length > 0" class="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-900 mb-2">System Insights</h4>
            <ul class="space-y-1">
              <li v-for="insight in stats.insights.slice(0, 3)" :key="insight" class="text-sm text-blue-800">
                • {{ insight }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Enterprise Admin Summary -->
        <div v-else-if="authStore.isEnterpriseAdmin" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Enterprise Summary</h3>
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

        <!-- Manager Summary -->
        <div v-else-if="authStore.isManager" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Department Summary</h3>
              <p class="text-sm text-gray-600">{{ stats.department?.name || 'Your department' }} overview</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Team Activity</p>
                  <p class="text-xl font-bold text-green-600">{{ stats.teamActivityRate || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Shift Coverage</p>
                  <p class="text-xl font-bold text-blue-600">{{ stats.shiftCoverageRate || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Pending Actions</p>
                  <p class="text-xl font-bold text-orange-600">{{ (stats.pendingRosters || 0) + (stats.pendingSwapRequests || 0) }}</p>
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

        <!-- Employee Summary -->
        <div v-else-if="authStore.isEmployee" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">My Work Summary</h3>
              <p class="text-sm text-gray-600">Your personal work overview</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Performance</p>
                  <p class="text-xl font-bold text-green-600">{{ stats.shiftAcceptanceRate || 0 }}%</p>
                </div>
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Weekly Average</p>
                  <p class="text-xl font-bold text-blue-600">{{ stats.avgHoursPerWeek || 0 }}h</p>
                </div>
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Notifications</p>
                  <p class="text-xl font-bold text-orange-600">{{ stats.unreadNotifications || 0 }}</p>
                </div>
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Admin Enterprise Overview -->
      <div v-if="authStore.isSystemAdmin && stats.enterpriseBreakdown?.length > 0" class="mb-8">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Enterprise Management</h3>
                <p class="text-sm text-gray-600">Detailed enterprise performance and health metrics</p>
              </div>
              <div class="flex space-x-2">
                <router-link
                  to="/enterprises"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                >
                  Manage Enterprises
                </router-link>
              </div>
            </div>
          </div>
          <div class="p-6">
            <!-- Enterprise Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="enterprise in stats.enterpriseBreakdown"
                :key="enterprise.id"
                class="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
              >
                <!-- Enterprise Header -->
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ enterprise.name }}</h4>
                    <p class="text-xs text-gray-500">
                      Created {{ formatDate(enterprise.created_at) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="enterprise.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ enterprise.is_active ? 'Active' : 'Inactive' }}
                    </span>
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                         :class="enterprise.health_score >= 80 ? 'bg-green-500' :
                                enterprise.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'">
                      {{ enterprise.health_score }}
                    </div>
                  </div>
                </div>

                <!-- Enterprise Stats -->
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-center p-2 bg-blue-50 rounded">
                      <div class="text-lg font-bold text-blue-600">{{ enterprise.user_count }}</div>
                      <div class="text-xs text-blue-600">Total Users</div>
                    </div>
                    <div class="text-center p-2 bg-green-50 rounded">
                      <div class="text-lg font-bold text-green-600">{{ enterprise.active_users }}</div>
                      <div class="text-xs text-green-600">Active Users</div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-center p-2 bg-purple-50 rounded">
                      <div class="text-lg font-bold text-purple-600">{{ enterprise.department_count }}</div>
                      <div class="text-xs text-purple-600">Departments</div>
                    </div>
                    <div class="text-center p-2 bg-orange-50 rounded">
                      <div class="text-lg font-bold text-orange-600">{{ enterprise.departments_with_managers }}</div>
                      <div class="text-xs text-orange-600">Managed</div>
                    </div>
                  </div>

                  <!-- Role Breakdown -->
                  <div class="pt-2 border-t border-gray-200">
                    <div class="flex justify-between text-xs text-gray-600">
                      <span>Managers: {{ enterprise.managers }}</span>
                      <span>Employees: {{ enterprise.employees }}</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Admins: {{ enterprise.enterprise_admins }}</span>
                      <span>New (30d): {{ enterprise.recent_users }}</span>
                    </div>
                  </div>

                  <!-- Issues Alert -->
                  <div v-if="enterprise.departments_without_managers > 0 || enterprise.inactive_users > 0"
                       class="p-2 bg-red-50 rounded-md">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <div class="text-xs text-red-800">
                        <div v-if="enterprise.departments_without_managers > 0">
                          {{ enterprise.departments_without_managers }} dept(s) need managers
                        </div>
                        <div v-if="enterprise.inactive_users > 0">
                          {{ enterprise.inactive_users }} inactive users
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Admin Activity Overview -->
      <div v-if="authStore.isSystemAdmin && stats.recentActivity" class="mb-8">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p class="text-sm text-gray-600">Platform activity in the last 30 days</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.recentActivity.newRosters || 0 }}</div>
                <div class="text-sm text-blue-600">New Rosters</div>
                <div class="text-xs text-blue-500 mt-1">Created this month</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ stats.recentActivity.totalShiftsScheduled || 0 }}</div>
                <div class="text-sm text-green-600">Shifts Scheduled</div>
                <div class="text-xs text-green-500 mt-1">Last 30 days</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ stats.recentActivity.shiftsAssigned || 0 }}</div>
                <div class="text-sm text-purple-600">Shifts Assigned</div>
                <div class="text-xs text-purple-500 mt-1">Coverage rate: {{ stats.systemHealth?.shiftCoverageRate || 0 }}%</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ stats.recentActivity.newSwapRequests || 0 }}</div>
                <div class="text-sm text-orange-600">Swap Requests</div>
                <div class="text-xs text-orange-500 mt-1">{{ stats.pendingSwapRequests || 0 }} pending</div>
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

      <!-- Role-Specific Detailed Sections -->

      <!-- Employee Upcoming Shifts -->
      <div v-if="authStore.isEmployee && stats.upcomingShifts?.length > 0" class="mb-8">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Upcoming Shifts</h3>
            <p class="text-sm text-gray-600">Your schedule for the next 7 days</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="assignment in stats.upcomingShifts" :key="assignment.id"
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                         :class="assignment.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ new Date(assignment.shift.date).toLocaleDateString() }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ assignment.shift.start_time }} - {{ assignment.shift.end_time }}
                    </p>
                    <p class="text-xs text-gray-500">{{ assignment.shift.shift_type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="assignment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                               assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-gray-100 text-gray-800'">
                    {{ assignment.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manager Team Overview -->
      <div v-if="authStore.isManager && stats.teamMembers?.length > 0" class="mb-8">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Team Overview</h3>
            <p class="text-sm text-gray-600">{{ stats.department?.name || 'Your department' }} team members</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="member in stats.teamMembers.slice(0, 6)" :key="member.id"
                   class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       :class="member.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ member.full_name }}</p>
                  <p class="text-xs text-gray-500">{{ member.role }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                        :class="member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                    {{ member.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="stats.teamMembers.length > 6" class="mt-4 text-center">
              <p class="text-sm text-gray-500">
                And {{ stats.teamMembers.length - 6 }} more team members
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Manager Recent Rosters -->
      <div v-if="authStore.isManager && stats.recentRosters?.length > 0" class="mb-8">
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Recent Rosters</h3>
            <p class="text-sm text-gray-600">Latest roster activity</p>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div v-for="roster in stats.recentRosters" :key="roster.id"
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ roster.name }}</p>
                  <p class="text-sm text-gray-600">
                    {{ new Date(roster.start_date).toLocaleDateString() }} -
                    {{ new Date(roster.end_date).toLocaleDateString() }}
                  </p>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="roster.status === 'published' ? 'bg-green-100 text-green-800' :
                             roster.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-blue-100 text-blue-800'">
                  {{ roster.status }}
                </span>
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
  try {
    dashboardLoading.value = true
    let response

    if (authStore.isSystemAdmin) {
      response = await dashboardAPI.getSystemAnalytics()
    } else if (authStore.isEnterpriseAdmin) {
      response = await dashboardAPI.getEnterpriseAnalytics()
    } else if (authStore.isManager) {
      response = await dashboardAPI.getManagerAnalytics()
    } else if (authStore.isEmployee) {
      response = await dashboardAPI.getEmployeeAnalytics()
    }

    stats.value = response?.analytics || {}
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error)
  } finally {
    dashboardLoading.value = false
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
  fetchDashboardAnalytics()

  // Fetch additional data based on role
  if (authStore.isEnterpriseAdmin) {
    fetchDepartmentAnalytics()
  } else if (authStore.isSystemAdmin) {
    fetchEnterpriseAnalytics()
  }
})
</script>
