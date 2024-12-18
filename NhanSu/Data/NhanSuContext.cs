using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NhanSu.Models;

namespace NhanSu.Data
{
    public class NhanSuContext : DbContext
    {
        public NhanSuContext(DbContextOptions<NhanSuContext> options)
            : base(options)
        {
        }

        public DbSet<Employee> Employees { get; set; }
    }
}
