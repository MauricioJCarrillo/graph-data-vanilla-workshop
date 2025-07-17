let currentData = [];
let filteredData = [];

// Datos de ejemplo para Colombia
const sampleData = `departamento,region,matricula,desercion,graduados,instituciones
Antioquia,Andina,850000,12.5,45000,450
Bogotá D.C.,Andina,920000,8.2,52000,380
Valle del Cauca,Andina,480000,14.1,28000,320
Cundinamarca,Andina,320000,11.8,18000,280
Santander,Andina,410000,13.2,22000,250
Atlántico,Caribe,380000,15.8,20000,180
Bolívar,Caribe,290000,16.5,15000,150
Córdoba,Caribe,250000,18.2,12000,140
Sucre,Caribe,180000,19.1,8000,95
Magdalena,Caribe,220000,17.8,10000,110
Meta,Orinoquia,150000,16.2,8000,85
Casanare,Orinoquia,95000,15.5,5000,60
Arauca,Orinoquia,80000,17.2,4000,45
Vichada,Orinoquia,25000,22.1,1200,25
Huila,Andina,280000,14.5,15000,180
Tolima,Andina,260000,15.2,14000,170
Boyacá,Andina,240000,13.8,13000,200
Nariño,Pacífica,320000,16.8,17000,190
Cauca,Pacífica,250000,17.5,13000,160
Chocó,Pacífica,120000,24.2,5000,80
Putumayo,Amazonia,85000,19.5,4000,55
Caquetá,Amazonia,110000,20.1,5500,65
Amazonas,Amazonia,45000,21.8,2000,35
Guainía,Amazonia,15000,23.5,800,20
Vaupés,Amazonia,12000,25.1,600,18`;

function loadSampleData() {
  Papa.parse(sampleData, {
    header: true,
    complete: function (results) {
      processData(results.data);
    },
  });
}

function processData(data) {
  // Limpiar datos
  currentData = data.filter((row) => row.departamento?.trim() !== "");

  // Convertir números
  currentData = currentData.map((row) => ({
    ...row,
    matricula: parseInt(row.matricula) || 0,
    desercion: parseFloat(row.desercion) || 0,
    graduados: parseInt(row.graduados) || 0,
    instituciones: parseInt(row.instituciones) || 0,
  }));

  updateRegionFilter();
  updateData();
}

function updateRegionFilter() {
  const regionFilter = document.getElementById("regionFilter");
  const regions = [...new Set(currentData.map((row) => row.region))];

  regionFilter.innerHTML = '<option value="">Todas las regiones</option>';
  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });
}

function updateData() {
  const regionFilter = document.getElementById("regionFilter").value;

  filteredData = currentData.filter((row) => {
    return !regionFilter || row.region === regionFilter;
  });

  updateStats();
  updateCharts();
  updateTable();
}

function updateStats() {
  if (filteredData.length === 0) return;

  const totalStudents = filteredData.reduce(
    (sum, row) => sum + row.matricula,
    0
  );

  const avgDesertion =
    filteredData.reduce((sum, row) => sum + row.desercion, 0) /
    filteredData.length;

  const totalGraduates = filteredData.reduce(
    (sum, row) => sum + row.graduados,
    0
  );

  const totalInstitutions = filteredData.reduce(
    (sum, row) => sum + row.instituciones,
    0
  );

  document.getElementById("totalStudents").textContent =
    totalStudents.toLocaleString();

  document.getElementById("avgDesertion").textContent =
    avgDesertion.toFixed(1) + "%";

  document.getElementById("totalGraduates").textContent =
    totalGraduates.toLocaleString();

  document.getElementById("totalInstitutions").textContent =
    totalInstitutions.toLocaleString();

  document.getElementById("statsGrid").style.display = "grid";
}

function updateCharts() {
  const metric = document.getElementById("metricSelect").value;

  updateBarChart("matriculaChart", "matricula", "Matrícula por Departamento");
  updateBarChart("desercionChart", "desercion", "Deserción por Departamento");
}

function updateBarChart(containerId, metric, title) {
  const container = document.getElementById(containerId);
  const chartTitle = container.previousElementSibling;
  chartTitle.textContent = title;

  if (filteredData.length === 0) {
    container.innerHTML =
      '<div class="loading">No hay datos para mostrar</div>';
    return;
  }

  // Ordenar datos por métrica
  const sortedData = [...filteredData]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10);
  const maxValue = Math.max(...sortedData.map((row) => row[metric]));

  const barChart = document.createElement("div");
  barChart.className = "bar-chart";

  sortedData.forEach((row) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    const height = (row[metric] / maxValue) * 100;
    bar.style.height = height + "%";
    bar.style.flex = "1";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent =
      row.departamento.substring(0, 8) +
      (row.departamento.length > 8 ? "..." : "");

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent =
      metric === "desercion"
        ? row[metric].toFixed(1) + "%"
        : row[metric].toLocaleString();

    bar.appendChild(label);
    bar.appendChild(value);
    barChart.appendChild(bar);
  });

  container.innerHTML = "";
  container.appendChild(barChart);
}

function updateTable() {
  const tableContainer = document.getElementById("tableContainer");

  if (filteredData.length === 0) {
    tableContainer.innerHTML =
      '<div class="loading">No hay datos para mostrar</div>';
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
                <thead>
                    <tr>
                        <th>Departamento</th>
                        <th>Región</th>
                        <th>Matrícula</th>
                        <th>Deserción (%)</th>
                        <th>Graduados</th>
                        <th>Instituciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData
                      .map(
                        (row) => `
                        <tr>
                            <td>${row.departamento}</td>
                            <td>${row.region}</td>
                            <td>${row.matricula.toLocaleString()}</td>
                            <td>${row.desercion.toFixed(1)}%</td>
                            <td>${row.graduados.toLocaleString()}</td>
                            <td>${row.instituciones.toLocaleString()}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            `;

  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

// Event listeners
document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        processData(results.data);
      },
      error: function (error) {
        console.error("Error al leer el archivo:", error);
        alert("Error al leer el archivo CSV");
      },
    });
  }
});

document.getElementById("regionFilter").addEventListener("change", updateData);
document
  .getElementById("metricSelect")
  .addEventListener("change", updateCharts);

// Cargar datos de ejemplo al inicio
loadSampleData();
