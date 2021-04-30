using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public class Invoice
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }
        
        public Customer Customer { get; set; }

        public DateTime Date { get; set; }

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;

        public string Comments { get; set; }

        [InverseProperty(nameof(InvoiceLine.Invoice))]
        public List<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();

        public Invoice With(int quantity, Product p)
        {
            var line = this.Lines.FirstOrDefault(l => l.ProductId == p.Id);
            if (line != null)
            {
                line.Quantity += quantity;
                if (line.Quantity == 0)
                {
                    Lines.Remove(line);
                }
            }
            else if (quantity != 0)
            {
                Lines.Add(new InvoiceLine() { Invoice = this, Product = p, ProductId = p.Id, Quantity = quantity, UnitPrice = p.UnitPrice });
            }

            return this;
        }
    }
}
