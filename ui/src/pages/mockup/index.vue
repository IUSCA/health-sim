<template>
  <div class="container">
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-4xl font-bold underline">Resources</h1>

      <!-- Grid of contact info -->
      <div class="mt-8 grid lg:grid-cols-3 gap-4 md:grid-cols-2 grid-cols-1">
        <div
          class="border border-solid rounded drop-shadow flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center bg-green-500 text-white font-bold rounded-full h-12 w-12 ml-5"
          >
            9.0
          </div>
          <div class="p-5">
            <h2 class="text-xl font-bold">Contact Info</h2>
            <p>Phone: 123-456-7890</p>
            <p>Email: placeholder@email.com</p>
          </div>
        </div>

        <div
          class="border border-solid rounded drop-shadow-2xl flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center bg-green-500 text-white font-bold rounded-full h-12 w-12 ml-5"
          >
            7.5
          </div>
          <div class="p-5">
            <h2 class="text-xl font-bold">Contact Info</h2>
            <p>Phone: 123-456-7890</p>
            <p>Email: placeholder@email.com</p>
          </div>
        </div>

        <div
          class="border border-solid rounded drop-shadow-2xl flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center bg-yellow-500 text-white font-bold rounded-full h-12 w-12 ml-5"
          >
            5.0
          </div>
          <div class="p-5">
            <h2 class="text-xl font-bold">Contact Info</h2>
            <p>Phone: 123-456-7890</p>
            <p>Email: placeholder@email.com</p>
          </div>
        </div>

        <div
          class="border border-solid rounded drop-shadow-2xl flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center bg-red-500 text-white font-bold rounded-full h-12 w-12 ml-5"
          >
            4.0
          </div>
          <div class="p-5">
            <h2 class="text-xl font-bold">Contact Info</h2>
            <p>Phone: 123-456-7890</p>
            <p>Email: placeholder@email.com</p>
          </div>
        </div>

        <div
          class="border border-solid rounded drop-shadow-2xl flex items-center justify-center"
        >
          <div
            class="flex items-center justify-center bg-red-500 text-white font-bold rounded-full h-12 w-12 ml-5"
          >
            2.0
          </div>
          <div class="p-5">
            <h2 class="text-xl font-bold">Contact Info</h2>
            <p>Phone: 123-456-7890</p>
            <p>Email: placeholder@email.com</p>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-8 flex flex-col items-center justify-center">
        <h2 class="text-xl font-bold underline">Legend</h2>

        <div class="grid lg:grid-cols-3 gap-4 md:grid-cols-2 grid-cols-1">
          <div class="flex items mt-4">
            <div
              class="flex items-center justify-center bg-green-500 text-white font-bold rounded h-6 w-12 ml-5"
            ></div>
            <p class="ml-2">High Likelihood</p>
          </div>

          <div class="flex items mt-4">
            <div
              class="flex items-center justify-center bg-yellow-500 text-white font-bold rounded h-6 w-12 ml-5"
            ></div>
            <p class="ml-2">Somewhat Likely</p>
          </div>

          <div class="flex items mt-4">
            <div
              class="flex items-center justify-center bg-red-500 text-white font-bold rounded h-6 w-12 ml-5"
            ></div>
            <p class="ml-2">Low Likelihood</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  title: Mockup
  requiresAuth: false
</route>
