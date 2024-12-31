<template>
  <div>
    <h1>HOla desde el Home Page</h1>
    <RouterLink to="/auth/login">Login</RouterLink>
    <RouterLink :to="{ name: 'Dashboard' }">SUMMA</RouterLink>
  </div>
</template>
