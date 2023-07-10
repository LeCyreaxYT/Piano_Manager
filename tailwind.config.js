/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{vue,js,ts,jsx,tsx}', 
      "./node_modules/flowbite/**/*.js",
    ],
    darkMode: 'class', // or 'class'
    theme: {
    },
    plugins: [
      require('flowbite/plugin')
    ]
  }
  