<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="flex justify-between items-center pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit Shift Template' : 'Create Shift Template' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="template-id" class="block text-sm font-medium text-gray-700 mb-2">
                Template ID *
              </label>
              <input
                id="template-id"
                v-model="form.id"
                type="text"
                required
                :disabled="isEdit"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., morning, afternoon, night"
              />
              <p class="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
            </div>

            <div>
              <label for="template-name" class="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                id="template-name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Morning Shift"
              />
            </div>
          </div>

          <!-- Time Settings -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="start-time" class="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                id="start-time"
                v-model="form.start"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="end-time" class="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                id="end-time"
                v-model="form.end"
                type="time"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="required-staff" class="block text-sm font-medium text-gray-700 mb-2">
                Required Staff
              </label>
              <input
                id="required-staff"
                v-model.number="form.required_staff"
                type="number"
                min="1"
                max="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Visual Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div class="flex items-center space-x-3">
                <input
                  id="color"
                  v-model="form.color"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="form.color"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="enabled"
                v-model="form.enabled"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="enabled" class="ml-2 block text-sm text-gray-900">
                Template is active
              </label>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description for this shift template..."
            ></textarea>
          </div>

          <!-- Break Schedule -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-medium text-gray-900">Break Schedule</h4>
              <button
                type="button"
                @click="addBreak"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Break
              </button>
            </div>

            <!-- Breaks List -->
            <div v-if="form.break_schedule.breaks.length > 0" class="space-y-3 mb-4">
              <div
                v-for="(breakItem, index) in form.break_schedule.breaks"
                :key="index"
                class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <input
                  v-model="breakItem.name"
                  type="text"
                  placeholder="Break name"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  v-model="breakItem.start"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span class="text-gray-500">to</span>
                <input
                  v-model="breakItem.end"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  @click="removeBreak(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Lunch Break -->
            <div class="flex items-center space-x-3">
              <input
                id="has-lunch"
                v-model="hasLunchBreak"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="has-lunch" class="text-sm text-gray-900">Include lunch break</label>
            </div>

            <div v-if="hasLunchBreak" class="mt-3 p-3 bg-orange-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <input
                  v-model="form.break_schedule.lunch_break.name"
                  type="text"
                  placeholder="Lunch break name"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  v-model="form.break_schedule.lunch_break.start"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span class="text-gray-500">to</span>
                <input
                  v-model="form.break_schedule.lunch_break.end"
                  type="time"
                  class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ saving ? 'Saving...' : (isEdit ? 'Update Template' : 'Create Template') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { shiftTemplateAPI } from '@/services/api'

interface Props {
  template?: any
  department: {
    id: number
    name: string
  } | null
  isEdit: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'saved'])

// Reactive data
const saving = ref(false)

const form = reactive({
  id: '',
  name: '',
  start: '09:00',
  end: '17:00',
  enabled: true,
  required_staff: 1,
  color: '#3B82F6',
  description: '',
  break_schedule: {
    breaks: [],
    lunch_break: {
      name: 'Lunch',
      start: '12:00',
      end: '12:30'
    },
    total_break_minutes: 0
  }
})

const hasLunchBreak = ref(false)

// Computed
const totalBreakMinutes = computed(() => {
  let total = 0
  
  // Calculate break minutes
  form.break_schedule.breaks.forEach(breakItem => {
    if (breakItem.start && breakItem.end) {
      const start = new Date(`2000-01-01T${breakItem.start}:00`)
      const end = new Date(`2000-01-01T${breakItem.end}:00`)
      total += (end.getTime() - start.getTime()) / (1000 * 60)
    }
  })
  
  // Add lunch break minutes
  if (hasLunchBreak.value && form.break_schedule.lunch_break.start && form.break_schedule.lunch_break.end) {
    const start = new Date(`2000-01-01T${form.break_schedule.lunch_break.start}:00`)
    const end = new Date(`2000-01-01T${form.break_schedule.lunch_break.end}:00`)
    total += (end.getTime() - start.getTime()) / (1000 * 60)
  }
  
  return total
})

// Methods
const addBreak = () => {
  form.break_schedule.breaks.push({
    name: '',
    start: '',
    end: ''
  })
}

const removeBreak = (index: number) => {
  form.break_schedule.breaks.splice(index, 1)
}

const handleSubmit = async () => {
  if (!props.department?.id) return

  saving.value = true
  try {
    // Update total break minutes
    form.break_schedule.total_break_minutes = totalBreakMinutes.value
    
    // Clean up lunch break if not enabled
    if (!hasLunchBreak.value) {
      form.break_schedule.lunch_break = null
    }

    await shiftTemplateAPI.save(props.department.id, form)
    emit('saved')
  } catch (error) {
    console.error('Failed to save template:', error)
    // Handle error (show toast, etc.)
  } finally {
    saving.value = false
  }
}

// Initialize form with template data if editing
onMounted(() => {
  if (props.isEdit && props.template) {
    Object.assign(form, {
      id: props.template.id,
      name: props.template.name,
      start: props.template.start,
      end: props.template.end,
      enabled: props.template.enabled !== false,
      required_staff: props.template.required_staff || 1,
      color: props.template.color || '#3B82F6',
      description: props.template.description || '',
      break_schedule: {
        breaks: props.template.break_schedule?.breaks || [],
        lunch_break: props.template.break_schedule?.lunch_break || {
          name: 'Lunch',
          start: '12:00',
          end: '12:30'
        },
        total_break_minutes: props.template.break_schedule?.total_break_minutes || 0
      }
    })
    
    hasLunchBreak.value = !!props.template.break_schedule?.lunch_break
  }
})

// Watch for total break minutes changes
watch(totalBreakMinutes, (newValue) => {
  form.break_schedule.total_break_minutes = newValue
})
</script>
