$(document).ready(function () {
  const API_URL = "http://localhost:8080/api/employees";
  let isEditing = false;
  let currentNik = null;
  let allEmployees = []; // Menyimpan semua data karyawan
  let nikToDelete = null; // Menyimpan NIK yang akan dihapus

  // Load data karyawan saat halaman dimuat
  loadEmployees();
  loadJenisKelamin();

  // Load daftar karyawan
  function loadEmployees() {
    $.ajax({
      url: API_URL,
      method: "GET",
      success: function (data) {
        allEmployees = data; // Simpan data untuk pencarian
        displayEmployees(data);
      },
      error: function (xhr) {
        alert("Error loading employees: " + xhr.responseText);
      },
    });
  }

  // Tampilkan daftar karyawan
  function displayEmployees(employees) {
    const tbody = $("#employeeTable tbody");
    tbody.empty();

    employees.forEach(function (employee) {
      const row = `
        <tr>
            <td>${employee.nik}</td>
            <td>${employee.namaLengkap}</td>
            <td>${employee.jenisKelamin}</td>
            <td>${formatDate(employee.tanggalLahir)}</td>
            <td>${employee.alamat}</td>
            <td>${employee.negara}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning edit-btn" data-nik="${
                  employee.nik
                }">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" data-nik="${
                  employee.nik
                }">Hapus</button>
            </td>
        </tr>
      `;
      tbody.append(row);
    });
  }

  // Handle pencarian berdasarkan NIK
  $("#searchButton").click(function () {
    const searchNik = $("#searchNik").val();
    if (searchNik) {
      const filteredEmployees = allEmployees.filter((employee) =>
        employee.nik.toString().includes(searchNik)
      );
      displayEmployees(filteredEmployees);
    } else {
      displayEmployees(allEmployees);
    }
  });

  // Handle reset pencarian
  $("#resetSearch").click(function () {
    $("#searchNik").val("");
    displayEmployees(allEmployees);
  });

  // Handle pencarian saat menekan Enter
  $("#searchNik").on("keypress", function (e) {
    if (e.which === 13) {
      $("#searchButton").click();
    }
  });

  // Load jenis kelamin
  function loadJenisKelamin() {
    $.ajax({
      url: API_URL + "/jenis-kelamin",
      method: "GET",
      success: function (data) {
        const select = $("#jenisKelamin");
        select.empty();
        select.append('<option value="">Pilih Jenis Kelamin</option>');
        data.forEach(function (gender) {
          select.append(
            `<option value="${gender}">${formatJenisKelamin(gender)}</option>`
          );
        });
      },
      error: function (xhr) {
        alert("Error loading jenis kelamin: " + xhr.responseText);
      },
    });
  }

  // Format jenis kelamin untuk tampilan
  function formatJenisKelamin(gender) {
    return gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan";
  }

  // Format tanggal
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  }

  // Reset form
  function resetForm() {
    $("#employeeForm")[0].reset();
    isEditing = false;
    currentNik = null;
    $("#modalTitle").text("Tambah Karyawan");
    $("#nik").prop("readonly", false);
  }

  // Handle tambah karyawan
  $("#employeeModal").on("show.bs.modal", function () {
    if (!isEditing) {
      resetForm();
    }
  });

  // Handle simpan karyawan
  $("#saveEmployee").click(function () {
    const formData = {
      nik: $("#nik").val(),
      namaLengkap: $("#namaLengkap").val(),
      jenisKelamin: $("#jenisKelamin").val(),
      tanggalLahir: $("#tanggalLahir").val(),
      alamat: $("#alamat").val(),
      negara: $("#negara").val(),
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentNik}` : API_URL;

    $.ajax({
      url: url,
      method: method,
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function () {
        $("#employeeModal").modal("hide");
        loadEmployees();
        resetForm();
      },
      error: function (xhr) {
        alert("Error saving employee: " + xhr.responseText);
      },
    });
  });

  // Handle edit karyawan
  $(document).on("click", ".edit-btn", function () {
    const nik = $(this).data("nik");
    currentNik = nik;
    isEditing = true;

    $.ajax({
      url: `${API_URL}/${nik}`,
      method: "GET",
      success: function (employee) {
        $("#modalTitle").text("Edit Karyawan");
        $("#nik").val(employee.nik).prop("readonly", true);
        $("#namaLengkap").val(employee.namaLengkap);
        $("#jenisKelamin").val(employee.jenisKelamin);
        $("#tanggalLahir").val(employee.tanggalLahir);
        $("#alamat").val(employee.alamat);
        $("#negara").val(employee.negara);
        $("#employeeModal").modal("show");
      },
      error: function (xhr) {
        alert("Error loading employee: " + xhr.responseText);
      },
    });
  });

  // Handle hapus karyawan
  $(document).on("click", ".delete-btn", function () {
    nikToDelete = $(this).data("nik");
    $("#deleteNik").text(nikToDelete);
    $("#deleteConfirmModal").modal("show");
  });

  // Handle konfirmasi hapus
  $("#confirmDelete").click(function () {
    if (nikToDelete) {
      $.ajax({
        url: `${API_URL}/${nikToDelete}`,
        method: "DELETE",
        success: function () {
          $("#deleteConfirmModal").modal("hide");
          loadEmployees();
          nikToDelete = null;
        },
        error: function (xhr) {
          alert("Error deleting employee: " + xhr.responseText);
        },
      });
    }
  });

  // Reset nikToDelete saat modal ditutup
  $("#deleteConfirmModal").on("hidden.bs.modal", function () {
    nikToDelete = null;
  });
});
