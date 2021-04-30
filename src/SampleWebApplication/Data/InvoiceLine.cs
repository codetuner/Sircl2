using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public class InvoiceLine
    {
        public int Id { get; set; }

        public int InvoiceId { get; set; }

        public Invoice Invoice { get; set; }

        public int ProductId { get; set; }

        public Product Product { get; set; }

        public int Quantity { get; set; } = 1;

        public decimal UnitPrice { get; set; }
    }
}
