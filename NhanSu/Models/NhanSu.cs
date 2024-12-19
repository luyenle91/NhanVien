using System.ComponentModel.DataAnnotations;

namespace NhanSu.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? HoTen { get; set; }

        [Required]
        public string? ChucVu { get; set; }

        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}")]
        public DateTime NgaySinh { get; set; }

        public string? Email { get; set; }

        public DateTime NgayTao { get; set; }

        public DateTime NgaySua { get; set; }

        // Trạng thái nhân viên: true - đang làm, false - đã nghỉ
        public bool TrangThai { get; set; } = true;

        // Đánh dấu đã xóa: true - đã xóa, false - chưa xóa
        public bool DaXoa { get; set; } = false;
        // Constructor để gắn giá trị mặc định
        public Employee()
        {
            TrangThai = true; // Mặc định là đang làm
            DaXoa = false;    // Mặc định chưa bị xóa
            NgayTao = DateTime.Now; // Gắn giá trị hiện tại cho NgayTao
        }
    }
}