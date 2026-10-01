const form = document.getElementById("cat-form");
const list = document.getElementById("cat-list");
const filter = document.getElementById("filter");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");

async function loadCats() {
  const query = filter.value ? `?fed=${filter.value}` : "";
  const response = await fetch(`/api/cats${query}`);
  const cats = await response.json();

  list.innerHTML = "";

  if (!cats.length) {
    list.innerHTML = '<div class="empty">ยังไม่มีข้อมูลแมว 🐾</div>';
    return;
  }

  cats.forEach(cat => {
    const card = document.createElement("article");
    card.className = "cat-card";
    card.innerHTML = `
      <span class="badge ${cat.fed ? "done" : "wait"}">
        ${cat.fed ? "✓ ให้อาหารแล้ว" : "○ ยังไม่ได้ให้อาหาร"}
      </span>
      <h3>🐱 ${escapeHtml(cat.name)}</h3>
      <p>อายุ: ${cat.age} ปี</p>
      <p>อาหาร: ${escapeHtml(cat.food)}</p>
      <div class="card-actions">
        <button class="secondary" onclick="editCat(${cat.id})">แก้ไข</button>
        <button class="danger" onclick="deleteCat(${cat.id})">ลบ</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const id = document.getElementById("cat-id").value;
  const data = {
    name: document.getElementById("name").value,
    age: Number(document.getElementById("age").value),
    food: document.getElementById("food").value,
    fed: document.getElementById("fed").checked
  };

  const url = id ? `/api/cats/${id}` : "/api/cats";
  const method = id ? "PATCH" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.error || "เกิดข้อผิดพลาด");
    return;
  }

  resetForm();
  await loadCats();
});

async function editCat(id) {
  const response = await fetch(`/api/cats/${id}`);
  const cat = await response.json();

  document.getElementById("cat-id").value = cat.id;
  document.getElementById("name").value = cat.name;
  document.getElementById("age").value = cat.age;
  document.getElementById("food").value = cat.food;
  document.getElementById("fed").checked = cat.fed;

  formTitle.textContent = "แก้ไขข้อมูลแมว";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteCat(id) {
  if (!confirm("ต้องการลบข้อมูลแมวตัวนี้หรือไม่?")) return;

  const response = await fetch(`/api/cats/${id}`, { method: "DELETE" });

  if (!response.ok) {
    alert("ไม่สามารถลบข้อมูลได้");
    return;
  }

  await loadCats();
}

function resetForm() {
  form.reset();
  document.getElementById("cat-id").value = "";
  formTitle.textContent = "เพิ่มข้อมูลแมว";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);
filter.addEventListener("change", loadCats);
loadCats();
