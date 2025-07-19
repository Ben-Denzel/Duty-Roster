<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Shift Templates</h3>
          <p class="text-sm text-gray-600">Manage reusable shift patterns for {{ department?.name }}</p>
        </div>
        <button
          v-if="canEdit"
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Template
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>

    <!-- Templates List -->
    <div v-else-if="templates.length > 0" class="divide-y divide-gray-200">
      <div
        v-for="template in templates"
        :key="template.id"
        class="p-6 hover:bg-gray-50 transition-colors duration-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Color indicator -->
            <div
              class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              :style="{ backgroundColor: template.color || '#3B82F6' }"
            ></div>
            
            <div>
              <h4 class="text-lg font-medium text-gray-900">{{ template.name }}</h4>
              <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ template.start }} - {{ template.end }}
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  {{ template.required_staff || 1 }} staff required
                </span>
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="template.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ template.enabled ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p v-if="template.description" class="text-sm text-gray-500 mt-1">
                {{ template.description }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canEdit" class="flex items-center space-x-2">
            <button
              @click="editTemplate(template)"
              class="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              title="Edit template"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="deleteTemplate(template)"
              class="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Delete template"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Break Schedule (if exists) -->
        <div v-if="template.break_schedule && template.break_schedule.breaks?.length > 0" class="mt-3 ml-8">
          <div class="text-xs text-gray-500 mb-1">Break Schedule:</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="breakItem in template.break_schedule.breaks"
              :key="breakItem.name"
              class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
            >
              {{ breakItem.name }}: {{ breakItem.start }} - {{ breakItem.end }}
            </span>
            <span
              v-if="template.break_schedule.lunch_break"
              class="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded"
            >
              {{ template.break_schedule.lunch_break.name }}: {{ template.break_schedule.lunch_break.start }} - {{ template.break_schedule.lunch_break.end }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No shift templates</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating your first shift template.</p>
      <div v-if="canEdit" class="mt-6">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Template
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ShiftTemplateModal
      v-if="showCreateModal || showEditModal"
      :template="selectedTemplate"
      :department="department"
      :is-edit="showEditModal"
      @close="closeModal"
      @saved="handleTemplateSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { shiftTemplateAPI } from '@/services/api'
import ShiftTemplateModal from './ShiftTemplateModal.vue'

interface Props {
  department: {
    id: number
    name: string
    manager?: any
  } | null
}

const props = defineProps<Props>()

const authStore = useAuthStore()

// Reactive data
const templates = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedTemplate = ref(null)

// Computed
const canEdit = computed(() => {
  return ['systemAdmin', 'enterpriseAdmin'].includes(authStore.user?.role)
})

// Methods
const fetchTemplates = async () => {
  if (!props.department?.id) return

  loading.value = true
  try {
    const response = await shiftTemplateAPI.getByDepartment(props.department.id)
    templates.value = response.templates || []
  } catch (error) {
    console.error('Failed to fetch shift templates:', error)
    // Handle error (show toast, etc.)
  } finally {
    loading.value = false
  }
}

const editTemplate = (template: any) => {
  selectedTemplate.value = template
  showEditModal.value = true
}

const deleteTemplate = async (template: any) => {
  if (!confirm(`Are you sure you want to delete the "${template.name}" template?`)) {
    return
  }

  try {
    await shiftTemplateAPI.delete(props.department!.id, template.id)
    await fetchTemplates()
    // Show success message
  } catch (error) {
    console.error('Failed to delete template:', error)
    // Show error message
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedTemplate.value = null
}

const handleTemplateSaved = () => {
  closeModal()
  fetchTemplates()
}

// Lifecycle
onMounted(() => {
  fetchTemplates()
})

// Watch for department changes
import { watch } from 'vue'
watch(() => props.department?.id, () => {
  if (props.department?.id) {
    fetchTemplates()
  }
})
</script>
