<template>
  <div class="staff-assignment">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Staff Assignment</h3>
      <div class="flex items-center space-x-2">
        <button
          @click="autoAssignStaff"
          :disabled="!canAutoAssign"
          class="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Auto Assign
        </button>
        <button
          @click="showConflicts = !showConflicts"
          :class="[
            'px-3 py-2 text-sm rounded-lg transition-colors',
            showConflicts ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ showConflicts ? 'Hide' : 'Show' }} Conflicts
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Available Staff -->
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium text-gray-900 mb-4">Available Staff</h4>
        
        <!-- Staff Filters -->
        <div class="mb-4 space-y-2">
          <input
            v-model="staffFilter"
            type="text"
            placeholder="Search staff..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <select
            v-model="roleFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Roles</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="technician">Technician</option>
            <option value="support">Support Staff</option>
          </select>
        </div>

        <!-- Staff List -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="staff in filteredStaff"
            :key="staff.id"
            class="staff-card p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all"
            :class="getStaffCardClasses(staff)"
            @dragstart="onStaffDragStart($event, staff)"
            @dragend="onStaffDragEnd"
            draggable="true"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">
                    {{ staff.full_name.split(' ').map(n => n[0]).join('') }}
                  </span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ staff.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ staff.role }}</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Availability indicator -->
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    getAvailabilityColor(staff)
                  ]"
                  :title="getAvailabilityStatus(staff)"
                ></div>
                
                <!-- Conflict indicator -->
                <div
                  v-if="hasConflict(staff)"
                  class="w-4 h-4 text-red-500"
                  title="Has scheduling conflict"
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Staff details -->
            <div class="mt-2 text-xs text-gray-500">
              <div>Skills: {{ staff.skills?.join(', ') || 'None specified' }}</div>
              <div>Hours this week: {{ getWeeklyHours(staff) }}/{{ staff.max_weekly_hours || 40 }}</div>
            </div>

            <!-- Current assignments -->
            <div v-if="getCurrentAssignments(staff).length > 0" class="mt-2">
              <div class="text-xs text-gray-500 mb-1">Current assignments:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="assignment in getCurrentAssignments(staff).slice(0, 3)"
                  :key="assignment.id"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {{ assignment.shift.title }} ({{ assignment.shift.date }})
                </span>
                <span
                  v-if="getCurrentAssignments(staff).length > 3"
                  class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  +{{ getCurrentAssignments(staff).length - 3 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredStaff.length === 0" class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p>No staff members found</p>
          </div>
        </div>
      </div>

      <!-- Shift Details & Assignment -->
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium text-gray-900 mb-4">
          {{ selectedShift ? `${selectedShift.title} - ${selectedShift.date}` : 'Select a shift to assign staff' }}
        </h4>

        <div v-if="selectedShift">
          <!-- Shift Info -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Time:</span>
                {{ selectedShift.start_time }} - {{ selectedShift.end_time }}
              </div>
              <div>
                <span class="font-medium">Type:</span>
                {{ selectedShift.shift_type }}
              </div>
              <div>
                <span class="font-medium">Required Staff:</span>
                {{ selectedShift.required_staff }}
              </div>
              <div>
                <span class="font-medium">Currently Assigned:</span>
                {{ selectedShift.assigned_staff || 0 }}
              </div>
            </div>
            
            <!-- Staffing Status -->
            <div class="mt-3">
              <div class="flex items-center justify-between text-sm">
                <span>Staffing Progress</span>
                <span>{{ selectedShift.assigned_staff || 0 }}/{{ selectedShift.required_staff }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="getStaffingProgressColor(selectedShift)"
                  :style="{ width: `${getStaffingProgress(selectedShift)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Drop Zone -->
          <div
            class="drop-zone border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 transition-all"
            :class="isDragOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'"
            @drop="onStaffDrop($event)"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @dragenter.prevent
          >
            <div class="text-center">
              <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <p class="text-sm text-gray-600">
                Drag staff members here to assign them to this shift
              </p>
            </div>
          </div>

          <!-- Assigned Staff -->
          <div>
            <h5 class="font-medium text-gray-900 mb-3">Assigned Staff</h5>
            <div class="space-y-2">
              <div
                v-for="assignment in shiftAssignments"
                :key="assignment.id"
                class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-green-600">
                      {{ assignment.employee.full_name.split(' ').map(n => n[0]).join('') }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ assignment.employee.full_name }}</div>
                    <div class="text-sm text-gray-500">{{ assignment.role || assignment.employee.role }}</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Assignment status -->
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getAssignmentStatusClass(assignment.status)"
                  >
                    {{ assignment.status }}
                  </span>
                  
                  <!-- Remove assignment -->
                  <button
                    @click="removeAssignment(assignment)"
                    class="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove assignment"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="shiftAssignments.length === 0" class="text-center py-6 text-gray-500">
                <p class="text-sm">No staff assigned to this shift yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No shift selected -->
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
          </svg>
          <p>Select a shift from the calendar to assign staff</p>
        </div>
      </div>
    </div>

    <!-- Conflicts Panel -->
    <div v-if="showConflicts && conflicts.length > 0" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
      <h4 class="text-md font-medium text-red-900 mb-4">Scheduling Conflicts</h4>
      <div class="space-y-3">
        <div
          v-for="conflict in conflicts"
          :key="conflict.id"
          class="flex items-start space-x-3 p-3 bg-white border border-red-200 rounded-lg"
        >
          <div class="w-5 h-5 text-red-500 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-medium text-red-900">{{ conflict.type }}</div>
            <div class="text-sm text-red-700">{{ conflict.description }}</div>
            <div class="text-xs text-red-600 mt-1">{{ conflict.details }}</div>
          </div>
          <button
            @click="resolveConflict(conflict)"
            class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Staff {
  id: number
  full_name: string
  email: string
  role: string
  skills?: string[]
  max_weekly_hours?: number
  availability?: any
  current_assignments?: Assignment[]
}

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  shift_type: string
  title: string
  required_staff: number
  assigned_staff: number
}

interface Assignment {
  id: number
  shift_id: number
  employee_id: number
  employee: Staff
  shift: Shift
  role?: string
  status: 'assigned' | 'confirmed' | 'declined' | 'completed'
  notes?: string
}

interface Conflict {
  id: string
  type: string
  description: string
  details: string
  staff_id?: number
  shift_id?: number
}

interface Props {
  staff: Staff[]
  selectedShift?: Shift | null
  assignments: Assignment[]
  conflicts?: Conflict[]
}

const props = withDefaults(defineProps<Props>(), {
  staff: () => [],
  selectedShift: null,
  assignments: () => [],
  conflicts: () => []
})

const emit = defineEmits(['assign-staff', 'remove-assignment', 'resolve-conflict'])

// Reactive data
const staffFilter = ref('')
const roleFilter = ref('')
const showConflicts = ref(false)
const isDragOver = ref(false)
const draggedStaff = ref<Staff | null>(null)

// Computed
const filteredStaff = computed(() => {
  return props.staff.filter(staff => {
    const matchesName = staff.full_name.toLowerCase().includes(staffFilter.value.toLowerCase())
    const matchesRole = !roleFilter.value || staff.role === roleFilter.value
    return matchesName && matchesRole
  })
})

const shiftAssignments = computed(() => {
  if (!props.selectedShift) return []
  return props.assignments.filter(assignment => assignment.shift_id === props.selectedShift.id)
})

const canAutoAssign = computed(() => {
  return props.selectedShift && props.selectedShift.assigned_staff < props.selectedShift.required_staff
})

// Methods
const getStaffCardClasses = (staff: Staff) => {
  const classes = ['transition-all']
  
  if (hasConflict(staff)) {
    classes.push('border-red-300', 'bg-red-50')
  } else if (isAvailable(staff)) {
    classes.push('border-green-300', 'bg-green-50')
  }
  
  return classes
}

const getAvailabilityColor = (staff: Staff) => {
  if (!props.selectedShift) return 'bg-gray-300'
  
  if (isAvailable(staff)) return 'bg-green-500'
  if (hasConflict(staff)) return 'bg-red-500'
  return 'bg-yellow-500'
}

const getAvailabilityStatus = (staff: Staff) => {
  if (!props.selectedShift) return 'No shift selected'
  
  if (isAvailable(staff)) return 'Available'
  if (hasConflict(staff)) return 'Has conflict'
  return 'Limited availability'
}

const isAvailable = (staff: Staff) => {
  if (!props.selectedShift) return false
  
  // Check if staff is already assigned to another shift at the same time
  const conflictingAssignment = props.assignments.find(assignment => 
    assignment.employee_id === staff.id &&
    assignment.shift.date === props.selectedShift.date &&
    assignment.shift_id !== props.selectedShift.id &&
    isTimeOverlap(assignment.shift, props.selectedShift)
  )
  
  return !conflictingAssignment
}

const hasConflict = (staff: Staff) => {
  return props.conflicts.some(conflict => conflict.staff_id === staff.id)
}

const isTimeOverlap = (shift1: Shift, shift2: Shift) => {
  const start1 = new Date(`2000-01-01T${shift1.start_time}`)
  const end1 = new Date(`2000-01-01T${shift1.end_time}`)
  const start2 = new Date(`2000-01-01T${shift2.start_time}`)
  const end2 = new Date(`2000-01-01T${shift2.end_time}`)
  
  return start1 < end2 && start2 < end1
}

const getWeeklyHours = (staff: Staff) => {
  // Calculate total hours for current week
  return staff.current_assignments?.reduce((total, assignment) => {
    const shiftHours = calculateShiftHours(assignment.shift)
    return total + shiftHours
  }, 0) || 0
}

const calculateShiftHours = (shift: Shift) => {
  const start = new Date(`2000-01-01T${shift.start_time}`)
  const end = new Date(`2000-01-01T${shift.end_time}`)
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

const getCurrentAssignments = (staff: Staff) => {
  return props.assignments.filter(assignment => assignment.employee_id === staff.id)
}

const getStaffingProgress = (shift: Shift) => {
  return Math.min((shift.assigned_staff / shift.required_staff) * 100, 100)
}

const getStaffingProgressColor = (shift: Shift) => {
  const progress = getStaffingProgress(shift)
  if (progress >= 100) return 'bg-green-500'
  if (progress >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getAssignmentStatusClass = (status: string) => {
  const classes = {
    assigned: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Drag and drop handlers
const onStaffDragStart = (event: DragEvent, staff: Staff) => {
  draggedStaff.value = staff
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', staff.id.toString())
  }
}

const onStaffDragEnd = () => {
  draggedStaff.value = null
  isDragOver.value = false
}

const onStaffDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (draggedStaff.value && props.selectedShift) {
    emit('assign-staff', {
      staff: draggedStaff.value,
      shift: props.selectedShift
    })
  }
  
  draggedStaff.value = null
}

const removeAssignment = (assignment: Assignment) => {
  emit('remove-assignment', assignment)
}

const autoAssignStaff = () => {
  if (!props.selectedShift) return
  
  const availableStaff = filteredStaff.value.filter(staff => 
    isAvailable(staff) && !getCurrentAssignments(staff).some(a => a.shift_id === props.selectedShift.id)
  )
  
  const needed = props.selectedShift.required_staff - props.selectedShift.assigned_staff
  const toAssign = availableStaff.slice(0, needed)
  
  toAssign.forEach(staff => {
    emit('assign-staff', {
      staff,
      shift: props.selectedShift
    })
  })
}

const resolveConflict = (conflict: Conflict) => {
  emit('resolve-conflict', conflict)
}
</script>

<style scoped>
.staff-card {
  transition: all 0.2s ease;
}

.staff-card:hover {
  transform: translateY(-1px);
}

.drop-zone {
  transition: all 0.2s ease;
}

.drag-over {
  @apply border-blue-500 bg-blue-50;
}
</style>
