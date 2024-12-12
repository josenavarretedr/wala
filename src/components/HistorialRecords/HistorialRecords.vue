<template>
  <div>
    <h1>Historial de registros</h1>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Temperatura</th>
          <th>Humedad</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.id">
          <td>{{ record.date }}</td>
          <td>{{ record.temperature }}</td>
          <td>{{ record.humidity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
</script>
