<template>
  <div class="roster-calendar">
    <!-- Calendar Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <h2 class="text-2xl font-bold text-gray-900">{{ calendarTitle }}</h2>
        <div class="flex items-center space-x-2">
          <button
            @click="previousPeriod"
            class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            @click="nextPeriod"
            class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button
            @click="goToToday"
            class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'week'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Week
          </button>
          <button
            @click="viewMode = 'month'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Month
          </button>
        </div>

        <!-- Add Shift Button -->
        <button
          v-if="canManageShifts"
          @click="showAddShiftModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Shift
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Week View -->
      <div v-if="viewMode === 'week'" class="week-view">
        <!-- Week Header -->
        <div class="grid grid-cols-8 border-b border-gray-200">
          <div class="p-4 text-sm font-medium text-gray-500">Time</div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="p-4 text-center border-l border-gray-200"
          >
            <div class="text-sm font-medium text-gray-900">{{ day.dayName }}</div>
            <div class="text-lg font-bold" :class="day.isToday ? 'text-blue-600' : 'text-gray-700'">
              {{ day.dayNumber }}
            </div>
          </div>
        </div>

        <!-- Week Grid -->
        <div class="grid grid-cols-8 min-h-96">
          <!-- Time Column -->
          <div class="border-r border-gray-200">
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="h-16 border-b border-gray-100 p-2 text-xs text-gray-500"
            >
              {{ hour }}
            </div>
          </div>

          <!-- Day Columns -->
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="border-l border-gray-200 relative"
            @drop="onDrop($event, day.date)"
            @dragover.prevent
            @dragenter.prevent
          >
            <!-- Time Grid Lines -->
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="h-16 border-b border-gray-100"
            ></div>

            <!-- Shifts for this day -->
            <div
              v-for="shift in getShiftsForDay(day.date)"
              :key="shift.id"
              :style="getShiftStyle(shift)"
              class="absolute left-1 right-1 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md"
              :class="getShiftClasses(shift)"
              @click="selectShift(shift)"
              @dragstart="onDragStart($event, shift)"
              draggable="true"
            >
              <div class="p-2 text-xs">
                <div class="font-medium text-white">{{ shift.title }}</div>
                <div class="text-white/80">{{ shift.start_time }} - {{ shift.end_time }}</div>
                <div class="text-white/80">{{ shift.assigned_staff }}/{{ shift.required_staff }} staff</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month View -->
      <div v-else class="month-view">
        <!-- Month Header -->
        <div class="grid grid-cols-7 border-b border-gray-200">
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="p-4 text-center text-sm font-medium text-gray-500 border-l border-gray-200 first:border-l-0"
          >
            {{ day }}
          </div>
        </div>

        <!-- Month Grid -->
        <div class="grid grid-cols-7">
          <div
            v-for="day in monthDays"
            :key="day.date"
            class="min-h-32 border-b border-l border-gray-200 first:border-l-0 p-2"
            :class="[
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
              day.isToday ? 'bg-blue-50' : ''
            ]"
            @drop="onDrop($event, day.date)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="flex justify-between items-start mb-2">
              <span
                class="text-sm font-medium"
                :class="[
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                  day.isToday ? 'text-blue-600' : ''
                ]"
              >
                {{ day.dayNumber }}
              </span>
              <button
                v-if="day.isCurrentMonth && canManageShifts"
                @click="addShiftToDay(day.date)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>

            <!-- Shifts for this day -->
            <div class="space-y-1">
              <div
                v-for="shift in getShiftsForDay(day.date).slice(0, 3)"
                :key="shift.id"
                class="text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm"
                :class="getShiftClasses(shift)"
                @click="selectShift(shift)"
                @dragstart="onDragStart($event, shift)"
                draggable="true"
              >
                <div class="font-medium text-white truncate">{{ shift.title }}</div>
                <div class="text-white/80">{{ shift.start_time }}</div>
              </div>
              
              <!-- More indicator -->
              <div
                v-if="getShiftsForDay(day.date).length > 3"
                class="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                @click="showDayDetails(day.date)"
              >
                +{{ getShiftsForDay(day.date).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex items-center space-x-6 text-sm">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-blue-500 rounded"></div>
        <span>Day Shift</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-indigo-500 rounded"></div>
        <span>Night Shift</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-purple-500 rounded"></div>
        <span>Weekend</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-green-500 rounded"></div>
        <span>Fully Staffed</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-red-500 rounded"></div>
        <span>Understaffed</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  shift_type: string
  title: string
  required_staff: number
  assigned_staff: number
  color?: string
  status?: string
}

interface Props {
  shifts: Shift[]
  canManageShifts?: boolean
  selectedDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  shifts: () => [],
  canManageShifts: false,
  selectedDate: () => new Date()
})

const emit = defineEmits(['shift-selected', 'shift-moved', 'add-shift', 'date-changed'])

// Reactive data
const viewMode = ref<'week' | 'month'>('week')
const currentDate = ref(new Date(props.selectedDate))
const selectedShift = ref<Shift | null>(null)
const showAddShiftModal = ref(false)
const draggedShift = ref<Shift | null>(null)

// Time slots for week view (24-hour format)
const timeSlots = computed(() => {
  const slots = []
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0')
    slots.push(`${hour}:00`)
  }
  return slots
})

// Calendar title
const calendarTitle = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  }
  
  if (viewMode.value === 'week') {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    } else {
      return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    }
  } else {
    return currentDate.value.toLocaleDateString('en-US', options)
  }
})

// Week days for week view
const weekDays = computed(() => {
  const weekStart = getWeekStart(currentDate.value)
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

// Month days for month view
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

// Methods
const getWeekStart = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return start
}

const getShiftsForDay = (date: string) => {
  return props.shifts.filter(shift => shift.date === date)
}

const getShiftStyle = (shift: Shift) => {
  if (viewMode.value !== 'week') return {}
  
  const startHour = parseInt(shift.start_time.split(':')[0])
  const endHour = parseInt(shift.end_time.split(':')[0])
  const duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour
  
  return {
    top: `${startHour * 4}rem`,
    height: `${duration * 4}rem`,
    backgroundColor: shift.color || getDefaultShiftColor(shift.shift_type),
    zIndex: 10
  }
}

const getShiftClasses = (shift: Shift) => {
  const isFullyStaffed = shift.assigned_staff >= shift.required_staff
  const isUnderstaffed = shift.assigned_staff < shift.required_staff
  
  return [
    'border-l-4',
    isFullyStaffed ? 'border-green-400' : isUnderstaffed ? 'border-red-400' : 'border-yellow-400',
    selectedShift.value?.id === shift.id ? 'ring-2 ring-blue-500' : ''
  ]
}

const getDefaultShiftColor = (shiftType: string) => {
  const colors = {
    day: '#3B82F6',
    night: '#6366F1',
    evening: '#F59E0B',
    weekend: '#8B5CF6',
    holiday: '#EF4444'
  }
  return colors[shiftType] || colors.day
}

const selectShift = (shift: Shift) => {
  selectedShift.value = shift
  emit('shift-selected', shift)
}

const previousPeriod = () => {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setMonth(newDate.getMonth() - 1)
  }
  currentDate.value = newDate
  emit('date-changed', newDate)
}

const nextPeriod = () => {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setMonth(newDate.getMonth() + 1)
  }
  currentDate.value = newDate
  emit('date-changed', newDate)
}

const goToToday = () => {
  currentDate.value = new Date()
  emit('date-changed', currentDate.value)
}

const addShiftToDay = (date: string) => {
  emit('add-shift', { date })
}

const showDayDetails = (date: string) => {
  // TODO: Show day details modal
  console.log('Show day details for:', date)
}

// Drag and drop handlers
const onDragStart = (event: DragEvent, shift: Shift) => {
  draggedShift.value = shift
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', shift.id.toString())
  }
}

const onDrop = (event: DragEvent, targetDate: string) => {
  event.preventDefault()
  
  if (draggedShift.value && draggedShift.value.date !== targetDate) {
    emit('shift-moved', {
      shift: draggedShift.value,
      newDate: targetDate,
      oldDate: draggedShift.value.date
    })
  }
  
  draggedShift.value = null
}

// Watch for prop changes
watch(() => props.selectedDate, (newDate) => {
  currentDate.value = new Date(newDate)
})
</script>

<style scoped>
.roster-calendar {
  @apply w-full;
}

.week-view {
  @apply relative;
}

.month-view {
  @apply relative;
}

/* Drag and drop styles */
.drag-over {
  @apply bg-blue-50 border-blue-300;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .week-view .grid-cols-8 {
    @apply grid-cols-2;
  }
  
  .month-view .grid-cols-7 {
    @apply grid-cols-1;
  }
}
</style>
