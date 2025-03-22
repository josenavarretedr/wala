<template>
  <div>
    <h1>HOla desde el Home Page</h1>

    <RouterLink :to="{ name: 'Dashboard' }">SUMMA</RouterLink> <br />
    <RouterLink :to="{ name: 'RegisterView' }">REGISTRO</RouterLink>
  </div>
</template>
