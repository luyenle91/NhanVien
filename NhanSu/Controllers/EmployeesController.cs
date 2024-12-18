using Microsoft.AspNetCore.Mvc;

namespace NhanSu.Controllers
{
    public class EmployeesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}