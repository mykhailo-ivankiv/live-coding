<script setup lang="ts">
import { format, getDate, getDay, isSameMonth } from 'date-fns'
import { __, pipe, splitEvery } from 'ramda'
import { computed, ref } from 'vue'
import { extendMontToSixWeeks, getAllDaysInMonth, getMonths } from '@live/date-utils'

const weekStart = 1 // 0 is Sunday
const getMonthModel = pipe<[Date]>(getAllDaysInMonth(__, true, weekStart), extendMontToSixWeeks, splitEvery(7))

const targetDate = ref(new Date(2023, 1, 1))
const month = computed<Date[]>(() => getMonthModel(targetDate.value))

const months = getMonths(targetDate.value)
</script>

<template>
  <select class="py-1 px-2" type="number" v-model="targetDate">
    <option v-for="month in months" :value="month">
      {{ format(month, 'MMMM') }}
    </option>
  </select>
  <div>
    <span
      v-for="day in month[0]"
      :class="`${
        getDay(day) === 0 || getDay(day) === 6 ? 'text-red-600/50' : 'text-gray-600/50'
      } w-10 inline-block text-sm`"
      >{{ format(day, 'eee') }}</span
    >
  </div>
  <div v-for="week in month">
    <span class="w-10 inline-block" v-for="day in week">
      <span
        :class="`${getDay(day) === 6 || getDay(day) === 0 ? 'text-red-600' : 'text-gray-600'} 
          ${isSameMonth(day, targetDate) ? 'opacity-100' : 'opacity-50'}
        `"
        >{{ getDate(day) }}</span
      >
    </span>
  </div>
  <!--  <input type="date" />-->
</template>
