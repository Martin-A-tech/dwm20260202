function agregarProducto() {
    let cmb = document.getElementById("cmbProducto");
    let id = document.getElementById("txtId").value;
    let nombre = document.getElementById("txtNombre").value;

    if (id.trim() === "" || nombre.trim() === "") {
        alert("⚠️ Por favor, completa ambos campos (ID y Nombre).");
        return;
    }

    let btn = document.querySelector("#btnAgregar");
    let spinner = document.querySelector("#spinnerAgregar");
    let btnText = document.querySelector("#btnText");
    
    btn.disabled = true;
    spinner.classList.remove("d-none");
    btnText.innerText = "Agregando...";

    setTimeout(() => {
        let opt = document.createElement("option");
        opt.setAttribute("value", id);
        opt.innerText = nombre;
        cmb.appendChild(opt);

        document.getElementById("txtId").value = "";
        document.getElementById("txtNombre").value = "";
        document.getElementById("txtId").focus();

        btn.disabled = false;
        spinner.classList.add("d-none");
        btnText.innerText = "Agregar";
    }, 500);
}

const responseAPI = {
    "status": 200,
    "message": "Productos Obtenidos Correctamente",
    "data": [
        {"id": "1", "nombre": "Martillo", "precio": 4590},
        {"id": "2", "nombre": "Tijera", "precio": 3200},
        {"id": "3", "nombre": "Destornillador", "precio": 2800},
        {"id": "4", "nombre": "Llave Inglesa", "precio": 12500}
    ]
};

function cargarProductos() {
    let spinnerDiv = document.getElementById("spinnerCarga");
    let contenidoDiv = document.getElementById("contenidoCargado");

    spinnerDiv.classList.remove("d-none");
    contenidoDiv.classList.add("d-none");

    setTimeout(() => {
        let cmb = document.getElementById("cmbProducto");
        cmb.innerHTML = '<option value="">-- Selecciona un producto --</option>';

        responseAPI.data.forEach((prod) => {
            let opt = document.createElement("option");
            opt.setAttribute("value", prod.id);
            opt.innerText = `${prod.nombre} - $${prod.precio}`;
            cmb.appendChild(opt);
        });

        spinnerDiv.classList.add("d-none");
        contenidoDiv.classList.remove("d-none");
    }, 1500);
}