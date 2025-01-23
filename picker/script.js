const body = document.querySelector("body");
const button = document.getElementById("button");
const color = document.getElementById("color");
const lastColor = localStorage.getItem("picker-color");

if (lastColor) {
  button.style.backgroundColor = lastColor;
  color.textContent = lastColor;
}

button.addEventListener("click", async () => {
  body.style.display = "none";

  if ('EyeDropper' in window) {
    try {
      const eyedropper = new EyeDropper();
      const { sRGBHex } = await eyedropper.open();
      
      button.style.backgroundColor = sRGBHex;
      color.textContent = sRGBHex;
      
      await navigator.clipboard.writeText(sRGBHex);
      localStorage.setItem("picker-color", sRGBHex);
    } catch (error) {
      console.error('Error picking color:', error);
    }
  } else {
    alert('Your browser does not support the EyeDropper API.');
  }

  body.style.display = "block";
});
