// Đăng ký tính năng cuộn tới dòng của DataTables
$.fn.dataTable.Api.register('row().scrollTo()', function () {
    const rowIdx = this.index(); // Lấy chỉ số của dòng
    const rowNode = this.node(); // Lấy DOM của dòng
    const scrollContainer = $(rowNode).closest('.dataTables_scrollBody'); // Tìm container cuộn
    const offsetTop = $(rowNode).position().top + scrollContainer.scrollTop(); // Vị trí cuộn

    scrollContainer.animate({ scrollTop: offsetTop }, 500); // Cuộn đến dòng
});

// Kiểm tra email trùng lặp
function isEmailDuplicate(email, currentId, callback) {
    $.getJSON('/api/Employee', function (employees) {
        const duplicate = employees.some(emp => emp.email === email && emp.id !== currentId && !emp.daXoa);
        callback(duplicate);
    });
}

// Tải danh sách nhân viên
function loadEmployees(callback) {
    const table = $('#employeeTable').DataTable({
        destroy: true,
        ajax: {
            url: '/api/Employee',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'hoTen' },
            { data: 'chucVu' },
            {
                data: 'ngaySinh',
                render: function (data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { data: 'email' },
            {
                data: 'trangThai',
                render: function (data) {
                    return data ? 'Đang làm' : 'Đã nghỉ';
                }
            },
            {
                data: 'id',
                render: function (id) {
                    return `
                        <button class="btn btn-warning btn-sm btnEdit" data-id="${id}">Sửa</button>
                        <button class="btn btn-danger btn-sm btnDelete" data-id="${id}">Xóa</button>
                       <button class="btn btn-danger btn-sm btnDetail" data-id="${id}">Chi tiết</button>
                    `;
                }
            }
        ],
        language: {
            search: "Tìm kiếm:",
            paginate: { next: "Trang tiếp", previous: "Trang trước" },
            info: "Hiển thị từ _START_ đến _END_ trong tổng _TOTAL_ mục"
        },
        pageLength: 10
    });

    if (callback) callback(table);
    return table; // Trả về đối tượng DataTable
}

// Mở modal thêm mới
$('#btnAddEmployee').click(function () {
    $('#employeeId').val('');
    $('#hoTen').val('');
    $('#chucVu').val('');
    $('#ngaySinh').val('');
    $('#email').val('');
    $('#employeeModal').modal('show');
});

// Lưu nhân viên
$('#btnSaveEmployee').click(function () {
    const employeeId = $('#employeeId').val() ? parseInt($('#employeeId').val()) : 0; // ID hiện tại
    const email = $('#email').val();
    const emailField = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    if (!emailField.checkValidity()) {
        emailError.style.display = "block";
        emailError.textContent = "Email không hợp lệ!";
        return;
    } else {
        emailError.style.display = "none";
    }

    isEmailDuplicate(email, employeeId, function (isDuplicate) {
        if (isDuplicate) {
            emailError.style.display = "block";
            emailError.textContent = "Email đã tồn tại!";
            return;
        } else {
            emailError.style.display = "none";

            const employee = {
                id: employeeId,
                hoTen: $('#hoTen').val(),
                chucVu: $('#chucVu').val(),
                ngaySinh: $('#ngaySinh').val(),
                email: $('#email').val(),
                trangThai: true
            };

            if (!employee.hoTen || !employee.chucVu || !employee.ngaySinh) {
                alert("Vui lòng nhập đầy đủ thông tin.");
                return;
            }

            const url = employee.id ? `/api/Employee/${employee.id}` : '/api/Employee';
            const method = employee.id ? 'PUT' : 'POST';

            $.ajax({
                url: url,
                type: method,
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(employee),
                success: function (response) {
                    const table = $('#employeeTable').DataTable();

                    if (employee.id) {
                        // Cập nhật dòng nếu là chỉnh sửa
                        const rowIndex = table.rows().data().toArray().findIndex(row => row.id === response.id);
                        if (rowIndex >= 0) {
                            const row = table.row(rowIndex).data(response).draw(false); // Cập nhật dữ liệu và vẽ lại
                            row.scrollTo(); // Cuộn tới dòng vừa sửa
                        }
                    } else {
                        // Thêm dòng mới nếu là thêm
                        table.row.add(response).draw(false); // Thêm dữ liệu và vẽ lại
                        const rowIndex = table.rows().data().toArray().findIndex(row => row.id === response.id);
                        if (rowIndex >= 0) {
                            const page = Math.floor(rowIndex / table.page.len());
                            table.page(page).draw(false); // Chuyển tới đúng trang
                            setTimeout(() => {
                                table.row(rowIndex).scrollTo(); // Cuộn tới dòng vừa thêm
                            }, 500);
                        }
                    }

                    $('#employeeModal').modal('hide');
                },
                error: function (xhr) {
                    alert(`Thao tác thất bại: ${xhr.responseText}`);
                }
            });
        }
    });
});

// Sửa nhân viên
$('#employeeTable').on('click', '.btnEdit', function () {
    const id = $(this).data('id');
    $.getJSON(`/api/Employee/${id}`, function (e) {
        $('#employeeId').val(e.id);
        $('#hoTen').val(e.hoTen);
        $('#chucVu').val(e.chucVu);
        $('#ngaySinh').val(e.ngaySinh.split('T')[0]);
        $('#email').val(e.email);
        $('#employeeModal').modal('show');
    });
});

// Xóa nhân viên
$('#employeeTable').on('click', '.btnDelete', function () {
    const id = $(this).data('id');
    const table = $('#employeeTable').DataTable();

    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
        $.ajax({
            url: `/api/Employee/${id}`,
            type: 'DELETE',
            success: function () {
                // Giữ nguyên trạng thái phân trang
                table.ajax.reload(null, false);
            },
            error: function () {
                alert("Xóa thất bại.");
            }
        });
    }
});

// Xuất Excel
$('#btnExportExcel').click(function () {
    $.getJSON('/api/Employee', function (data) {
        const worksheet = XLSX.utils.json_to_sheet(data, { cellDates: true });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanVien");
        XLSX.writeFile(workbook, "DanhSachNhanVien.xlsx");
    });
});
// Xem chi tiết nhân viên
$('#employeeTable').on('click', '.btnDetail', function () {
    const id = $(this).data('id');
    $.getJSON(`/api/Employee/Details/${id}`, function (data) {
        $('#detailHoTen').text(data.hoTen);
        $('#detailChucVu').text(data.chucVu);
        $('#detailNgaySinh').text(new Date(data.ngaySinh).toLocaleDateString());
        $('#detailEmail').text(data.email);
        $('#detailTrangThai').text(data.trangThai ? 'Đang làm' : 'Đã nghỉ');
        $('#employeeDetailModal').modal('show');
    });
});

// Hiển thị chi tiết nhân viên khi bấm vào dòng trong bảng, trừ các hành động
$('#employeeTable').on('click', 'tr', function (event) {
    // Kiểm tra nếu click vào các nút hành động thì không thực hiện
    if ($(event.target).closest('.btnEdit, .btnDelete, .btnDetail').length > 0) {
        return;
    }

    const id = $(this).find('.btnDetail').data('id');
    if (id) {
        showEmployeeDetails(id);
    }
});

// Hàm hiển thị chi tiết nhân viên
function showEmployeeDetails(id) {
    $.getJSON(`/api/Employee/Details/${id}`, function (data) {
        $('#detailHoTen').text(data.hoTen);
        $('#detailChucVu').text(data.chucVu);
        $('#detailNgaySinh').text(new Date(data.ngaySinh).toLocaleDateString());
        $('#detailEmail').text(data.email);
        $('#detailTrangThai').text(data.trangThai ? 'Đang làm' : 'Đã nghỉ');
        $('#employeeDetailModal').modal('show');
    });
}

// Xem chi tiết nhân viên dạng chi tiết cho Details.cshtml-chưa chạy ok
$('#employeeTable').on('click', '.btnDetailView', function () {
    const id = $(this).data('id');
    window.location.href = `/Employees/Details/${id}`;
});

// Tải danh sách khi trang được load
$(document).ready(function () {
    loadEmployees();
});