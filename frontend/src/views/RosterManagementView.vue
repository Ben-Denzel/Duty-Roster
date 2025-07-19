<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Roster Management</h1>
            <p class="mt-2 text-gray-600">Create and manage duty rosters for your departments</p>
          </div>
          <button
            v-if="canCreateRoster"
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Create Roster
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              v-model="filters.department_id"
              @change="fetchRosters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              @change="fetchRosters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              v-model="filters.start_date"
              @change="fetchRosters"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Search rosters..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- View Toggle -->
      <div v-if="rosters.length > 0" class="mb-6 flex justify-center">
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-4 py-2 text-sm rounded-md transition-colors',
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            List View
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[
              'px-4 py-2 text-sm rounded-md transition-colors',
              viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Calendar View
          </button>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-if="viewMode === 'calendar' && selectedRoster">
        <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-900">{{ selectedRoster.name }}</h3>
          <p class="text-blue-700">{{ selectedRoster.department?.name }} • {{ formatDate(selectedRoster.start_date) }} - {{ formatDate(selectedRoster.end_date) }}</p>
        </div>

        <!-- Debug Info -->
        <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 class="font-semibold text-yellow-900">Debug Information:</h4>
          <p class="text-yellow-800">Roster Shifts: {{ rosterShifts.length }}</p>
          <p class="text-yellow-800">Available Staff: {{ availableStaff.length }}</p>
          <p class="text-yellow-800">Selected Shift: {{ selectedShift?.id || 'None' }}</p>
          <p class="text-yellow-800">Can Manage Shifts: {{ canManageShifts }}</p>
        </div>

        <!-- Simple Calendar Replacement for Testing -->
        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-semibold mb-4">Shifts ({{ rosterShifts.length }} total)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="shift in rosterShifts"
              :key="shift.id"
              class="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              :class="selectedShift?.id === shift.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              @click="onShiftSelected(shift)"
            >
              <div class="font-semibold">{{ shift.title }}</div>
              <div class="text-sm text-gray-600">{{ shift.date }}</div>
              <div class="text-sm text-gray-600">{{ shift.start_time }} - {{ shift.end_time }}</div>
              <div class="text-sm">
                <span :class="shift.assigned_staff >= shift.required_staff ? 'text-green-600' : 'text-red-600'">
                  {{ shift.assigned_staff }}/{{ shift.required_staff }} staff
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Staff Assignment Panel -->
        <div v-if="selectedShift" class="mt-8 bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-semibold mb-4">
            Assign Staff to: {{ selectedShift.title }} ({{ selectedShift.date }})
          </h4>

          <!-- Available Staff -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 class="font-medium mb-3">Available Staff</h5>
              <div class="space-y-2">
                <div
                  v-for="staff in availableStaff"
                  :key="staff.id"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div class="font-medium">{{ staff.full_name }}</div>
                    <div class="text-sm text-gray-600">{{ staff.role }}</div>
                  </div>
                  <button
                    @click="assignStaffToShift(staff, selectedShift)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            <!-- Assigned Staff -->
            <div>
              <h5 class="font-medium mb-3">Assigned Staff</h5>
              <div class="space-y-2">
                <div
                  v-for="assignment in shiftAssignments"
                  :key="assignment.id"
                  class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <div class="font-medium">{{ assignment.employee.full_name }}</div>
                    <div class="text-sm text-gray-600">{{ assignment.role || assignment.employee.role }}</div>
                  </div>
                  <button
                    @click="removeStaffAssignment(assignment)"
                    class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar View - No Roster Selected -->
      <div v-else-if="viewMode === 'calendar' && !selectedRoster" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Select a Roster</h3>
        <p class="text-gray-500">Choose a roster from the list below to view it in calendar mode.</p>
      </div>

      <!-- Rosters List -->
      <div v-else-if="viewMode === 'list' && rosters.length > 0" class="space-y-4">
        <div
          v-for="roster in rosters"
          :key="roster.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900">{{ roster.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ roster.department?.name }}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{{ formatDate(roster.start_date) }} - {{ formatDate(roster.end_date) }}</span>
                  <span>{{ roster.shifts?.length || 0 }} shifts</span>
                  <span>Created by {{ roster.creator?.full_name }}</span>
                </div>
                <p v-if="roster.description" class="text-gray-700 mt-2">{{ roster.description }}</p>

                <!-- Rejection Information -->
                <div v-if="roster.metadata?.rejection_notes && roster.status === 'draft'" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-start">
                    <svg class="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-red-800">Rejected</p>
                      <p class="text-xs text-red-700 mt-1">{{ roster.metadata.rejection_notes }}</p>
                      <div v-if="roster.metadata?.required_changes && roster.metadata.required_changes.length > 0" class="mt-2">
                        <p class="text-xs font-medium text-red-700">Required changes:</p>
                        <ul class="text-xs text-red-600 mt-1 space-y-1">
                          <li v-for="(change, index) in roster.metadata.required_changes.slice(0, 2)" :key="index" class="flex items-start">
                            <span class="text-red-500 mr-1">•</span>
                            <span>{{ change }}</span>
                          </li>
                          <li v-if="roster.metadata.required_changes.length > 2" class="text-red-500 text-xs">
                            ... and {{ roster.metadata.required_changes.length - 2 }} more
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(roster.status)"
                >
                  {{ getStatusLabel(roster.status) }}
                </span>
                <div class="flex space-x-2">
                  <button
                    @click="selectRoster(roster)"
                    :class="[
                      'px-3 py-1 text-sm rounded transition-colors duration-200',
                      selectedRoster?.id === roster.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                    ]"
                    title="Select for Calendar View"
                  >
                    {{ selectedRoster?.id === roster.id ? 'Selected' : 'Select' }}
                  </button>
                  <button
                    @click="viewRoster(roster)"
                    class="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="View Details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button
                    v-if="canEditRoster(roster)"
                    @click="editRoster(roster)"
                    class="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                    title="Edit Roster"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    v-if="canSubmitForApproval(roster)"
                    @click="submitForApproval(roster)"
                    class="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors duration-200"
                    title="Submit for Approval"
                  >
                    <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Submit
                  </button>
                  <button
                    v-if="canPublishRoster(roster)"
                    @click="publishRoster(roster)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                    title="Publish Roster"
                  >
                    <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    Publish
                  </button>
                  <button
                    v-if="canCopyRoster(roster)"
                    @click="copyRoster(roster)"
                    class="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    title="Copy Roster"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <button
                    v-if="canDeleteRoster(roster)"
                    @click="deleteRoster(roster)"
                    class="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete Roster"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="flex justify-center">
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {{ pagination.current_page }} of {{ pagination.total_pages }}
            </span>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.total_pages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No rosters found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first roster.</p>
        <div v-if="canCreateRoster" class="mt-6">
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Roster
          </button>
        </div>
      </div>

      <!-- Create Roster Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingRoster ? 'Edit Roster' : 'Create New Roster' }}
            </h3>
            <button
              @click="closeCreateModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="createRoster" class="mt-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Roster Name *</label>
                <input
                  v-model="createForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Weekly Emergency Roster"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  v-model="createForm.department_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    v-model="createForm.start_date"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    v-model="createForm.end_date"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shift Template *</label>
                <select
                  v-model="createForm.shift_template"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard (8-16, 16-24, 24-8)</option>
                  <option value="hospital">Hospital (7-19, 19-7)</option>
                  <option value="security">Security (6-18, 18-6)</option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  v-model="createForm.auto_generate_shifts"
                  type="checkbox"
                  id="auto_generate"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="auto_generate" class="ml-2 block text-sm text-gray-700">
                  Automatically generate shifts for all days
                </label>
              </div>

              <!-- Auto Staff Assignment Section -->
              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center mb-4">
                  <input
                    v-model="createForm.auto_assign_staff"
                    type="checkbox"
                    id="auto_assign_staff"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="auto_assign_staff" class="ml-2 block text-sm font-medium text-gray-700">
                    Automatically assign staff to shifts
                  </label>
                </div>

                <!-- Assignment Options (shown when auto_assign_staff is checked) -->
                <div v-if="createForm.auto_assign_staff" class="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Strategy</label>
                    <select
                      v-model="createForm.assignment_strategy"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="balanced">Balanced (Recommended)</option>
                      <option value="seniority">By Seniority</option>
                      <option value="availability">By Availability</option>
                      <option value="random">Random Assignment</option>
                    </select>
                    <p class="text-xs text-gray-600 mt-1">
                      <span v-if="createForm.assignment_strategy === 'balanced'">Distributes shifts fairly among all staff</span>
                      <span v-else-if="createForm.assignment_strategy === 'seniority'">Prioritizes senior staff members first</span>
                      <span v-else-if="createForm.assignment_strategy === 'availability'">Prioritizes full-time and high-availability staff</span>
                      <span v-else-if="createForm.assignment_strategy === 'random'">Randomly assigns staff to shifts</span>
                    </p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center">
                      <input
                        v-model="createForm.prefer_full_time"
                        type="checkbox"
                        id="prefer_full_time"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="prefer_full_time" class="ml-2 block text-sm text-gray-700">
                        Prefer full-time staff
                      </label>
                    </div>

                    <div class="flex items-center">
                      <input
                        v-model="createForm.avoid_consecutive_nights"
                        type="checkbox"
                        id="avoid_consecutive_nights"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="avoid_consecutive_nights" class="ml-2 block text-sm text-gray-700">
                        Avoid consecutive night shifts
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max Shifts Per Person (Optional)</label>
                    <input
                      v-model.number="createForm.max_shifts_per_person"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Leave empty for no limit"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p class="text-xs text-gray-600 mt-1">Limits the maximum number of shifts assigned to any single person</p>
                  </div>

                  <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div class="flex">
                      <svg class="w-4 h-4 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <div>
                        <p class="text-sm text-yellow-800 font-medium">Auto-Assignment Notes:</p>
                        <ul class="text-xs text-yellow-700 mt-1 space-y-1">
                          <li>• Staff assignments will respect conflict detection rules</li>
                          <li>• Some shifts may remain unassigned if no suitable staff available</li>
                          <li>• You can manually adjust assignments after creation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="createForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description for this roster..."
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeCreateModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {{ creating ? (editingRoster ? 'Updating...' : 'Creating...') : (editingRoster ? 'Update Roster' : 'Create Roster') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { rosterAPI, departmentAPI, approvalAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import RosterCalendar from '@/components/RosterCalendar.vue'
import StaffAssignment from '@/components/StaffAssignment.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const rosters = ref([])
const departments = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const editingRoster = ref(null)

// Calendar and Staff Assignment
const viewMode = ref('list') // 'list' or 'calendar'
const selectedRoster = ref(null)
const selectedShift = ref(null)
const rosterShifts = ref([])
const availableStaff = ref([])
const shiftAssignments = ref([])
const staffConflicts = ref([])

// Filters
const filters = ref({
  department_id: '',
  status: '',
  start_date: '',
  end_date: '',
  search: ''
})

// Create form
const createForm = ref({
  name: '',
  description: '',
  department_id: '',
  start_date: '',
  end_date: '',
  shift_template: 'hospital',
  auto_generate_shifts: true,
  auto_assign_staff: false,
  assignment_strategy: 'balanced',
  prefer_full_time: true,
  avoid_consecutive_nights: true,
  max_shifts_per_person: null
})

// Pagination
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 10
})

// Computed
const canCreateRoster = computed(() => {
  return ['systemAdmin', 'enterpriseAdmin'].includes(authStore.user?.role)
})

const canManageShifts = computed(() => {
  return ['systemAdmin', 'enterpriseAdmin', 'manager'].includes(authStore.user?.role)
})

const filteredRosters = computed(() => {
  return rosters.value.filter(roster => {
    const matchesSearch = !filters.value.search ||
      roster.name.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesStatus = !filters.value.status || roster.status === filters.value.status
    return matchesSearch && matchesStatus
  })
})

// Methods
const fetchRosters = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.current_page,
      limit: pagination.value.items_per_page
    }

    if (filters.value.status) params.status = filters.value.status
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.search) params.search = filters.value.search

    let response

    if (!filters.value.department_id) {
      // Fetch all rosters across departments
      console.log('Fetching all rosters with params:', params)
      response = await rosterAPI.getAll(params)
    } else {
      // Fetch rosters for specific department
      console.log('Fetching rosters for department:', filters.value.department_id, 'with params:', params)
      response = await rosterAPI.getByDepartment(filters.value.department_id, params)
    }
    rosters.value = response.rosters || []
    pagination.value = response.pagination || pagination.value

    console.log('Rosters fetched successfully:', rosters.value.length, 'rosters')
  } catch (error) {
    console.error('Failed to fetch rosters:', error)
    rosters.value = []
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    console.log('Fetching departments...')
    console.log('Current user:', authStore.user)
    console.log('Auth token:', localStorage.getItem('auth_token'))

    const response = await departmentAPI.getAll()
    console.log('Departments response:', response)
    departments.value = response.departments || []
    console.log('Departments loaded:', departments.value.length, 'departments')
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    console.error('Error details:', error.response?.data)
    departments.value = []
  }
}

const viewRoster = (roster: any) => {
  router.push(`/rosters/${roster.id}`)
}

const editRoster = (roster: any) => {
  // Populate the form with existing roster data
  createForm.value = {
    name: roster.name,
    description: roster.description || '',
    department_id: roster.department_id.toString(),
    start_date: roster.start_date,
    end_date: roster.end_date,
    shift_template: roster.settings?.shift_template || 'hospital',
    auto_generate_shifts: false, // Don't auto-generate when editing
    auto_assign_staff: false,
    assignment_strategy: 'balanced',
    prefer_full_time: true,
    avoid_consecutive_nights: true,
    max_shifts_per_person: null
  }

  // Set editing mode
  editingRoster.value = roster
  showCreateModal.value = true
}

const copyRoster = (roster: any) => {
  // TODO: Implement copy functionality
  console.log('Copy roster:', roster.id)
}

const deleteRoster = async (roster: any) => {
  if (!confirm(`Are you sure you want to delete "${roster.name}"?`)) {
    return
  }
  
  try {
    await rosterAPI.delete(roster.id)
    await fetchRosters()
  } catch (error) {
    console.error('Failed to delete roster:', error)
  }
}

const canEditRoster = (roster: any) => {
  return ['draft', 'review'].includes(roster.status) && canCreateRoster.value
}

const canCopyRoster = (roster: any) => {
  return canCreateRoster.value
}

const canDeleteRoster = (roster: any) => {
  return roster.status === 'draft' && canCreateRoster.value
}

const canPublishRoster = (roster: any) => {
  return roster.status === 'approved' && canCreateRoster.value
}

const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Draft',
    review: 'Under Review',
    approved: 'Approved',
    published: 'Published'
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const createRoster = async () => {
  creating.value = true
  try {
    const data = {
      name: createForm.value.name,
      description: createForm.value.description || undefined,
      department_id: parseInt(createForm.value.department_id),
      start_date: createForm.value.start_date,
      end_date: createForm.value.end_date,
      shift_template: createForm.value.shift_template as 'standard' | 'hospital' | 'security',
      auto_generate_shifts: createForm.value.auto_generate_shifts,
      auto_assign_staff: createForm.value.auto_assign_staff,
      assignment_strategy: createForm.value.assignment_strategy,
      prefer_full_time: createForm.value.prefer_full_time,
      avoid_consecutive_nights: createForm.value.avoid_consecutive_nights,
      max_shifts_per_person: createForm.value.max_shifts_per_person || null
    }

    let response

    if (editingRoster.value) {
      // Update existing roster
      console.log('Updating roster:', editingRoster.value.id, 'with data:', data)
      response = await rosterAPI.update(editingRoster.value.id, data)
      console.log('Roster updated successfully:', response)
      alert('Roster updated successfully!')
    } else {
      // Create new roster
      console.log('Creating roster with shifts and auto-assignment:', data)
      response = await rosterAPI.createWithShifts(data)
      console.log('Roster created successfully:', response)

      // Show success message with assignment results
      if (response.auto_assignment?.enabled) {
        const assignment = response.auto_assignment
        alert(`Roster created successfully!\n\n` +
              `Shifts created: ${response.shifts_created}\n` +
              `Staff assignments: ${assignment.assignments_created}\n` +
              `Coverage achieved: ${assignment.coverage_achieved}%\n` +
              `Strategy used: ${assignment.strategy_used}\n` +
              `Conflicts detected: ${assignment.conflicts_detected}\n` +
              `Unassigned shifts: ${assignment.unassigned_shifts}`)
      } else {
        alert(`Roster created successfully with ${response.shifts_created} shifts!`)
      }
    }

    closeCreateModal()
    await fetchRosters()
  } catch (error: any) {
    console.error('Failed to create/update roster:', error)
    console.error('Error response:', error.response?.data)
    alert(`Failed to ${editingRoster.value ? 'update' : 'create'} roster. Please try again.`)
  } finally {
    creating.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingRoster.value = null
  // Reset form
  createForm.value = {
    name: '',
    description: '',
    department_id: '',
    start_date: '',
    end_date: '',
    shift_template: 'hospital',
    auto_generate_shifts: true,
    auto_assign_staff: false,
    assignment_strategy: 'balanced',
    prefer_full_time: true,
    avoid_consecutive_nights: true,
    max_shifts_per_person: null
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.total_pages) {
    pagination.value.current_page = page
    fetchRosters()
  }
}

const debouncedSearch = (() => {
  let timeout: any
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fetchRosters()
    }, 500)
  }
})()

// Calendar and Staff Assignment Methods
const selectRoster = async (roster: any) => {
  console.log('Selecting roster:', roster)
  selectedRoster.value = roster
  console.log('Fetching shifts for roster:', roster.id)
  await fetchRosterShifts(roster.id)
  console.log('Fetching staff for department:', roster.department_id)
  await fetchAvailableStaff(roster.department_id)
  console.log('Roster selection complete. Shifts:', rosterShifts.value.length, 'Staff:', availableStaff.value.length)
}

const fetchRosterShifts = async (rosterId: number) => {
  try {
    console.log('Fetching shifts for roster ID:', rosterId)
    const response = await fetch(`http://localhost:3000/api/shift-management/rosters/${rosterId}/shifts`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    console.log('Shifts response status:', response.status)
    const data = await response.json()
    console.log('Shifts data:', data)
    rosterShifts.value = data.shifts || []
    console.log('Set rosterShifts to:', rosterShifts.value.length, 'shifts')
  } catch (error) {
    console.error('Failed to fetch roster shifts:', error)
    rosterShifts.value = []
  }
}

const fetchAvailableStaff = async (departmentId: number) => {
  try {
    console.log('Fetching staff for department ID:', departmentId)
    const response = await fetch(`http://localhost:3000/api/departments/${departmentId}/staff`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    console.log('Staff response status:', response.status)
    const data = await response.json()
    console.log('Staff data:', data)
    availableStaff.value = data.users || []
    console.log('Set availableStaff to:', availableStaff.value.length, 'staff members')
  } catch (error) {
    console.error('Failed to fetch available staff:', error)
    availableStaff.value = []
  }
}

const onShiftSelected = async (shift: any) => {
  selectedShift.value = shift
  await fetchShiftAssignments(shift.id)
}

const fetchShiftAssignments = async (shiftId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/shift-management/shifts/${shiftId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    shiftAssignments.value = data.assignments || []
  } catch (error) {
    console.error('Failed to fetch shift assignments:', error)
    shiftAssignments.value = []
  }
}

const onAssignStaff = async (event: any) => {
  try {
    const { staff, shift } = event

    const response = await fetch('/api/conflicts/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        employee_id: staff.id,
        shift_id: shift.id,
        role: 'staff'
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Refresh assignments and shifts
      await fetchShiftAssignments(shift.id)
      await fetchRosterShifts(selectedRoster.value.id)

      // Show success message
      console.log('Staff assigned successfully:', data.assignment)
    } else {
      // Handle conflicts
      if (response.status === 409) {
        console.warn('Scheduling conflicts detected:', data.conflicts)
        staffConflicts.value = data.conflicts

        // Ask user if they want to force assign
        if (data.can_force && confirm('Scheduling conflicts detected. Force assign anyway?')) {
          await forceAssignStaff(staff, shift)
        }
      } else {
        console.error('Failed to assign staff:', data.message)
      }
    }
  } catch (error) {
    console.error('Error assigning staff:', error)
  }
}

const forceAssignStaff = async (staff: any, shift: any) => {
  try {
    const response = await fetch('/api/conflicts/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        employee_id: staff.id,
        shift_id: shift.id,
        role: 'staff',
        force_assign: true
      })
    })

    const data = await response.json()

    if (response.ok) {
      await fetchShiftAssignments(shift.id)
      await fetchRosterShifts(selectedRoster.value.id)
      console.log('Staff force assigned successfully:', data.assignment)
    } else {
      console.error('Failed to force assign staff:', data.message)
    }
  } catch (error) {
    console.error('Error force assigning staff:', error)
  }
}

const onRemoveAssignment = async (assignment: any) => {
  try {
    const response = await fetch(`/api/shift-management/assignments/${assignment.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.ok) {
      await fetchShiftAssignments(selectedShift.value.id)
      await fetchRosterShifts(selectedRoster.value.id)
      console.log('Assignment removed successfully')
    } else {
      console.error('Failed to remove assignment')
    }
  } catch (error) {
    console.error('Error removing assignment:', error)
  }
}

const onShiftMoved = async (event: any) => {
  try {
    const { shift, newDate, oldDate } = event

    const response = await fetch(`/api/shifts/${shift.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        date: newDate
      })
    })

    if (response.ok) {
      await fetchRosterShifts(selectedRoster.value.id)
      console.log('Shift moved successfully')
    } else {
      console.error('Failed to move shift')
    }
  } catch (error) {
    console.error('Error moving shift:', error)
  }
}

const onAddShift = (event: any) => {
  // TODO: Implement add shift modal
  console.log('Add shift for date:', event.date)
}

const onDateChanged = (date: Date) => {
  // TODO: Handle date change if needed
  console.log('Date changed:', date)
}

const onResolveConflict = (conflict: any) => {
  // TODO: Implement conflict resolution
  console.log('Resolve conflict:', conflict)
}

// Simplified assignment methods for testing
const assignStaffToShift = async (staff: any, shift: any) => {
  try {
    console.log('Assigning staff:', staff.full_name, 'to shift:', shift.title)

    const response = await fetch('http://localhost:3000/api/conflicts/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        employee_id: staff.id,
        shift_id: shift.id,
        role: 'staff'
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log('Staff assigned successfully:', data)
      // Refresh data
      await fetchShiftAssignments(shift.id)
      await fetchRosterShifts(selectedRoster.value.id)
      alert('Staff assigned successfully!')
    } else {
      console.error('Assignment failed:', data)
      if (response.status === 409) {
        const conflictDetails = data.conflicts.map(c => c.description).join('\n')
        if (confirm(`Conflicts detected:\n${conflictDetails}\n\nForce assign anyway?`)) {
          await forceAssignStaff(staff, shift)
        }
      } else {
        alert(`Assignment failed: ${data.message}`)
      }
    }
  } catch (error) {
    console.error('Error assigning staff:', error)
    alert('Error assigning staff. Please try again.')
  }
}

const removeStaffAssignment = async (assignment: any) => {
  try {
    console.log('Removing assignment:', assignment.id)

    const response = await fetch(`http://localhost:3000/api/shift-management/assignments/${assignment.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.ok) {
      console.log('Assignment removed successfully')
      // Refresh data
      await fetchShiftAssignments(selectedShift.value.id)
      await fetchRosterShifts(selectedRoster.value.id)
      alert('Assignment removed successfully!')
    } else {
      console.error('Failed to remove assignment')
      alert('Failed to remove assignment. Please try again.')
    }
  } catch (error) {
    console.error('Error removing assignment:', error)
    alert('Error removing assignment. Please try again.')
  }
}

const canSubmitForApproval = (roster: any) => {
  return roster.status === 'draft' && canManageShifts.value
}

const submitForApproval = async (roster: any) => {
  // Show confirmation dialog with submission options
  const message = prompt(
    `Submit "${roster.name}" for approval?\n\n` +
    `Please enter a message for the approver (optional):`,
    `Please review and approve this roster for ${roster.department?.name || 'the department'}.`
  )

  if (message === null) {
    // User cancelled
    return
  }

  try {
    console.log('Submitting roster for approval:', roster.id)

    const response = await approvalAPI.submit(roster.id, {
      message: message || 'Submitting roster for approval',
      priority: 'normal',
      approval_type: 'standard'
    })

    console.log('Roster submitted successfully:', response)

    // Show success message
    alert(
      `Roster "${roster.name}" submitted for approval successfully!\n\n` +
      `Status: ${response.roster?.status || 'Under Review'}\n` +
      `Statistics: ${response.statistics ?
        `${response.statistics.coverage_percentage}% coverage, ` +
        `${response.statistics.total_shifts} shifts, ` +
        `${response.statistics.assigned_shifts} assigned`
        : 'Processing...'}`
    )

    // Refresh the roster list to show updated status
    await fetchRosters()

  } catch (error: any) {
    console.error('Error submitting roster for approval:', error)

    // Show detailed error message
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    const validationIssues = error.response?.data?.issues || []

    let alertMessage = `Failed to submit roster for approval:\n${errorMessage}`

    if (validationIssues.length > 0) {
      alertMessage += '\n\nValidation Issues:'
      validationIssues.forEach((issue: any) => {
        alertMessage += `\n• ${issue.message}`
      })

      if (error.response?.data?.can_force) {
        const forceSubmit = confirm(
          alertMessage + '\n\nDo you want to force submit despite these issues?'
        )

        if (forceSubmit) {
          try {
            const response = await approvalAPI.submit(roster.id, {
              message: (message || 'Submitting roster for approval') + ' (Force submitted)',
              priority: 'high',
              approval_type: 'force'
            })

            alert('Roster force submitted for approval successfully!')
            await fetchRosters()
            return
          } catch (forceError) {
            console.error('Force submit failed:', forceError)
            alert('Force submit also failed. Please contact system administrator.')
          }
        }
      }
    } else {
      alert(alertMessage)
    }
  }
}

const publishRoster = async (roster: any) => {
  // Show confirmation dialog
  const confirmed = confirm(
    `Publish "${roster.name}"?\n\n` +
    `This will make the roster visible to all employees in ${roster.department?.name || 'the department'}.\n\n` +
    `Once published, the roster cannot be modified. Are you sure you want to continue?`
  )

  if (!confirmed) {
    return
  }

  try {
    console.log('Publishing roster:', roster.id)

    const response = await rosterAPI.updateStatus(roster.id, {
      status: 'published',
      notes: 'Roster published to employees'
    })

    console.log('Roster published successfully:', response)

    // Show success message
    alert(
      `Roster "${roster.name}" has been published successfully!\n\n` +
      `All employees in ${roster.department?.name || 'the department'} can now view their schedules.`
    )

    // Refresh the roster list to show updated status
    await fetchRosters()

  } catch (error: any) {
    console.error('Error publishing roster:', error)

    // Show error message
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    alert(`Failed to publish roster:\n${errorMessage}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchDepartments()
  fetchRosters()
})
</script>
