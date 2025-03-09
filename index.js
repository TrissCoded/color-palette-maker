document.addEventListener("DOMContentLoaded", () => {
  const palette = document.getElementById("palette");
  const generateBtn = document.getElementById("color-btn");

  function getRandomColor() {
      return "#" + Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
  }

  async function getColorName(hex) {
      try {
          const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.replace("#", "")}`);
          const data = await response.json();
          return data.name.value || "Unknown Color";
      } catch (error) {
          return "Unknown Color";
      }
  }

  function enableDragging() {
      let draggedItem = null;

      document.querySelectorAll(".color-col").forEach((col) => {
          col.setAttribute("draggable", true);

          col.addEventListener("dragstart", (event) => {
              draggedItem = event.target;
              event.target.classList.add("dragging");
          });

          col.addEventListener("dragend", (event) => {
              event.target.classList.remove("dragging");
          });

          col.addEventListener("dragover", (event) => {
              event.preventDefault();
              const afterElement = getDragAfterElement(palette, event.clientX);
              if (afterElement == null) {
                  palette.appendChild(draggedItem);
              } else {
                  palette.insertBefore(draggedItem, afterElement);
              }
          });
      });
  }

  function getDragAfterElement(container, x) {
      const draggableElements = [...container.querySelectorAll(".color-col:not(.dragging)")];

      return draggableElements.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = x - box.left - box.width / 2;
          if (offset < 0 && offset > closest.offset) {
              return { offset, element: child };
          } else {
              return closest;
          }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  async function generatePalette() {
      palette.innerHTML = "";

      for (let i = 0; i < 6; i++) {
          const colorHex = getRandomColor();

          const colorCol = document.createElement("div");
          colorCol.classList.add("color-col");
          colorCol.style.backgroundColor = colorHex;

          const colorText = document.createElement("p");
          colorText.classList.add("color-hex");
          colorText.textContent = colorHex;

          const colorName = document.createElement("p");
          colorName.classList.add("color-name");
          colorName.textContent = "Loading...";

          getColorName(colorHex).then((name) => {
              colorName.textContent = name;
          });

          const colorPicker = document.createElement("input");
          colorPicker.setAttribute("type", "color");
          colorPicker.classList.add("color-picker");
          colorPicker.value = colorHex;

          colorCol.addEventListener("click", () => {
              colorPicker.click();  
          });

          colorPicker.addEventListener("input", async (event) => {
              const newColor = event.target.value;
              colorCol.style.backgroundColor = newColor;
              colorText.textContent = newColor;

              const name = await getColorName(newColor);
              colorName.textContent = name;
          });

          colorCol.addEventListener("dblclick", () => {
              navigator.clipboard.writeText(colorText.textContent);
              alert(`Copied ${colorText.textContent} to clipboard!`);
          });

          colorCol.appendChild(colorText);
          colorCol.appendChild(colorName);
          colorCol.appendChild(colorPicker);
          palette.appendChild(colorCol);
      }

      enableDragging();
  }

  generatePalette();
  generateBtn.addEventListener("click", generatePalette);
});
