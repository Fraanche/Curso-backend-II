const socket = io();

const productListContainer = document.getElementById("productList");
const productForm = document.getElementById("productForm");

socket.on("products", (products) => {
  console.log("Lista de productos recibida:", products);
  updateProductList(products);
});

function updateProductList(products) {
  productListContainer.innerHTML = "";

  if (products.length === 0) {
    productListContainer.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
            <h3>${product.title}</h3>
            <p><strong>Código:</strong> ${product.code}</p>
            <p><strong>Precio:</strong> $${product.price}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
            <!-- Botón para eliminar (funciona por API) -->
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
    productListContainer.appendChild(productCard);
  });
}

async function deleteProduct(id) {
  try {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      productForm.reset();
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  });
}
