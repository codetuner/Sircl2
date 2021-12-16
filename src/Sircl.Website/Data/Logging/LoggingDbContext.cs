using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Logging
{
    public class LoggingDbContext : DbContext
    {
        public LoggingDbContext(DbContextOptions<LoggingDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RequestLog>()
                .Property(e => e.Data)
                .HasConversion(
                v => JsonSerializer.Serialize(v, null),
                s => JsonSerializer.Deserialize<Dictionary<string, string>>(s, null),
                new ValueComparer<Dictionary<string, string>>(
                    (v1, v2) => String.Equals(JsonSerializer.Serialize(v1, null), JsonSerializer.Serialize(v2, null)),
                    v => JsonSerializer.Serialize(v, null).GetHashCode(),
                    v => v.ToDictionary(p => p.Key, p => p.Value)
                )
            );

            modelBuilder.Entity<RequestLog>()
                .Property(e => e.Request)
                .HasConversion(
                j => JsonSerializer.Serialize(j, null),
                s => JsonSerializer.Deserialize<Dictionary<string, string>>(s, null),
                new ValueComparer<Dictionary<string, string>>(
                    (v1, v2) => String.Equals(JsonSerializer.Serialize(v1, null), JsonSerializer.Serialize(v2, null)),
                    v => JsonSerializer.Serialize(v, null).GetHashCode(),
                    v => v.ToDictionary(p => p.Key, p => p.Value)
                )
            );
        }

        public DbSet<RequestLog> RequestLogs { get; set; }
    }
}
