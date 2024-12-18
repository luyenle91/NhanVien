using Microsoft.AspNetCore.Mvc;
using NhanSu.Models;
using NhanSu.Data;
using System.Linq;

namespace NhanSu.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly NhanSuContext _context;

        public EmployeeController(NhanSuContext context)
        {
            _context = context;
        }

        // GET: api/Employee
        [HttpGet]
        public IActionResult GetEmployees()
        {
            var employees = _context.Employees
                .Where(e => !e.DaXoa)
                .Select(e => new
                {
                    e.Id,
                    e.HoTen,
                    e.ChucVu,
                    e.NgaySinh,
                    e.Email,
                    e.TrangThai
                })
                .ToList();

            return Ok(employees);
        }

        // GET: api/Employee/id
        [HttpGet("{id}")]
        public IActionResult GetEmployees(int id)
        {
            var employees = _context.Employees
                .Where(e => !e.DaXoa && e.Id == id)
                .Select(e => new
                {
                    e.Id,
                    e.HoTen,
                    e.ChucVu,
                    e.NgaySinh,
                    e.Email,
                    e.TrangThai
                })
                .FirstOrDefault();

            if (employees == null)
            {
                return NotFound("Không tìm thấy nhân viên.");
            }

            return Ok(employees);
        }

        // POST: api/Employee
        [HttpPost]
        public IActionResult AddEmployee([FromBody] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // Kiểm tra email không trùng lặp (không tính các trạng thái đã xóa)
            var existingEmployee = _context.Employees
                .FirstOrDefault(e => e.Email == employee.Email && !e.DaXoa);
            if (existingEmployee != null)
            {
                return BadRequest("Email đã tồn tại.");
            }

            employee.NgayTao = DateTime.Now;
            _context.Employees.Add(employee);
            _context.SaveChanges();
            return Ok(employee);
        }

        // PUT: api/Employee/5
        [HttpPut("{id:int}")]
        public IActionResult UpdateEmployee(int id, [FromBody] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = _context.Employees.Find(id);
            if (existing == null) return NotFound("Không tìm thấy nhân viên.");

            // Kiểm tra email không trùng lặp, loại trừ nhân viên hiện tại
            var duplicateEmail = _context.Employees
                .FirstOrDefault(e => e.Email == employee.Email && e.Id != id && !e.DaXoa);
            if (duplicateEmail != null)
            {
                return Conflict(new { error = "Email đã tồn tại." });
            }

            // Cập nhật dữ liệu
            existing.HoTen = employee.HoTen;
            existing.ChucVu = employee.ChucVu;
            existing.NgaySinh = employee.NgaySinh;
            existing.Email = employee.Email;
            existing.TrangThai = employee.TrangThai;
            existing.NgaySua = DateTime.Now;

            _context.SaveChanges();
            return Ok(existing);
        }

        // DELETE: api/Employee/5
        [HttpDelete("{id}")]
        public IActionResult DeleteEmployee(int id)
        {
            var employee = _context.Employees.Find(id);
            if (employee == null) return NotFound();

            employee.DaXoa = true;
            _context.SaveChanges();
            return Ok();
        }
    }
}