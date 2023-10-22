const body = document.querySelector('body')
const button = document.getElementById('button')
const color = document.getElementById('color')
const lastColor = localStorage.getItem('picker-color')

button.style.backgroundColor = lastColor
color.textContent = lastColor
button.addEventListener('click', async () => {
    body.style.display = "none"
    const eyedropper = new EyeDropper()
    const { sRGBHex } = await eyedropper.open()
    button.style.backgroundColor = sRGBHex
    color.textContent = sRGBHex.toUpperCase()
    body.style.display = "block"
    await navigator.clipboard.writeText(sRGBHex.toUpperCase())
    localStorage.setItem('picker-color', sRGBHex.toUpperCase())
})