<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="flex justify-between items-center pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ action === 'approve' ? 'Approve Roster' : 'Reject Roster' }}
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

      <!-- Content -->
      <div class="mt-6">
        <!-- Roster Info -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900">{{ roster?.name }}</h4>
          <p class="text-sm text-gray-600 mt-1">{{ roster?.department?.name }}</p>
          <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{{ formatDate(roster?.start_date) }} - {{ formatDate(roster?.end_date) }}</span>
            <span>{{ roster?.summary?.total_shifts }} shifts</span>
            <span>{{ roster?.summary?.coverage_percentage }}% coverage</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit">
          <!-- Approval Form -->
          <div v-if="action === 'approve'">
            <div class="mb-4">
              <label for="approval-notes" class="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                id="approval-notes"
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add any notes or comments about this approval..."
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Approval Conditions (Optional)
              </label>
              <div class="space-y-2">
                <div
                  v-for="(condition, index) in form.conditions"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <input
                    v-model="condition.text"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter condition..."
                  />
                  <button
                    type="button"
                    @click="removeCondition(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addCondition"
                  class="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  + Add Condition
                </button>
              </div>
            </div>

            <!-- Coverage Warning -->
            <div v-if="roster?.summary?.coverage_percentage < 80" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <p class="text-sm text-yellow-800">
                    <strong>Warning:</strong> This roster has low coverage ({{ roster?.summary?.coverage_percentage }}%). 
                    Consider adding conditions or requesting improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Rejection Form -->
          <div v-else>
            <div class="mb-4">
              <label for="rejection-notes" class="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                id="rejection-notes"
                v-model="form.notes"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please explain why this roster is being rejected..."
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Required Changes
              </label>
              <div class="space-y-2">
                <div
                  v-for="(change, index) in form.required_changes"
                  :key="index"
                  class="flex items-center space-x-2"
                >
                  <input
                    v-model="change.text"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Describe required change..."
                  />
                  <button
                    type="button"
                    @click="removeRequiredChange(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addRequiredChange"
                  class="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  + Add Required Change
                </button>
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
              :disabled="submitting"
              :class="action === 'approve' ? 
                'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200' :
                'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'"
            >
              {{ submitting ? 'Processing...' : (action === 'approve' ? 'Approve Roster' : 'Reject Roster') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Props {
  roster: any
  action: 'approve' | 'reject'
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'confirmed'])

// Reactive data
const submitting = ref(false)

const form = reactive({
  notes: '',
  conditions: [] as Array<{ text: string }>,
  required_changes: [] as Array<{ text: string }>
})

// Methods
const addCondition = () => {
  form.conditions.push({ text: '' })
}

const removeCondition = (index: number) => {
  form.conditions.splice(index, 1)
}

const addRequiredChange = () => {
  form.required_changes.push({ text: '' })
}

const removeRequiredChange = (index: number) => {
  form.required_changes.splice(index, 1)
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    const data: any = {
      notes: form.notes
    }

    if (props.action === 'approve') {
      const conditions = form.conditions
        .filter(c => c.text.trim())
        .map(c => c.text.trim())
      
      if (conditions.length > 0) {
        data.conditions = conditions
      }
    } else {
      const requiredChanges = form.required_changes
        .filter(c => c.text.trim())
        .map(c => c.text.trim())
      
      if (requiredChanges.length > 0) {
        data.required_changes = requiredChanges
      }
    }

    emit('confirmed', data)
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Initialize with default conditions/changes if needed
onMounted(() => {
  if (props.action === 'approve') {
    // Add default condition if coverage is low
    if (props.roster?.summary?.coverage_percentage < 80) {
      form.conditions.push({ text: 'Monitor coverage and fill remaining shifts as needed' })
    }
  } else {
    // Add a default required change for rejection
    form.required_changes.push({ text: '' })
  }
})
</script>
