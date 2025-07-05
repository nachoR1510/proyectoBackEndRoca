const socket = io();

const productList = document.getElementById("product-list");
const addForm = document.getElementById("addForm");
const deleteForm = document.getElementById("deleteForm");

socket.on("update-products", (products) => {
  productList.innerHTML = "";
  products.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.id} - ${p.title}`;
    productList.appendChild(li);
  });
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(addForm);
  const product = Object.fromEntries(data.entries());
  socket.emit("new-product", product);
  addForm.reset();
});

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = new FormData(deleteForm).get("id");
  socket.emit("delete-product", id);
  deleteForm.reset();
});
